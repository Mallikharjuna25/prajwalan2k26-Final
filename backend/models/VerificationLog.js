import mongoose from 'mongoose';

const VerificationLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enteredName: { type: String, required: true },
    enteredRegNo: { type: String, required: true },
    idCardImageUrl: { type: String, required: true },

    finalScore: { type: Number, required: true },
    decision: {
        type: String,
        enum: ['AUTO_APPROVED', 'MANUAL_REVIEW', 'REJECTED'],
        required: true
    },

    breakdown: {
        textMatchScore: Number,
        nameMatchScore: Number,
        regMatchScore: Number,
        extractedName: String,
        extractedRegNo: String,
        ocrConfidence: Number,
        elaPenalty: Number,
        aiDetectPenalty: Number,
        exifPenalty: Number,
        forgeryPenalty: Number,
    },

    redFlags: [String],

    adminReviewed: { type: Boolean, default: false },
    adminDecision: { type: String, enum: ['APPROVED', 'REJECTED', null], default: null },
    adminNote: { type: String },
    adminReviewedAt: { type: Date },

    createdAt: { type: Date, default: Date.now }
});

const VerificationLog = mongoose.model('VerificationLog', VerificationLogSchema);
export default VerificationLog;
