import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    toggleWishlist,
    getUserListings,
    getUserPurchases,
    getUserRentals,
    getUsers,
    blockUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.route('/').get(protect, admin, getUsers);
router.route('/:id/block').put(protect, admin, blockUser);

// User routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/wishlist').post(protect, toggleWishlist);
router.route('/listings').get(protect, getUserListings);
router.route('/purchases').get(protect, getUserPurchases);
router.route('/rentals').get(protect, getUserRentals);

export default router;
