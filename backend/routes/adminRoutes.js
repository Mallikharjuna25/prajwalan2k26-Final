import express from 'express';
import {
    getPendingStudents, getCollegesOverview, approveStudent, rejectStudent,
    getPendingOrganizers, approveOrganizer, rejectOrganizer
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/students/pending', getPendingStudents);
router.get('/colleges', getCollegesOverview);
router.patch('/students/:id/approve', approveStudent);
router.patch('/students/:id/reject', rejectStudent);

router.get('/organizers/pending', getPendingOrganizers);
router.patch('/organizers/:id/approve', approveOrganizer);
router.patch('/organizers/:id/reject', rejectOrganizer);

export default router;
