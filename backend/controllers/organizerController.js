import asyncHandler from 'express-async-handler';
import Organizer from '../models/Organizer.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

// @desc    Get Organizer profile
// @route   GET /api/organizer/profile
// @access  Private / Organizer
export const getProfile = asyncHandler(async (req, res) => {
    const organizer = await Organizer.findById(req.user._id).select('-password');
    if (organizer) {
        res.json(organizer);
    } else {
        res.status(404);
        throw new Error('Organizer not found');
    }
});

// @desc    Create an Event
// @route   POST /api/organizer/events
// @access  Private / Organizer / Approved
export const createEvent = asyncHandler(async (req, res) => {
    let { title, description, date, time, endDate, endTime, venue, category, capacity, maxParticipants, customFields, bannerImage, registrationFee } = req.body;

    if (typeof customFields === 'string') {
        customFields = JSON.parse(customFields);
    }

    const startDateTime = new Date(`${date}T${time}:00`);
    const computedEndDateTime = new Date(`${endDate}T${endTime}:00`);

    const event = new Event({
        title,
        description,
        date: startDateTime, // Keeping legacy date field updated to full DateTime for sorting if needed
        time,
        endDate: computedEndDateTime, // legacy separate field storage
        endTime,
        endDateTime: computedEndDateTime,
        venue,
        category,
        bannerImage,
        maxParticipants: capacity || maxParticipants, // Support both capacity and maxParticipants based on frontend implementation differences
        registrationFee: registrationFee || 0,
        organizer: req.user._id,
        organizerCollegeName: req.user.collegeName,
        customFields: customFields || [],
        eventLog: [{
            action: "Event Created by Organiser",
            timestamp: Date.now()
        }]
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
});

// @desc    Update an Event
// @route   PUT /api/organizer/events/:eventId
// @access  Private / Organizer / Approved
export const editEvent = asyncHandler(async (req, res) => {
    let { title, description, date, time, endDate, endTime, venue, category, capacity, customFields, bannerImage, registrationFee } = req.body;

    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event || event.organizer.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Event not found or unauthorized');
    }

    if (typeof customFields === 'string') {
        customFields = JSON.parse(customFields);
    }

    event.title = title || event.title;
    event.description = description || event.description;

    // Update dates and compute endDateTime
    event.date = date ? new Date(`${date}T${time || event.time}:00`) : event.date;
    event.time = time || event.time;
    event.endDate = endDate ? new Date(`${endDate}T${endTime || event.endTime}:00`) : event.endDate;
    event.endTime = endTime || event.endTime;

    // Safety check fallback
    if (endDate && endTime) {
        event.endDateTime = new Date(`${endDate}T${endTime}:00`);
    }

    event.venue = venue || event.venue;
    event.category = category || event.category;
    event.maxParticipants = capacity || event.maxParticipants;
    event.customFields = customFields || event.customFields;
    event.registrationFee = registrationFee !== undefined ? registrationFee : event.registrationFee;

    event.eventLog.push({
        action: "Event Details Updated",
        timestamp: Date.now()
    });

    if (bannerImage) {
        event.bannerImage = bannerImage;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
});

// @desc    Get Organizer's events
// @route   GET /api/organizer/events
// @access  Private / Organizer / Approved
export const getMyEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
});

// @desc    Get Event Participants
// @route   GET /api/organizer/events/:eventId/participants
// @access  Private / Organizer / Approved
export const getEventParticipants = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (!event || event.organizer.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Event not found or unauthorized');
    }

    const registrations = await Registration.find({ event: req.params.eventId })
        .populate('student', '-password')
        .sort({ registeredAt: -1 });

    res.json(registrations);
});

// @desc    Preview Registration before confirming attendance
// @route   POST /api/organizer/events/:eventId/scan-preview
// @access  Private / Organizer / Approved
export const previewScan = asyncHandler(async (req, res) => {
    const { qrData } = req.body;
    const eventId = req.params.eventId;

    let registrationId;
    let qrEventId;

    try {
        const parsedData = JSON.parse(qrData);
        registrationId = parsedData.registrationId;
        qrEventId = parsedData.eventId;
    } catch (err) {
        // Fallback for URL or raw ID
        if (qrData.includes('/verify/')) {
            const parts = qrData.split('/verify/');
            registrationId = parts[parts.length - 1];
        } else if (qrData.length === 24) {
            registrationId = qrData;
        } else {
            res.status(400);
            throw new Error('Invalid QR Data format');
        }
    }

    if (qrEventId && qrEventId !== eventId) {
        res.status(400);
        throw new Error('QR code does not belong to this event');
    }

    const registration = await Registration.findById(registrationId).populate('student', 'studentIdCard name registerNumber');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    if (registration.event.toString() !== eventId) {
        res.status(400);
        throw new Error('QR code does not belong to this event');
    }

    if (registration.attended) {
        res.status(400);
        throw new Error('Already marked as attended');
    }

    res.json({
        registrationId: registration._id,
        studentName: registration.studentName || registration.student?.name,
        registerNumber: registration.registerNumber || registration.student?.registerNumber,
        idCardUrl: registration.student?.studentIdCard?.url
    });
});

// @desc    Confirm and Mark Attendance
// @route   POST /api/organizer/events/:eventId/scan
// @access  Private / Organizer / Approved
export const scanQR = asyncHandler(async (req, res) => {
    const { registrationId } = req.body;
    const eventId = req.params.eventId;
    if (!registrationId) {
        res.status(400);
        throw new Error('Registration ID required');
    }

    const registration = await Registration.findById(registrationId).populate('student', 'studentIdCard');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    // Since URL-based passes might omit qrEventId, verify defensively against DB
    if (registration.event.toString() !== eventId) {
        res.status(400);
        throw new Error('QR code does not belong to this event');
    }

    if (registration.attended) {
        res.status(400);
        throw new Error('Already marked as attended');
    }

    registration.attended = true;
    registration.attendedAt = Date.now();
    await registration.save();

    res.json({ message: 'Attendance marked successfully', student: registration });
});
