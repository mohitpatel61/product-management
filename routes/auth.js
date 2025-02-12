const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authentication");
const authentication = require("../controllers/authentication");
const { isAuthenticated } = require("../middlewares/checkAuthLogin");

 // Initiates the Google Login flow
router.get("/login", authController.getLoginView);
router.post("/login",
    [
    body("email").trim().isEmail().withMessage("Enter valid email").normalizeEmail(),
    body("password").trim().isLength({min: 1}).withMessage("Password is required"). escape()
    ],
 authController.userLogin);

 router.get("/logout", authController.logout);

 router.get('/auth/google', authController.googleAuth);
 // Callback URL for handling the Google Login response
 router.get('/auth/google/callback', authController.googleAuthCallBack);
module.exports = router;