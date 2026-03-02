import express from 'express';
import {
    getProfile, createEvent, getMyEvents, getEventParticipants, scanQR, previewScan, editEvent
} from '../controllers/organizerController.js';
import { protect, authorize, checkApproved } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('organizer'));

router.get('/profile', getProfile);

router.post('/events', checkApproved, createEvent);
router.put('/events/:eventId', checkApproved, editEvent);
router.get('/events', checkApproved, getMyEvents);
router.get('/events/:eventId/participants', checkApproved, getEventParticipants);
router.post('/events/:eventId/scan-preview', checkApproved, previewScan);
router.post('/events/:eventId/scan', checkApproved, scanQR);

export default router;
