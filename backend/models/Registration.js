import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    registerNumber: { type: String, required: true },
    customFieldData: { type: Map, of: String },
    qrCode: { type: String }, // base64 QR image
    qrData: { type: String }, // JSON string encoded in QR
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FREE'],
        default: 'FREE'
    },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    attended: { type: Boolean, default: false },
    attendedAt: { type: Date },
    registeredAt: { type: Date, default: Date.now },
    hasGivenFeedback: { type: Boolean, default: false },
    razorpay_payment_id: { type: String, default: null },
    refundStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'REFUNDED', 'FAILED', 'NOT_APPLICABLE'],
        default: 'NOT_APPLICABLE'
    },
    refundId: { type: String, default: null },
    refundAmount: { type: Number, default: 0 },
    refundInitiatedAt: { type: Date, default: null },
    refundCompletedAt: { type: Date, default: null },
    manualRefund: { type: Boolean, default: false },
    manualRefundNote: { type: String, default: '' },
    status: { type: String, enum: ['REGISTERED', 'CANCELLED'], default: 'REGISTERED' }
});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
