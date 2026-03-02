import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
    try {
        const adminId = process.env.ADMIN_ID;
        const adminExists = await Admin.findOne({ adminId });

        if (!adminExists) {
            const adminSchema = new Admin({
                adminId: adminId,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin',
            });
            await adminSchema.save();
            console.log('Admin seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};
