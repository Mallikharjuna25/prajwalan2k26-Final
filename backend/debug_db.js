import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import VerificationLog from './models/VerificationLog.js';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find({}).lean();
        console.log('--- ALL STUDENTS RAW ---');
        students.forEach(s => {
            console.log(JSON.stringify({
                id: s._id,
                name: s.name,
                email: s.email,
                status: s.status,
                vStatus: s.verificationStatus,
                vLog: s.verificationLogId
            }, null, 2));
        });

        const pending = students.filter(s => s.status === 'pending');
        console.log('\nPending count (JS filter):', pending.length);

        const logs = await VerificationLog.find({}).lean();
        console.log('\n--- ALL VERIFICATION LOGS RAW ---');
        logs.forEach(l => {
            console.log(JSON.stringify({
                id: l._id,
                decision: l.decision,
                reviewed: l.adminReviewed,
                userId: l.userId
            }, null, 2));
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDb();
