import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Organizer from '../models/Organizer.js';
import Admin from '../models/Admin.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            let user;
            if (decoded.role === 'admin') {
                user = await Admin.findById(decoded.id).select('-password');
            } else if (decoded.role === 'organizer') {
                user = await Organizer.findById(decoded.id).select('-password');
            } else {
                user = await Student.findById(decoded.id).select('-password');
            }

            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            req.user = user;
            req.user.role = decoded.role; // explicitly set the role for clarity

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`);
        }
        next();
    };
};

export const checkApproved = (req, res, next) => {
    if (req.user && req.user.status !== 'approved') {
        res.status(403);
        throw new Error('Account pending review');
    }
    next();
};

export const studentOnly = authorize('student');
