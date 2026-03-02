import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { generateQRCode } from '../utils/generateQR.js';
import { sendQRCodeEmail } from '../utils/mailer.js';
import mongoose from 'mongoose';

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private / Student
export const getProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id).select('-password');
    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Get all active events
// @route   GET /api/student/events
// @access  Private / Student / Approved
export const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ isActive: true }).populate('organizer', 'collegeName');
    res.json(events);
});

// @desc    Register for Event
// @route   POST /api/student/events/:eventId/register
// @access  Private / Student / Approved
export const registerForEvent = asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;
    const { customFieldData } = req.body;

    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
        res.status(404);
        throw new Error('Active Event not found');
    }

    // Check if participant count exceeded
    if (event.registrationCount >= event.capacity) {
        res.status(400);
        throw new Error('Event registration is full');
    }

    // Check if student already registered
    const alreadyRegistered = await Registration.findOne({ student: req.user._id, event: eventId });
    if (alreadyRegistered) {
        res.status(400);
        throw new Error('You have already registered for this event');
    }

    try {
        const registrationId = new mongoose.Types.ObjectId();

        const qrDataObj = {
            registrationId: registrationId.toString(),
            studentName: req.user.name,
            email: req.user.email,
            registerNumber: req.user.registerNumber,
            eventId: event._id.toString(),
            eventTitle: event.title
        };

        const qrCodeBase64 = await generateQRCode(qrDataObj);
        const qrDataString = JSON.stringify(qrDataObj);

        const isPaidEvent = event.registrationFee > 0;
        const registration = new Registration({
            _id: registrationId,
            student: req.user._id,
            event: event._id,
            studentName: req.user.name,
            studentEmail: req.user.email,
            registerNumber: req.user.registerNumber,
            customFieldData: customFieldData || {},
            qrCode: qrCodeBase64,
            qrData: qrDataString,
            paymentStatus: isPaidEvent ? 'PENDING' : 'FREE'
        });

        await registration.save();

        const updatedEvent = await Event.findByIdAndUpdate(
            event._id,
            {
                $inc: { registrationCount: 1 },
                $push: {
                    eventLog: {
                        action: `New participant registered`,
                        timestamp: Date.now()
                    }
                }
            },
            { new: true }
        );

        if (updatedEvent.registrationCount >= updatedEvent.capacity) {
            await Event.findByIdAndUpdate(
                event._id,
                {
                    $push: {
                        eventLog: {
                            action: `Event reached maximum capacity (${updatedEvent.capacity} participants)`,
                            timestamp: Date.now()
                        }
                    }
                }
            );
        }

        // Async email sending only for free events (payment verification handles paid events)
        if (!isPaidEvent) {
            try {
                sendQRCodeEmail(req.user.email, req.user.name, event.title, qrCodeBase64);
            } catch (emailErr) {
                console.error('Non-fatal: Failed to send QR email', emailErr);
            }
        }

        res.status(201).json(registration);
    } catch (error) {
        throw error;
    }
});

// @desc    Get my events
// @route   GET /api/student/my-events
// @access  Private / Student / Approved
export const getMyEvents = asyncHandler(async (req, res) => {
    const registrations = await Registration.find({ student: req.user._id })
        .populate('event')
        .sort({ registeredAt: -1 });

    res.json(registrations);
});

// @desc    Get student analytics
// @route   GET /api/student/analytics
// @access  Private / Student / Approved
export const getAnalytics = asyncHandler(async (req, res) => {
    const registrations = await Registration.find({ student: req.user._id }).populate('event');

    const totalRegistered = registrations.length;
    const totalAttended = registrations.filter(r => r.attended).length;

    const eventsByCategory = {};
    const eventsByMonth = {};

    registrations.forEach(reg => {
        if (reg.event) {
            // Category aggregation
            const category = reg.event.category;
            eventsByCategory[category] = (eventsByCategory[category] || 0) + 1;

            // Month aggregation
            const date = new Date(reg.event.date);
            const month = date.toLocaleString('default', { month: 'short' });
            eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
        }
    });

    const categoryData = Object.keys(eventsByCategory).map(key => ({ name: key, value: eventsByCategory[key] }));
    const monthData = Object.keys(eventsByMonth).map(key => ({ name: key, count: eventsByMonth[key] }));

    res.json({
        totalRegistered,
        totalAttended,
        attendanceRate: totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : 0,
        eventsByCategory: categoryData,
        eventsByMonth: monthData
    });
});
