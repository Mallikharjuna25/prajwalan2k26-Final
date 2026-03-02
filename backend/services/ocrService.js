import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function preprocessImage(imagePath) {
    // Enhance image for better OCR accuracy
    const outputPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');

    await sharp(imagePath)
        .resize(1200, null, {
            withoutEnlargement: false,
            fit: 'inside'
        })
        .greyscale()                    // Convert to grayscale
        .normalise()                    // Normalize contrast
        .sharpen()                      // Sharpen edges
        .png()
        .toFile(outputPath);

    return outputPath;
}

export async function extractTextFromImage(imagePath) {
    try {
        const processedPath = await preprocessImage(imagePath);

        const { data } = await Tesseract.recognize(processedPath, 'eng', {
            logger: () => { },             // Suppress logs
            tessedit_char_whitelist:
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /-.',
        });

        // Clean up processed file
        fs.unlink(processedPath, () => { });

        const rawText = data.text;

        // Parse extracted text into structured fields
        const parsed = parseIDCardText(rawText);

        return {
            success: true,
            rawText,
            extractedName: parsed.name,
            extractedRegNo: parsed.regNo,
            confidence: data.confidence  // Tesseract confidence %
        };

    } catch (error) {
        return {
            success: false,
            rawText: '',
            extractedName: '',
            extractedRegNo: '',
            confidence: 0,
            error: error.message
        };
    }
}

function parseIDCardText(rawText) {
    const lines = rawText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 1);

    let name = '';
    let regNo = '';

    // Pattern 1: Register number patterns
    // Matches: 21CS045, RA2211003010234, 20BCE0123, etc.
    const regPatterns = [
        /\b[0-9]{2}[A-Z]{2,4}[0-9]{3,10}\b/,    // 21CS045 style
        /\b[A-Z]{2}[0-9]{10,15}\b/,               // RA2211... style  
        /\b[0-9]{10,15}\b/,                        // Pure numeric reg no
        /\b[A-Z0-9]{8,15}\b/,                      // Generic alphanumeric
    ];

    for (const line of lines) {
        for (const pattern of regPatterns) {
            const match = line.match(pattern);
            if (match && !regNo) {
                regNo = match[0];
                break;
            }
        }
    }

    // Pattern 2: Name detection
    // Look for lines that are all letters/spaces (likely a name)
    // Usually appears after keywords: "Name:", "Student:", etc.
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this line follows a name label
        if (/name\s*:/i.test(line)) {
            const nameAfterColon = line.replace(/name\s*:/i, '').trim();
            if (nameAfterColon.length > 2) {
                name = nameAfterColon;
                break;
            }
            // Name might be on next line
            if (i + 1 < lines.length) {
                name = lines[i + 1].trim();
                break;
            }
        }

        // Fallback: line with only letters and spaces, 3-5 words = likely a name
        if (/^[A-Za-z\s]{5,40}$/.test(line)) {
            const wordCount = line.trim().split(/\s+/).length;
            if (wordCount >= 2 && wordCount <= 5 && !name) {
                name = line.trim();
            }
        }
    }

    return {
        name: name.replace(/\s+/g, ' ').trim(),
        regNo: regNo.trim()
    };
}
