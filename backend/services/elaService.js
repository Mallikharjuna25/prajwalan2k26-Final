import sharp from 'sharp';

export async function performELA(imagePath) {
    try {
        const tempPath = imagePath + '_ela_temp.jpg';

        // Step 1: Get original image pixels
        const originalBuffer = await sharp(imagePath)
            .jpeg({ quality: 75 })         // Re-compress at 75% quality
            .toBuffer();

        // Step 2: Re-save at lower quality (simulates re-compression)
        const recompressedBuffer = await sharp(originalBuffer)
            .jpeg({ quality: 75 })
            .toBuffer();

        // Step 3: Get raw pixel data for both
        const { data: originalData, info: origInfo } = await sharp(imagePath)
            .resize(800, null, { fit: 'inside' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { data: recompData } = await sharp(recompressedBuffer)
            .resize(800, null, { fit: 'inside' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Step 4: Calculate pixel-level differences
        let totalDiff = 0;
        let highDiffPixels = 0;
        const totalPixels = originalData.length;

        for (let i = 0; i < totalPixels; i++) {
            const diff = Math.abs(originalData[i] - recompData[i]);
            totalDiff += diff;
            if (diff > 30) highDiffPixels++;  // Threshold for suspicious diff
        }

        const avgDiff = totalDiff / totalPixels;
        const highDiffRatio = highDiffPixels / (totalPixels / 3); // per pixel

        // Score interpretation:
        // avgDiff > 15 AND highDiffRatio > 0.2 → likely manipulated
        const manipulated = avgDiff > 15 && highDiffRatio > 0.15;
        const suspicionLevel =
            (avgDiff > 25 || highDiffRatio > 0.35) ? 'HIGH' :
                (avgDiff > 15 || highDiffRatio > 0.15) ? 'MEDIUM' : 'LOW';

        const penalty =
            suspicionLevel === 'HIGH' ? 35 :
                suspicionLevel === 'MEDIUM' ? 15 : 0;

        return {
            success: true,
            manipulated,
            suspicionLevel,
            penalty,
            metrics: {
                avgPixelDiff: parseFloat(avgDiff.toFixed(2)),
                highDiffRatio: parseFloat(highDiffRatio.toFixed(3)),
                highDiffPixels
            }
        };

    } catch (error) {
        return {
            success: false,
            manipulated: false,
            suspicionLevel: 'LOW',
            penalty: 0,
            error: error.message
        };
    }
}
