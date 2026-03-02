import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import { seedAdmin } from './utils/seedAdmin.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import passRoutes from './routes/passRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import cancelRoutes from './routes/cancelRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
    seedAdmin(); // Seed initial admin after connection
});

const app = express();

// Middleware
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

console.log('CORS allowed origins:', allowedOrigins);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));

// Static Path
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/pass', passRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/events/cancellation', cancelRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Health check endpoint (used by keep-alive ping)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

    // Keep-alive: ping self every 14 min to prevent Render free-tier sleep
    if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
        const PING_INTERVAL = 14 * 60 * 1000;
        setInterval(async () => {
            try {
                const { default: https } = await import('https');
                https.get(`${process.env.RENDER_EXTERNAL_URL}/api/health`, (res) => {
                    console.log(`Keep-alive ping sent: ${res.statusCode}`);
                }).on('error', () => { });
            } catch (e) { }
        }, PING_INTERVAL);
        console.log('Keep-alive ping enabled');
    }
});
