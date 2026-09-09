import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Messages() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialUserId = queryParams.get('user');

    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Fetch contacts
        const fetchContacts = async () => {
            try {
                const { data } = await axios.get('/api/messages/contacts/list');
                setContacts(data);

                // If query param passed to initiate chat
                if (initialUserId && !data.find(c => c._id === initialUserId)) {
                    // We might need to fetch the specific user or just trust they exist 
                    // For simplicity, we just add a manual placeholder contact
                    setContacts(prev => [{ _id: initialUserId, name: 'Loading...', email: '' }, ...prev]);
                    setActiveContact({ _id: initialUserId });
                } else if (initialUserId) {
                    setActiveContact(data.find(c => c._id === initialUserId));
                } else if (data.length > 0) {
                    setActiveContact(data[0]);
                }
            } catch (error) {
                console.error('Error fetching contacts', error);
            }
        };
        fetchContacts();
    }, [initialUserId]);

    useEffect(() => {
        if (!activeContact) return;

        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(`/api/messages/${activeContact._id}`);
                setMessages(data);
                scrollToBottom();
            } catch (error) {
                console.error('Error fetching messages', error);
            }
        };
        fetchMessages();
    }, [activeContact]);

    useEffect(() => {
        if (socket) {
            socket.on('newMessage', (msg) => {
                // Only append if it belongs to the active chat
                if (activeContact && (msg.sender === activeContact._id || msg.receiver === activeContact._id)) {
                    setMessages((prev) => [...prev, msg]);
                    scrollToBottom();
                }
            });
        }
        return () => {
            if (socket) socket.off('newMessage');
        };
    }, [socket, activeContact]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeContact) return;

        try {
            const { data } = await axios.post('/api/messages', {
                receiverId: activeContact._id,
                content: newMessage,
            });

            setMessages((prev) => [...prev, data]);
            setNewMessage('');
            scrollToBottom();

            // Emit via socket
            if (socket) {
                socket.emit('sendMessage', data);
            }
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex overflow-hidden lg:h-[700px] h-[calc(100vh-200px)]">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-slate-100 bg-slate-50 overflow-y-auto">
                <div className="p-4 border-b border-slate-100 sticky top-0 bg-slate-50 z-10">
                    <h2 className="text-xl font-bold text-slate-900">Conversations</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {contacts.map((contact) => (
                        <button
                            key={contact._id}
                            onClick={() => setActiveContact(contact)}
                            className={`w-full text-left p-4 flex items-center space-x-3 hover:bg-white transition-colors
                ${activeContact?._id === contact._id ? 'bg-white border-l-4 border-primary-500' : 'border-l-4 border-transparent'}
              `}
                        >
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold flex-shrink-0">
                                {contact.name?.charAt(0) || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-slate-900 truncate">{contact.name}</p>
                            </div>
                        </button>
                    ))}
                    {contacts.length === 0 && (
                        <p className="p-4 text-slate-500 text-center">No active chats.</p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-white">
                {activeContact ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-white flex items-center shadow-sm z-10">
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-3">
                                {activeContact.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{activeContact.name}</h3>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMine = msg.sender === user._id;
                                return (
                                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine
                                                    ? 'bg-primary-600 text-white rounded-br-none'
                                                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-100' : 'text-slate-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form onSubmit={handleSend} className="flex space-x-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-primary-600 text-white rounded-full p-3 font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center w-12 h-12 flex-shrink-0"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
