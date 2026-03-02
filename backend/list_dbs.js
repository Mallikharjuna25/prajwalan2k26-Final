import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const listDbs = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017');
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases on localhost:27017:');
        dbs.databases.forEach(db => console.log(`- ${db.name}`));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listDbs();
