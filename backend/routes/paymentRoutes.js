import express from 'express';
import { createCheckoutSession, verifySession, renderGateway, processPayment, renderPaymentsList } from '../controllers/paymentController.js';
import { protect, authorize, checkApproved } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing API Routes (React axios)
router.post('/create-checkout-session', protect, authorize('student'), checkApproved, createCheckoutSession);
router.post('/verify-session', protect, authorize('student'), checkApproved, verifySession);

// New EJS Mock Gateway Routes (Browser redirects, so unprotected)
router.get('/gateway/:registrationId', renderGateway);
router.post('/process/:registrationId', processPayment);
router.get('/history', renderPaymentsList);

export default router;
