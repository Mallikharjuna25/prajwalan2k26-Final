import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete students with weird statuses or names
        const result = await Student.deleteMany({
            $or: [
                { status: { $regex: /approved/i } },
                { name: 'Diagnostic Test' },
                { email: /example.com$/ }
            ]
        });

        console.log(`Deleted ${result.deletedCount} corrupted/test student records.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanup();
