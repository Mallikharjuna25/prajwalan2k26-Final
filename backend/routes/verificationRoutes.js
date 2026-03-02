import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { runVerification } from '../services/verificationEngine.js';
import VerificationLog from '../models/VerificationLog.js';
import Student from '../models/Student.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config — store temporarily for processing
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Must put this inside frontend accessible folder for preview rendering later if needed
        // But per spec, it's just temp
        const dir = 'uploads/id-verification/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },    // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only image files are allowed (JPG, PNG, WEBP)'));
    }
});

// POST /api/verify/id-card
router.post('/id-card', upload.single('idCardImage'), async (req, res) => {
    try {
        const { enteredName, enteredRegNo } = req.body;

        if (!req.file) return res.status(400).json({ error: 'ID card image is required' });
        if (!enteredName) return res.status(400).json({ error: 'Name is required' });
        if (!enteredRegNo) return res.status(400).json({ error: 'Register number is required' });

        const imagePath = req.file.path;

        // Run the full verification pipeline
        const result = await runVerification(enteredName, enteredRegNo, imagePath);

        // Move the temp file to a permanent location for Admin Manual Review
        const permanentDir = 'uploads/student-ids/';
        if (!fs.existsSync(permanentDir)) fs.mkdirSync(permanentDir, { recursive: true });
        const permanentPath = path.join(permanentDir, req.file.filename);
        fs.copyFileSync(imagePath, permanentPath);
        const savedUrlPath = `/${permanentPath.replace(/\\/g, '/')}`;

        // Save log to MongoDB
        const log = await VerificationLog.create({
            enteredName,
            enteredRegNo,
            idCardImageUrl: savedUrlPath,
            finalScore: result.finalScore,
            decision: result.decision,
            breakdown: {
                textMatchScore: result.breakdown.textMatch.score,
                nameMatchScore: result.breakdown.textMatch.nameScore,
                regMatchScore: result.breakdown.textMatch.regScore,
                extractedName: result.breakdown.textMatch.extracted.name,
                extractedRegNo: result.breakdown.textMatch.extracted.regNo,
                ocrConfidence: result.breakdown.textMatch.ocrConfidence,
                elaPenalty: result.breakdown.forgeryPenalty.ela,
                aiDetectPenalty: result.breakdown.forgeryPenalty.aiDetect,
                exifPenalty: result.breakdown.forgeryPenalty.exif,
                forgeryPenalty: result.breakdown.forgeryPenalty.total,
            },
            redFlags: result.redFlags
        });

        // Clean up temp file after processing
        fs.unlink(imagePath, () => { });

        return res.json({
            verificationId: log._id,
            finalScore: result.finalScore,
            decision: result.decision,
            autoApproved: result.autoApproved,
            requiresReview: result.requiresReview,
            rejected: result.rejected,
            redFlags: result.redFlags,
            breakdown: result.breakdown,
            savedUrl: savedUrlPath,
            message:
                result.autoApproved ? '✅ Verification passed. Account created successfully!' :
                    result.requiresReview ? '⏳ Verification needs manual review. We will notify you.' :
                        '❌ Verification failed. Please upload a valid ID card.'
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed. Please try again.' });
    }
});

// GET /api/verify/admin/pending
// Admin: see all MANUAL_REVIEW cases
router.get('/admin/pending', protect, authorize('admin'), async (req, res) => {
    const pending = await VerificationLog.find({
        decision: 'MANUAL_REVIEW',
        adminReviewed: false
    }).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(pending);
});

// POST /api/verify/admin/review/:logId
// Admin: approve or reject a manual review case
router.post('/admin/review/:logId', protect, authorize('admin'), async (req, res) => {
    const { adminDecision, adminNote } = req.body;
    const log = await VerificationLog.findByIdAndUpdate(
        req.params.logId,
        {
            adminReviewed: true,
            adminDecision,
            adminNote,
            adminReviewedAt: new Date()
        },
        { new: true }
    );

    if (log.userId) {
        if (adminDecision === 'APPROVED') {
            await Student.findByIdAndUpdate(log.userId, {
                isVerified: true,
                verificationStatus: 'APPROVED'
            });
        } else {
            await Student.findByIdAndUpdate(log.userId, {
                verificationStatus: 'REJECTED'
            });
        }
    }

    res.json({ success: true, log });
});

export default router;
