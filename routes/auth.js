const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");

router.get("/login", authController.getLoginView);
router.post("/login",
    [
    body("email").trim().isEmail().withMessage("Enter valid email").normalizeEmail(),
    body("password").trim().isLength({min: 1}).withMessage("Password is required"). escape()
    ],
 authController.userLogin);


module.exports = router;