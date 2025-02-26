const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const userRoutes = require("./userRoutes");
// Use API routes
router.use("/api", authRoutes);

router.use("/api", productRoutes);
router.use('/api', userRoutes);
// router.use("/users", userRoutes);

module.exports = router;
