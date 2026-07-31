import express from 'express';
import { submitFeedback, checkFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const studentOnly = authorize('student');
const router = express.Router();

router.post('/submit', protect, studentOnly, submitFeedback);
router.get('/check/:eventId', protect, studentOnly, checkFeedback);

export default router;
