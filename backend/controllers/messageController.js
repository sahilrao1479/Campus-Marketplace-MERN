import Message from '../models/Message.js';

// @desc    Get messages between logged in user and another user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, productId } = req.body;

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content,
            product: productId || null,
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat contacts (people user has messaged)
// @route   GET /api/messages/contacts/list
// @access  Private
export const getChatContacts = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        }).populate('sender receiver', 'name email');

        // Extract unique contacts
        const contactsSet = new Map();
        messages.forEach((msg) => {
            let contact = msg.sender._id.toString() === currentUserId.toString()
                ? msg.receiver
                : msg.sender;

            if (!contactsSet.has(contact._id.toString())) {
                contactsSet.set(contact._id.toString(), contact);
            }
        });

        res.json(Array.from(contactsSet.values()));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
