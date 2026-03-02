import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
    rating: { type: Number, min: 1, max: 5, required: true },
    feedbackText: { type: String, maxlength: 1000 },
    submittedAt: { type: Date, default: Date.now }
});

// Ensure a student can only submit one feedback per event
feedbackSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
