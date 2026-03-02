import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    category: { type: String, required: true },
    bannerImage: { type: String, default: '' },
    maxParticipants: { type: Number, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer', required: true },
    organizerCollegeName: { type: String, required: true },
    registrationFee: { type: Number, default: 0 },
    customFields: [{
        fieldName: String,
        fieldType: String, // text, dropdown, file, number, date
        options: [String],
        required: Boolean
    }],
    isActive: { type: Boolean, default: true },
    registrationCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    endTime: { type: String, required: true }, // "HH:MM" format
    endDateTime: { type: Date },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    eventLog: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
        meta: String
    }],
    status: {
        type: String,
        enum: ['PENDING', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    cancellationInProgress: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
    totalRefundAmount: { type: Number, default: 0 }
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
