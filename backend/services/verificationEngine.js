import { extractTextFromImage } from './ocrService.js';
import { calculateTextMatchScore } from './textMatchService.js';
import { performELA } from './elaService.js';
import { checkIfAIGenerated } from './aiDetectService.js';
import { analyzeExifData } from './exifService.js';

export async function runVerification(enteredName, enteredRegNo, imagePath) {
    console.log('🔍 Starting verification pipeline...');

    // Run all layers in parallel for speed
    const [ocrResult, elaResult, aiResult, exifResult] = await Promise.all([
        extractTextFromImage(imagePath),
        performELA(imagePath),
        checkIfAIGenerated(imagePath),
        analyzeExifData(imagePath),
    ]);

    // Layer 2: Text matching using OCR output
    const textMatch = calculateTextMatchScore(
        enteredName,
        enteredRegNo,
        ocrResult.extractedName || '',
        ocrResult.extractedRegNo || ''
    );

    // Calculate total forgery penalty
    const forgeryPenalty = Math.min(
        elaResult.penalty + aiResult.penalty + exifResult.penalty,
        60  // Cap total forgery penalty at 60 points
    );

    // Final score
    const rawScore = textMatch.textMatchScore - forgeryPenalty;
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Decision
    // Softened: allow everything that fails to go to manual review.
    let decision =
        finalScore >= 80 ? 'AUTO_APPROVED' : 'MANUAL_REVIEW';

    // Override: If OCR confidence is too low, always force manual review
    if (decision === 'AUTO_APPROVED' && ocrResult.confidence < 30) {
        decision = 'MANUAL_REVIEW';
    }

    // Collect all red flags
    const redFlags = [];
    if (textMatch.nameMatchScore < 70) redFlags.push('Name does not match ID card');
    if (textMatch.regMatchScore < 70) redFlags.push('Register number does not match ID card');
    if (elaResult.manipulated) redFlags.push('Image manipulation detected (ELA)');
    if (aiResult.isAIGenerated) redFlags.push('AI-generated image detected');
    if (exifResult.suspicionLevel === 'HIGH') redFlags.push(...exifResult.flags);
    if (ocrResult.confidence < 50) redFlags.push('Low OCR confidence — image may be unclear');

    return {
        finalScore,
        decision,
        autoApproved: decision === 'AUTO_APPROVED',
        requiresReview: decision === 'MANUAL_REVIEW',
        rejected: decision === 'REJECTED',
        redFlags,

        breakdown: {
            textMatch: {
                score: textMatch.textMatchScore,
                nameScore: textMatch.nameMatchScore,
                regScore: textMatch.regMatchScore,
                extracted: {
                    name: ocrResult.extractedName,
                    regNo: ocrResult.extractedRegNo,
                },
                ocrConfidence: Math.round(ocrResult.confidence),
            },
            forgeryPenalty: {
                total: forgeryPenalty,
                ela: elaResult.penalty,
                aiDetect: aiResult.penalty,
                exif: exifResult.penalty,
            },
            layers: {
                ocr: ocrResult,
                ela: elaResult,
                ai: aiResult,
                exif: exifResult,
            }
        }
    };
}
