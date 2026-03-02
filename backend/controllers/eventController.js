import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';

// @desc    Get All Active Events
// @route   GET /api/events
// @access  Public
export const getAllEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ isActive: true })
        .populate('organizer', 'collegeName overallRating')
        .sort({ date: 1 });

    res.json(events);
});

// @desc    Get Single Event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('organizer', 'collegeName email place overallRating');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Get Detailed Event Info with Feedbacks & Log
// @route   GET /api/events/:id/info
// @access  Public
export const getEventInfo = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('organizer', 'collegeName email place overallRating totalEventsRated totalRatingsReceived');

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const feedbacks = await Feedback.find({ eventId: req.params.id })
        .populate('studentId', 'name')
        .sort({ submittedAt: -1 });

    res.json({
        event,
        feedbacks
    });
});
