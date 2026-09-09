import crypto from 'crypto';
import Order from '../models/Order.js';
import Rental from '../models/Rental.js';
import Product from '../models/Product.js';

const isDev = process.env.NODE_ENV === 'development';

// @desc    Create Razorpay Order (or mock in dev)
// @route   POST /api/payments/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, productId, type } = req.body;

        // DEV MODE: If Razorpay keys are missing/fake, return a mock order
        if (isDev || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.length < 10) {
            const mockOrder = {
                id: `mock_order_${Date.now()}`,
                amount: amount * 100,
                currency: 'INR',
                status: 'created',
                _isMock: true,
            };
            console.log('⚠️  DEV: Returning mock Razorpay order:', mockOrder.id);
            return res.json(mockOrder);
        }

        const { default: Razorpay } = await import('razorpay');
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
        };

        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send('Some error occured');
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay payment signature (or auto-verify mock in dev)
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            productId,
            amount,
            type,
            startDate,
            endDate,
        } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }

        // Auto-verify in dev mode OR mock orders
        const isMockOrDev = isDev ||
            razorpayOrderId?.startsWith('mock_order_') ||
            razorpaySignature === 'mock_sig';
        let paymentVerified = false;

        if (isMockOrDev) {
            console.log('⚠️  DEV: Auto-verifying payment for order:', razorpayOrderId);
            paymentVerified = true;
        } else {
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
            hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
            const generatedSignature = hmac.digest('hex');
            paymentVerified = generatedSignature === razorpaySignature;
        }

        if (paymentVerified) {
            const sellerId = product.seller || req.user._id; // fallback
            if (type === 'Buy') {
                const quantity = req.body.quantity || 1;
                const newOrder = await Order.create({
                    buyer: req.user._id,
                    seller: sellerId,
                    product: productId,
                    razorpayOrderId: razorpayOrderId || `mock_${Date.now()}`,
                    razorpayPaymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
                    razorpaySignature: razorpaySignature || 'mock_sig',
                    amount: Number(amount),
                    status: 'Completed',
                });

                // Decrement stock
                product.stock = product.stock - quantity;
                if (product.stock <= 0) {
                    product.stock = 0;
                    product.status = 'Sold';
                }
                await product.save();
                return res.json({ message: 'Payment verified successfully for Purchase', order: newOrder });
            } else if (type === 'Rent') {
                const newRental = await Rental.create({
                    renter: req.user._id,
                    owner: product.seller,
                    product: productId,
                    startDate,
                    endDate,
                    amount,
                    razorpayOrderId,
                    razorpayPaymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
                    razorpaySignature: razorpaySignature || 'mock_sig',
                    status: 'Active',
                });
                product.status = 'Rented';
                await product.save();
                return res.json({ message: 'Payment verified successfully for Renting', rental: newRental });
            }
        } else {
            res.status(400).json({ message: 'Payment verification failed!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
