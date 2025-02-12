const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const profileController = require("../controllers/profileController");
const {isAuthenticated} = require('../middlewares/checkAuthLogin');
const uploadProfilePicMiddleware = require("../services/uploadProfilePicService");
const { verifyToken } = require("../services/csrfService");

router.get('/user-profile', isAuthenticated,  profileController.getUserProfileView);
// router.get("/user-profile", isAuthenticated, profileController.getUserProfileView);
router.post(
  "/upload-profile-picture", 
  isAuthenticated,  // Ensure that the user is authorized
  uploadProfilePicMiddleware,  // Use the upload middleware for handling file upload
  profileController.uploadProfilePicture // New controller function for saving the uploaded image
);

router.post(
  "/user-profile", isAuthenticated, verifyToken, 
  [
    body("first_name").trim().isLength({ min: 1 }).withMessage("First name is required").escape(),
    body("last_name").trim().isLength({ min: 1 }).withMessage("Last name is required").escape(),
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  ],
  profileController.editProfile
);


module.exports = router;