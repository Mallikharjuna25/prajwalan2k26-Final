import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback.js';
import Event from '../models/Event.js';
import Organizer from '../models/Organizer.js';
import Registration from '../models/Registration.js';

// @desc    Submit Feedback
// @route   POST /api/feedback/submit
// @access  Private / Student
export const submitFeedback = asyncHandler(async (req, res) => {
    const { eventId, registrationId, rating, feedbackText } = req.body;
    const studentId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Please provide a valid rating between 1 and 5');
    }

    // Ensure event exists
    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Validate if event is actually completed (endDateTime < now)
    const now = new Date();
    if (new Date(event.endDateTime) > now) {
        res.status(400);
        throw new Error('Feedback can only be submitted after the event has completed');
    }

    // Verify registration and attendance
    const registration = await Registration.findOne({ _id: registrationId, student: studentId, event: eventId });
    if (!registration) {
        res.status(404);
        throw new Error('Registration not found or unauthorized');
    }

    if (registration.hasGivenFeedback) {
        res.status(400);
        throw new Error('You have already submitted feedback for this event');
    }

    // Check duplicate fallback
    const existingFeedback = await Feedback.findOne({ eventId, studentId });
    if (existingFeedback) {
        res.status(400);
        throw new Error('Feedback already exists for this event');
    }

    // Create Feedback
    const feedback = await Feedback.create({
        eventId,
        studentId,
        registrationId,
        rating,
        feedbackText
    });

    // Mark registration as feedback given
    registration.hasGivenFeedback = true;
    await registration.save();

    // Recalculate Event Rating
    const newTotalEventRatings = event.totalRatings + 1;
    const newEventAverage = ((event.averageRating * event.totalRatings) + Number(rating)) / newTotalEventRatings;
    event.averageRating = Number(newEventAverage.toFixed(2));
    event.totalRatings = newTotalEventRatings;

    // Add to event log
    event.eventLog.push({
        action: `Received a ${rating}-star feedback from a student`,
        timestamp: Date.now()
    });
    await event.save();

    // Recalculate Organizer Rating
    const organizer = await Organizer.findById(event.organizer);
    if (organizer) {
        const newTotalOrgRatings = organizer.totalRatingsReceived + 1;
        const newOrgAverage = ((organizer.overallRating * organizer.totalRatingsReceived) + Number(rating)) / newTotalOrgRatings;
        organizer.overallRating = Number(newOrgAverage.toFixed(2));
        organizer.totalRatingsReceived = newTotalOrgRatings;
        // Optionally update totalEventsRated if this is the first rating for this specific event?
        // We'll increment totalEventsRated only if event.totalRatings was 1 (meaning it was 0 before this feedback)
        if (event.totalRatings === 1) {
            organizer.totalEventsRated += 1;
        }
        await organizer.save();
    }

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
});

// @desc    Check if Feedback exists for an event by the logged-in student
// @route   GET /api/feedback/check/:eventId
// @access  Private / Student
export const checkFeedback = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const eventId = req.params.eventId;

    const feedback = await Feedback.findOne({ eventId, studentId });
    if (feedback) {
        res.json({ hasGivenFeedback: true, feedback });
    } else {
        res.json({ hasGivenFeedback: false });
    }
});
