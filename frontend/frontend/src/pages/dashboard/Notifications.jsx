import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, Package, ShoppingBag, MessageSquare } from 'lucide-react';

const iconMap = {
    product: <Package size={20} className="text-blue-500" />,
    purchase: <ShoppingBag size={20} className="text-green-500" />,
    message: <MessageSquare size={20} className="text-purple-500" />,
    default: <Bell size={20} className="text-slate-500" />,
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await axios.get('/api/notifications');
                setNotifications(data);
            } catch (error) {
                // API might not be set up yet — show empty state
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch {
            // no-op
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500 mt-1">Stay updated on your listings and purchases</p>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        <CheckCheck size={16} /> Mark all read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">All caught up!</h3>
                        <p className="text-slate-500 mt-1 text-sm">You have no notifications right now. We'll let you know when something happens.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {notifications.map(n => (
                            <li key={n._id} className={`px-6 py-4 flex gap-4 items-start hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-primary-50' : ''}`}>
                                <div className="mt-1 flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                                    {iconMap[n.type] || iconMap.default}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{n.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                                </div>
                                {!n.isRead && <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-primary-600" />}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
