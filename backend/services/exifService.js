import exifr from 'exifr';

const EDITING_SOFTWARE = [
    'photoshop', 'lightroom', 'canva', 'gimp', 'paint.net',
    'pixlr', 'fotor', 'snapseed', 'facetune', 'remove.bg',
    'stable diffusion', 'midjourney', 'dall-e', 'firefly'
];

export async function analyzeExifData(imagePath) {
    try {
        const exif = await exifr.parse(imagePath, {
            tiff: true,
            exif: true,
            gps: true,
            xmp: true,
            icc: false,
            iptc: false,
        });

        if (!exif) {
            // No EXIF at all → could be screenshot, AI image, or PNG
            return {
                success: true,
                hasExif: false,
                suspicionLevel: 'MEDIUM',
                penalty: 10,
                flags: ['No EXIF metadata found — may be screenshot or AI generated'],
                details: {}
            };
        }

        const flags = [];
        let penalty = 0;

        // Check 1: Editing software signature
        const software = (exif.Software || exif.software || '').toLowerCase();
        const isEditingSoftware = EDITING_SOFTWARE.some(s => software.includes(s));

        if (isEditingSoftware) {
            flags.push(`Editing software detected: "${exif.Software}"`);
            penalty += 30;
        }

        // Check 2: Missing camera make/model (real photos always have these)
        const hasCamera = !!(exif.Make || exif.Model);
        if (!hasCamera) {
            flags.push('No camera make/model — not taken from a real camera');
            penalty += 15;
        }

        // Check 3: Missing DateTimeOriginal (real photos have capture time)
        const hasTimestamp = !!(exif.DateTimeOriginal || exif.DateTime);
        if (!hasTimestamp) {
            flags.push('No original timestamp — may not be a real photograph');
            penalty += 10;
        }

        // Check 4: Check if modification date is much later than creation date
        if (exif.DateTimeOriginal && exif.DateTime) {
            const created = new Date(exif.DateTimeOriginal);
            const modified = new Date(exif.DateTime);
            const diffDays = (modified - created) / (1000 * 60 * 60 * 24);
            // Modified date shouldn't be drastically different from created date
            if (diffDays > 1) {
                flags.push(`Image modified ${Math.round(diffDays)} days after capture`);
                penalty += 15;
            }
        }

        // Check 5: Unusually high/low ISO (AI images sometimes have anomalies)
        if (exif.ISO && (exif.ISO > 25600 || exif.ISO < 50)) {
            flags.push(`Unusual ISO value: ${exif.ISO}`);
            penalty += 5;
        }

        const suspicionLevel =
            penalty >= 30 ? 'HIGH' :
                penalty >= 15 ? 'MEDIUM' : 'LOW';

        return {
            success: true,
            hasExif: true,
            suspicionLevel,
            penalty: Math.min(penalty, 30),   // Cap EXIF penalty at 30
            flags,
            details: {
                software: exif.Software || 'None detected',
                camera: `${exif.Make || '?'} ${exif.Model || '?'}`,
                capturedAt: exif.DateTimeOriginal || 'Unknown',
                hasGPS: !!(exif.latitude),
            }
        };

    } catch (error) {
        return {
            success: false,
            suspicionLevel: 'LOW',
            penalty: 0,
            flags: [],
            error: error.message
        };
    }
}
