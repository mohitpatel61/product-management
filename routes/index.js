const express = require("express");
const router = express.Router();

const auth = require("./auth");
const dashboard = require("./dashboard");
const users = require("./users");
const product = require('./product');
const userProfile = require('./userProfile');

router.use("/user",auth);
router.use("/dashboard",dashboard);
router.use("/users",users);
router.use("/products", product);
router.use("/profile", userProfile);

module.exports = router;