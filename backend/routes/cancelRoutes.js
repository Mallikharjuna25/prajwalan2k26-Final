import express from 'express';
import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get event cancellation preview
// @route   GET /api/events/:eventId/cancel-preview
// @access  Private/Organizer
router.get('/:eventId/cancel-preview', protect, authorize('organizer'), asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const registrations = await Registration.find({ event: eventId })
        .populate('student', 'name email rollNumber');

    const participants = registrations.map(r => ({
        registrationId: r._id,
        studentName: r.student?.name || r.studentName,
        email: r.student?.email || r.studentEmail,
        rollNumber: r.registerNumber,
        amountPaid: r.paymentStatus === 'PAID' ? (r.event?.registrationFee || 0) : 0,
        paymentStatus: r.paymentStatus,
        refundStatus: r.refundStatus === 'NOT_APPLICABLE' && r.paymentStatus === 'PAID' ? 'PENDING' : r.refundStatus,
        refundId: r.refundId,
        refundAmount: r.refundAmount,
    }));

    const paidCount = registrations.filter(p => p.paymentStatus === 'PAID').length;
    const refundedCount = registrations.filter(p => p.refundStatus === 'REFUNDED').length;
    const failedCount = registrations.filter(p => p.refundStatus === 'FAILED').length;
    const totalRefund = registrations
        .filter(p => p.paymentStatus === 'PAID')
        .reduce((sum, p) => sum + (event.registrationFee || 0), 0);

    res.json({
        event: {
            name: event.title,
            status: event.status,
            date: event.date,
            venue: event.venue,
        },
        participants,
        summary: {
            totalParticipants: participants.length,
            paidCount,
            freeCount: participants.length - paidCount,
            refundedCount,
            failedCount,
            totalRefund,
            progressPercent: paidCount > 0 ? Math.round((refundedCount / paidCount) * 100) : 100,
        }
    });
}));

// @desc    Initiate mock refunds for all paid participants
// @route   POST /api/events/:eventId/initiate-refunds
// @access  Private/Organizer
router.post('/:eventId/initiate-refunds', protect, authorize('organizer'), asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    await Event.findByIdAndUpdate(eventId, { cancellationInProgress: true });

    const registrations = await Registration.find({
        event: eventId,
        paymentStatus: 'PAID',
        refundStatus: { $in: ['PENDING', 'FAILED', 'NOT_APPLICABLE', null] }
    });

    if (registrations.length === 0) {
        return res.json({ success: true, message: 'No paid participants to refund', refunded: 0 });
    }

    // Process mock refunds
    for (const reg of registrations) {
        // Mark as PROCESSING immediately
        await Registration.findByIdAndUpdate(reg._id, {
            refundStatus: 'PROCESSING',
            refundInitiatedAt: new Date(),
            refundId: `mock_rfnd_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
        });

        // In a real mock, we would use a timeout or a background job.
        // For this demo, we'll let verify-refunds handle the transition.
    }

    res.json({
        success: true,
        message: `Mock refunds initiated for ${registrations.length} participants`,
        total: registrations.length
    });
}));

// @desc    Verify mock refunds (Simulation logic)
// @route   POST /api/events/:eventId/verify-refunds
// @access  Private/Organizer
router.post('/:eventId/verify-refunds', protect, authorize('organizer'), asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const processing = await Registration.find({
        event: eventId,
        refundStatus: 'PROCESSING'
    });

    const updates = [];
    for (const reg of processing) {
        // Mock logic: 80% chance to succeed each check
        const isSuccess = Math.random() < 0.8;
        const newStatus = isSuccess ? 'REFUNDED' : 'PROCESSING';

        if (isSuccess) {
            await Registration.findByIdAndUpdate(reg._id, {
                refundStatus: 'REFUNDED',
                refundCompletedAt: new Date(),
                refundAmount: reg.refundAmount || 0 // Should be properly set from event fee
            });
        }
        updates.push({ registrationId: reg._id, status: newStatus });
    }

    res.json({ success: true, updates });
}));

// @desc    Retry failed refunds
// @route   POST /api/events/:eventId/retry-failed-refunds
// @access  Private/Organizer
router.post('/:eventId/retry-failed-refunds', protect, authorize('organizer'), asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const result = await Registration.updateMany(
        { event: eventId, refundStatus: 'FAILED' },
        { refundStatus: 'PENDING', refundId: null }
    );

    res.json({ success: true, retrying: result.modifiedCount });
}));

// @desc    Mark manual refund
// @route   POST /api/events/:eventId/mark-manual-refund
// @access  Private/Organizer
router.post('/:eventId/mark-manual-refund', protect, authorize('organizer'), asyncHandler(async (req, res) => {
    const { registrationId, note, amount } = req.body;

    await Registration.findByIdAndUpdate(registrationId, {
        refundStatus: 'REFUNDED',
        refundAmount: amount,
        manualRefund: true,
        manualRefundNote: note || 'Manually refunded by organiser',
        refundCompletedAt: new Date(),
        status: 'CANCELLED' // Also mark registration as cancelled
    });

    res.json({ success: true });
}));

// @desc    Final step to cancel event
// @route   POST /api/events/:eventId/cancel
// @access  Private/Organizer
router.post('/:eventId/cancel', protect, authorize('organizer'), asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const paidRegistrations = await Registration.find({ event: eventId, paymentStatus: 'PAID' });
    const pendingRefunds = paidRegistrations.filter(r => r.refundStatus !== 'REFUNDED');

    if (pendingRefunds.length > 0) {
        return res.status(400).json({
            error: `Cannot cancel event. ${pendingRefunds.length} refunds are still pending or failed.`,
            unrefundedCount: pendingRefunds.length
        });
    }

    // Cancel event
    const event = await Event.findByIdAndUpdate(eventId, {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationInProgress: false,
        isActive: false,
        totalRefundAmount: paidRegistrations.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
    });

    // Update all registrations
    await Registration.updateMany({ event: eventId }, { status: 'CANCELLED' });

    // Add log
    await Event.findByIdAndUpdate(eventId, {
        $push: {
            eventLog: {
                action: 'Event Cancelled by Organiser',
                timestamp: new Date(),
                meta: `All ${paidRegistrations.length} paid participants refunded (Simulated)`
            }
        }
    });

    // Notify students
    const registrations = await Registration.find({ event: eventId }).populate('student');
    const notifications = registrations.map(reg => ({
        userId: reg.student?._id || reg.student,
        type: 'EVENT_CANCELLED',
        title: 'Event Cancelled',
        message: `The event "${event.title}" has been cancelled. ${reg.paymentStatus === 'PAID' ? 'Your refund has been initiated.' : 'Your registration is cancelled.'}`,
        eventId: eventId
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    res.json({
        success: true,
        message: 'Event successfully cancelled and participants notified.',
        totalRefunded: paidRegistrations.length,
    });
}));

export default router;
