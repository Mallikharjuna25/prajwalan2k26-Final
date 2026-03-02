import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(path.resolve(), 'uploads', 'student-ids');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for Multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/student-ids/');
    },
    filename(req, file, cb) {
        // Create unique filenames to avoid overwrites
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    }
});

// File filter to restrict file types
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images and PDFs only!');
    }
}

// Upload middleware initialization
const uploadId = multer({
    storage,
    limits: { fileSize: 2000000 }, // 2MB limit as specified
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

export default uploadId;
