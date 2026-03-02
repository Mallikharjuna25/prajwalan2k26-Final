import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    collegeName: { type: String, required: true },
    branch: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    registerNumber: { type: String, required: true, unique: true },
    role: { type: String, default: 'student' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    avatar: { type: String, default: '' },
    studentIdCard: {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false }
    },
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'AUTO_APPROVED', 'MANUAL_REVIEW', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    verificationScore: { type: Number, default: 0 },
    verificationLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VerificationLog' },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);
export default Student;
