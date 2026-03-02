import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const testCreate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const uniqueEmail = `test_${Date.now()}@example.com`;
        const uniqueReg = `REG_${Date.now()}`;

        console.log(`Creating test student with status: 'pending'...`);
        const student = await Student.create({
            name: 'Diagnostic Test',
            email: uniqueEmail,
            password: 'password123',
            collegeName: 'Test College',
            branch: 'CS',
            graduationYear: 2025,
            registerNumber: uniqueReg,
            status: 'pending',
            studentIdCard: { url: '/temporary/test.jpg' }
        });

        console.log('Created student RAW data:');
        console.log(JSON.stringify(student, null, 2));

        const fetched = await Student.findById(student._id).lean();
        console.log('Fetched student RAW data:');
        console.log(JSON.stringify(fetched, null, 2));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testCreate();
