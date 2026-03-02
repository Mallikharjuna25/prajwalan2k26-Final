import express from 'express';
import {
    getProfile, getEvents, registerForEvent, getMyEvents, getAnalytics
} from '../controllers/studentController.js';
import { protect, authorize, checkApproved } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(authorize('student'));

// Profile
router.get('/profile', getProfile);

// Routes requiring approval
router.get('/events', checkApproved, getEvents);
router.post('/events/:eventId/register', checkApproved, registerForEvent);
router.get('/my-events', checkApproved, getMyEvents);
router.get('/analytics', checkApproved, getAnalytics);

export default router;
