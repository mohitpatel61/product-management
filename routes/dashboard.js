const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
// const authorize = require('../middlewares/checkAuthLogin');

router.get("/" ,dashboardController.getDashboardView);

module.exports = router;