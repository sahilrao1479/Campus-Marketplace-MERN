import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Rental from '../models/Rental.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;

            // Since changing email might mean changing university, we might want to prevent it or require re-auth.
            // Keeping it simple for now and just allowing name update.
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            const alreadyInWishlist = user.wishlist.find(id => id.toString() === productId);

            if (alreadyInWishlist) {
                user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
            } else {
                user.wishlist.push(productId);
            }

            await user.save();
            res.json(user.wishlist);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user listings
// @route   GET /api/users/listings
// @access  Private
export const getUserListings = async (req, res) => {
    try {
        const listings = await Product.find({ seller: req.user._id }).populate('category');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user purchases (orders)
// @route   GET /api/users/purchases
// @access  Private
export const getUserPurchases = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id }).populate('product seller');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user rentals
// @route   GET /api/users/rentals
// @access  Private
export const getUserRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ renter: req.user._id }).populate('product owner');
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (ADMIN)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Block user (ADMIN)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBlocked = !user.isBlocked;
            await user.save();
            res.json({ message: user.isBlocked ? 'User blocked' : 'User unblocked' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
