const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/profileController");
const authenticateToken = require("../../middlewares/authMiddleware");
const { route } = require("./authRoutes");
const   uploadProfilePicAPImiddleware   = require("../../services/uploadProfilePicAPImiddleware");

// Define product routes
router.get('/userProfile', authenticateToken,  profileController.getUserProfileData);

router.post("/updateProfile", authenticateToken, profileController.updateProfile);
router.post("/updateUserProfilePic", authenticateToken, uploadProfilePicAPImiddleware, profileController.updateUserProfilePic);
router.post("/changePassword", authenticateToken, profileController.changePassword);
module.exports = router;
