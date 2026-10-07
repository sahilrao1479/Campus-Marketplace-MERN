import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);



// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
    });

    socket.on('sendMessage', (messageData) => {
        // Emit to the receiver
        io.to(messageData.receiver).emit('newMessage', messageData);
    });

    socket.on('sendNotification', (notificationData) => {
        io.to(notificationData.user).emit('newNotification', notificationData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());

// Serve uploaded images (dev mode - local disk)
app.use('/uploads', express.static('uploads'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, 
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Central Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});




















