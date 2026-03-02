import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Organizer from '../models/Organizer.js';
import Admin from '../models/Admin.js';
import VerificationLog from '../models/VerificationLog.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register new student
// @route   POST /api/auth/student/signup
// @access  Public
export const registerStudent = asyncHandler(async (req, res) => {
    const { name, email, password, collegeName, branch, graduationYear, registerNumber, verificationId } = req.body;

    if (!verificationId) {
        res.status(400);
        throw new Error('ID Card verification is required before signup');
    }

    const verificationLog = await VerificationLog.findById(verificationId);
    if (!verificationLog) {
        res.status(400);
        throw new Error('Invalid verification session');
    }

    // Even if it was rejected or needs review, we allow the account creation
    // so the Admin can manually review it in the dashboard.
    // The only hard stop is if the verificationId is missing or invalid.

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
        res.status(400);
        throw new Error('Student already exists');
    }

    const regNumExists = await Student.findOne({ registerNumber });
    if (regNumExists) {
        res.status(400);
        throw new Error('Register number already exists');
    }

    // Determine derived statuses based on verification
    let accountStatus = 'pending';
    let isVerified = false;
    let verificationStatus = 'PENDING';

    if (verificationLog.decision === 'AUTO_APPROVED') {
        accountStatus = 'pending';
        isVerified = true;
        verificationStatus = 'AUTO_APPROVED';
    } else {
        // Everything else (MANUAL_REVIEW, REJECTED, or any other status)
        // goes to manual review status.
        accountStatus = 'pending';
        isVerified = false;
        verificationStatus = 'MANUAL_REVIEW';
    }

    const student = await Student.create({
        name,
        email,
        password,
        collegeName,
        branch,
        graduationYear,
        registerNumber,
        status: accountStatus,
        isVerified,
        verificationStatus,
        verificationScore: verificationLog.finalScore,
        verificationLogId: verificationLog._id,
        studentIdCard: {
            url: verificationLog.idCardImageUrl,
            verified: isVerified
        }
    });

    if (student) {
        // Link the log back to the newly created user
        verificationLog.userId = student._id;
        await verificationLog.save();

        res.status(201).json({
            message: verificationStatus === 'AUTO_APPROVED'
                ? 'Account created and ID auto-verified. Pending final admin review.'
                : 'Account created. ID is pending manual admin verification.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid student data');
    }
});

// @desc    Auth student & get token
// @route   POST /api/auth/student/login
// @access  Public
export const loginStudent = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (student && (await student.matchPassword(password))) {
        if (student.status === 'pending') {
            res.status(403);
            throw new Error('Your account is under review by the administrator.');
        }
        if (student.status === 'rejected') {
            res.status(403);
            throw new Error('Your account has been rejected.');
        }

        res.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            role: student.role,
            status: student.status,
            token: generateToken(student._id, 'student'),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register new organizer
// @route   POST /api/auth/organizer/signup
// @access  Public
export const registerOrganizer = asyncHandler(async (req, res) => {
    const { collegeName, email, password, place } = req.body;

    const organizerExists = await Organizer.findOne({ email });
    if (organizerExists) {
        res.status(400);
        throw new Error('Organizer already exists');
    }

    const organizer = await Organizer.create({
        collegeName,
        email,
        password,
        place,
        status: 'pending' // Default
    });

    if (organizer) {
        res.status(201).json({ message: 'Account created. Pending admin review.' });
    } else {
        res.status(400);
        throw new Error('Invalid organizer data');
    }
});

// @desc    Auth organizer & get token
// @route   POST /api/auth/organizer/login
// @access  Public
export const loginOrganizer = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const organizer = await Organizer.findOne({ email });

    if (organizer && (await organizer.matchPassword(password))) {
        if (organizer.status === 'pending') {
            res.status(403);
            throw new Error('Your account is under review by the administrator.');
        }
        if (organizer.status === 'rejected') {
            res.status(403);
            throw new Error('Your account has been rejected.');
        }

        res.json({
            _id: organizer._id,
            collegeName: organizer.collegeName,
            email: organizer.email,
            role: organizer.role,
            status: organizer.status,
            token: generateToken(organizer._id, 'organizer'),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Auth admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
    const { adminId, password } = req.body;

    const admin = await Admin.findOne({ adminId });

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            adminId: admin.adminId,
            role: admin.role,
            token: generateToken(admin._id, 'admin'),
        });
    } else {
        res.status(401);
        throw new Error('Invalid Admin ID or password');
    }
});
