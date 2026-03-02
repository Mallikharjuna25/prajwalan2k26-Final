import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const inspect = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/event-management');
        console.log('Connected to event-management');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:');
        collections.forEach(c => console.log(`- ${c.name}`));

        const count = await mongoose.connection.db.collection('students').countDocuments();
        console.log('Student count:', count);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspect();
