import asyncHandler from 'express-async-handler';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import Registration from '../models/Registration.js';
import path from 'path';
import fs from 'fs';

// Helper: draw rounded rectangle path
function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

// @desc    Generate composite QR image for pass
// @route   GET /api/pass/:registrationId/generate-qr
// @access  Public 
export const generatePassQR = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
        .populate('student', 'name rollNumber registerNumber studentIdCard')
        .populate('event', 'title date time venue');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    // Base verification URL that the QR points to
    // The frontend should host the /verify page, OR we can use the backend
    const frontendVerifyUrl = `http://localhost:5173/verify/${registration._id}`;

    try {
        // Step 1: Generate base QR code as buffer
        const qrBuffer = await QRCode.toBuffer(frontendVerifyUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        });

        // Step 2: Create canvas (QR on left, ID card photo on right)
        const canvas = createCanvas(620, 340);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 620, 340);

        // Draw QR code (left side)
        const qrImage = await loadImage(qrBuffer);
        ctx.drawImage(qrImage, 20, 20, 280, 280);

        // Draw student ID card photo (right side, cropped to face area)
        try {
            // Reconstruct absolute local path based on uploaded format
            const imagePath = registration.student.studentIdCard.url;
            // imagePath looks like "/uploads/student-ids/filename.jpg"
            const absolutePath = path.join(path.resolve(), imagePath.replace('/', '\\'));

            // Validate if PDF
            if (absolutePath.toLowerCase().endsWith('.pdf')) {
                throw new Error('PDF cannot be drawn on canvas');
            }

            const idCardImage = await loadImage(absolutePath);

            // Draw as a rounded rectangle photo
            ctx.save();
            roundedRect(ctx, 320, 20, 200, 260, 12);
            ctx.clip();
            ctx.drawImage(idCardImage, 320, 20, 200, 260);
            ctx.restore();

            // Border around ID photo
            ctx.strokeStyle = '#4F46E5';
            ctx.lineWidth = 3;
            ctx.stroke(); // strokes current path
        } catch (e) {
            // Fallback placeholder
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(320, 20, 200, 260);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px Arial';
            ctx.fillText(e.message.includes('PDF') ? 'PDF Upload' : 'ID Card', 380, 155);
        }

        // Student name below ID photo
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(registration.student.name || 'Student Name', 320, 300);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';
        // Handle alias: model uses `registerNumber`, prompt spec used `rollNumber`
        ctx.fillText(registration.student.registerNumber || 'ID Unknown', 320, 320);

        // "Scan to Verify" text below QR
        ctx.fillStyle = '#6b7280';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to Verify', 160, 320);

        // Convert canvas to buffer and send
        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error("Canvas QR Error:", error);
        res.status(500).json({ message: "Failed to generate visual pass" });
    }
});

// @desc    Verify QR pass scan (Used by Admin App/Browser)
// @route   GET /api/pass/verify/:registrationId
// @access  Public 
export const verifyPass = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
        .populate('student', 'name registerNumber email collegeName studentIdCard')
        .populate('event', 'title date time venue');

    if (!registration) {
        return res.status(404).json({ success: false, message: 'Invalid Registration ID' });
    }

    // Identify scanner if an admin token is passed (Optional enhancement over prompt spec)
    // But per spec, it logs the scan
    registration.scanLog = registration.scanLog || [];
    registration.scanLog.push({
        scannedAt: Date.now(),
        scannedBy: 'admin' // can be customized if JWT is attached
    });

    // Save without validation to bypass other fields temporarily if required
    await registration.save({ validateBeforeSave: false });

    // We can return the JSON representation so the Frontend can render the big Verification UI banner
    res.json({
        success: true,
        data: registration
    });
});
