import express from 'express';
import { generatePassQR, verifyPass } from '../controllers/passController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for verification (public facing)
const verifyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per `window` (here, per minute)
    message: 'Too many verification attempts from this IP, please try again after a minute',
    standardHeaders: true,
    legacyHeaders: false,
});

// @desc    Generate composite QR image for pass
// @route   GET /api/pass/:registrationId/generate-qr
// @access  Public (so the IMG tag can load it securely without auth headers)
router.get('/:registrationId/generate-qr', generatePassQR);

// @desc    Verify QR pass scan
// @route   GET /api/pass/verify/:registrationId
// @access  Public (admin scans from any phone, but limited)
router.get('/verify/:registrationId', verifyLimiter, verifyPass);

export default router;
