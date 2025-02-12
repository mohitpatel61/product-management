const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users");
const authorize = require('../middlewares/checkAuthLogin');
const { body } = require("express-validator");
const { moment } = require("moment");
const { isAuthenticated } = require("../middlewares/checkAuthLogin");
const { verifyToken } = require("../services/csrfService");

router.get("/", usersController.getUsersListView);
router.post("/ajax-list" , isAuthenticated, verifyToken, usersController.getAjaxUser);

router.get("/add-user", usersController.addUserView);
router.get("/view-user/:id", usersController.getUserDetail);
router.get("/edit-user/:id", usersController.getUserDetail);

router.post(
    "/add-user",  isAuthenticated, verifyToken,
    [
        // Validate first name (only alphabets, min 1, max 250 characters)
        body("firstName")
        .trim()
        .matches(/^[A-Za-z\s]+$/) // \s allows spaces
        .withMessage("First name should contain only alphabets")
        .isLength({ min: 1, max: 250 })
        .withMessage("First name must be between 1 and 250 characters")
        .escape(),

    // Validate last name (only alphabets, allows spaces)
    body("lastName")
        .trim()
        .matches(/^[A-Za-z\s]+$/) // Allows only letters and spaces
        .withMessage("Last name should contain only alphabets")
        .isLength({ min: 1, max: 250 })
        .withMessage("Last name must be between 1 and 250 characters")
        .escape(),

    // Validate email
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address")
        .isLength({ min: 10, max: 250 })
        .withMessage("Email must be between 10 and 250 characters")
        .normalizeEmail(),

    // Validate password (only alphanumeric, min 6, max 20 characters)
    body("password")
        .trim()
        .isAlphanumeric()
        .withMessage("Password should contain only letters and numbers")
        .isLength({ min: 6, max: 20 })
        .withMessage("Password must be between 6 and 20 characters")
        .escape(),

    // Validate confirm password (matches password, only alphanumeric)
    body("confirmPassword")
        .trim()
        .isAlphanumeric()
        .withMessage("Confirm Password should contain only letters and numbers")
        .isLength({ min: 6, max: 20 })
        .withMessage("Confirm Password must be between 6 and 20 characters")
        .escape()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
    ],
    usersController.addUser
);


router.post(
    "/edit-user", isAuthenticated, verifyToken,
    [
        // Validate first name (only alphabets, min 1, max 250 characters)
        body("first_name")
        .trim()
        .matches(/^[A-Za-z\s]+$/) // \s allows spaces
        .withMessage("First name should contain only alphabets")
        .isLength({ min: 1, max: 250 })
        .withMessage("First name must be between 1 and 250 characters")
        .escape(),

    // Validate last name (only alphabets, allows spaces)
    body("first_name")
        .trim()
        .matches(/^[A-Za-z\s]+$/) // Allows only letters and spaces
        .withMessage("Last name should contain only alphabets")
        .isLength({ min: 1, max: 250 })
        .withMessage("Last name must be between 1 and 250 characters")
        .escape(),

    // Validate email
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address")
        .isLength({ min: 10, max: 250 })
        .withMessage("Email must be between 10 and 250 characters")
        .normalizeEmail(),
    ],
    usersController.editUser
);


router.patch("/delete-user/:id",isAuthenticated, verifyToken, usersController.deleteUser);

module.exports = router;