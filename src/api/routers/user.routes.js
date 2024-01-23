const authRoutes = require('./auth.route');
const { userAdRouter } = require('./ads.route');
const express = require('express');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/ad', userAdRouter);

module.exports = router;
