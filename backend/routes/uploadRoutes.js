import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Upload image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, authorize('organizer', 'admin'), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image provided' });
    }

    // Return relative path to be stored in DB
    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;

    res.json({
        message: 'Image uploaded successfully',
        imageUrl: imagePath
    });
});

export default router;
