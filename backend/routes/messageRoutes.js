import express from 'express';
import { getMessages, sendMessage, getChatContacts } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/contacts/list').get(protect, getChatContacts);
router.route('/:userId').get(protect, getMessages);
router.route('/').post(protect, sendMessage);

export default router;
