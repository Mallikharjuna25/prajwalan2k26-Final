import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Organizer from '../models/Organizer.js';
import { sendApprovalEmail, sendRejectionEmail } from '../utils/mailer.js';

// @desc    Get pending students
// @route   GET /api/admin/students/pending
// @access  Private / Admin
export const getPendingStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({ status: 'pending' })
        .populate('verificationLogId')
        .sort({ createdAt: -1 });
    res.json(students);
});

// @desc    Get all active students and organizers grouped by college
// @route   GET /api/admin/colleges
// @access  Private / Admin
export const getCollegesOverview = asyncHandler(async (req, res) => {
    const students = await Student.find({ status: 'approved' });
    const organizers = await Organizer.find({ status: 'approved' });

    const collegeMap = {};

    students.forEach(student => {
        const college = student.collegeName || 'Unknown';
        if (!collegeMap[college]) collegeMap[college] = { studentCount: 0, organizerCount: 0 };
        collegeMap[college].studentCount++;
    });

    organizers.forEach(organizer => {
        const college = organizer.collegeName || 'Unknown';
        if (!collegeMap[college]) collegeMap[college] = { studentCount: 0, organizerCount: 0 };
        collegeMap[college].organizerCount++;
    });

    const collegesOverview = Object.keys(collegeMap).map(collegeName => ({
        collegeName,
        studentCount: collegeMap[collegeName].studentCount,
        organizerCount: collegeMap[collegeName].organizerCount
    }));

    res.json({
        totalStudents: students.length,
        collegesOverview
    });
});

// @desc    Approve student
// @route   PATCH /api/admin/students/:id/approve
// @access  Private / Admin
export const approveStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (student) {
        student.status = 'approved';
        const updatedStudent = await student.save();
        sendApprovalEmail(student.email, student.name, 'Student');
        res.json(updatedStudent);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Reject student
// @route   PATCH /api/admin/students/:id/reject
// @access  Private / Admin
export const rejectStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (student) {
        student.status = 'rejected';
        const updatedStudent = await student.save();
        sendRejectionEmail(student.email, student.name, 'Student');
        res.json(updatedStudent);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Get pending organizers
// @route   GET /api/admin/organizers/pending
// @access  Private / Admin
export const getPendingOrganizers = asyncHandler(async (req, res) => {
    const organizers = await Organizer.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(organizers);
});

// @desc    Approve organizer
// @route   PATCH /api/admin/organizers/:id/approve
// @access  Private / Admin
export const approveOrganizer = asyncHandler(async (req, res) => {
    const organizer = await Organizer.findById(req.params.id);
    if (organizer) {
        organizer.status = 'approved';
        const updatedOrganizer = await organizer.save();
        sendApprovalEmail(organizer.email, organizer.collegeName, 'Organizer');
        res.json(updatedOrganizer);
    } else {
        res.status(404);
        throw new Error('Organizer not found');
    }
});

// @desc    Reject organizer
// @route   PATCH /api/admin/organizers/:id/reject
// @access  Private / Admin
export const rejectOrganizer = asyncHandler(async (req, res) => {
    const organizer = await Organizer.findById(req.params.id);
    if (organizer) {
        organizer.status = 'rejected';
        const updatedOrganizer = await organizer.save();
        sendRejectionEmail(organizer.email, organizer.collegeName, 'Organizer');
        res.json(updatedOrganizer);
    } else {
        res.status(404);
        throw new Error('Organizer not found');
    }
});
