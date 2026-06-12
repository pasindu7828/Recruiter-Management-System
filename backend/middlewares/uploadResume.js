import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads/resumes folder exists
const uploadPath = "uploads/resumes";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // folder to save
  },
  filename: function (req, file, cb) {
    // timestamp + original name
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter for allowed types
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (ext) {
      cb(null, true);
    } else {
      cb("Only PDF/DOC/DOCX files are allowed");
    }
  },
});

export default upload;