const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { verifyToken } = require("./csrfService");

// Define Upload Folder Paths
const imageUploadFolder = path.join(__dirname, '..', 'uploads', 'profile_pics');
const thumbnailFolder = path.join(imageUploadFolder, 'thumbnails');

// Ensure Directories Exist
if (!fs.existsSync(imageUploadFolder)) {
    fs.mkdirSync(imageUploadFolder, { recursive: true });
}
if (!fs.existsSync(thumbnailFolder)) {
    fs.mkdirSync(thumbnailFolder, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageUploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname).toLowerCase();
        cb(null, uniqueName);
    }
});

// File Type Validation
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
};

// Multer Upload Middleware
const upload =   
      multer({
        storage: storage,
        limits: { fileSize: 30 * 1024 * 1024 },
        fileFilter: fileFilter
      }).single("profileImage");

const uploadProfilePicMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      // ** Now Verify CSRF Token After Parsing Form Data **
      verifyToken(req, res, next);
    });
  };
  
  module.exports = uploadProfilePicMiddleware;


