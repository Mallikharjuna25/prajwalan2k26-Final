import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    registrationId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Success', 'Failed'], required: true },
    transactionId: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
