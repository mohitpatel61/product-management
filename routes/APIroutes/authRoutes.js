const express = require("express");
const router = express.Router();
const { loginWithAPI } = require("../../controllers/authentication");

router.post("/login", loginWithAPI);

module.exports = router;
