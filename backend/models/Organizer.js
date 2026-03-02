import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const organizerSchema = new mongoose.Schema({
    collegeName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    place: { type: String, required: true },
    role: { type: String, default: 'organizer' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    overallRating: { type: Number, default: 0 },
    totalEventsRated: { type: Number, default: 0 },
    totalRatingsReceived: { type: Number, default: 0 }
});

organizerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

organizerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Organizer = mongoose.model('Organizer', organizerSchema);
export default Organizer;
