import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcrypt';

// @desc    Register a new user & send OTP
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const emailRegex = /.+@(chitkara\.edu\.in|chitkarauniversity\.edu\.in)$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Only Chitkara domain emails are allowed' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain 1 uppercase, 1 lowercase, 1 number, and 1 special character' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            if (userExists.isVerified) {
                return res.status(400).json({ message: 'User already exists' });
            } else {
                // Resend OTP if not verified
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                userExists.otp = otp;
                userExists.name = name;
                userExists.password = password; // Will be re-hashed on save
                userExists.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

                await userExists.save();

                await sendEmail({
                    email: userExists.email,
                    subject: 'Campus Thrift Store - Verify OTP',
                    message: `Your OTP is ${otp}. It will expire in 10 minutes.`,
                });

                return res.status(200).json({
                    message: 'OTP resent to email',
                    ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
                });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        const user = await User.create({
            name,
            email,
            password,
            otp,
            otpExpiry,
        });

        if (user) {
            await sendEmail({
                email: user.email,
                subject: 'Campus Thrift Store - Verify OTP',
                message: `Your account registration OTP is ${otp}. It will expire in 10 minutes.`,
            });

            res.status(201).json({
                message: 'Registration initiated. Please verify OTP sent to email.',
                ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and Create Account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;

        // Set admin role if matches env setting
        if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
            user.role = 'admin';
        }

        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(res, user._id),
            message: 'Account verified successfully',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first via OTP' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked by admin' });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(res, user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;

        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Campus Thrift Store - Password Reset OTP',
            message: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
        });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain 1 uppercase, 1 lowercase, 1 number, and 1 special character' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
