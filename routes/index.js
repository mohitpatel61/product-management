const express = require("express");
const router = express.Router();

const auth = require("./auth");
const dashboard = require("./dashboard");

router.use("/user",auth);
router.use("/dashboard",dashboard);

module.exports = router;