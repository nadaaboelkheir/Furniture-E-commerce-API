const express = require('express');
const router = express.Router();
const categoryRoutes = require('./category.route');
const { dashboardAdRouter } = require('./ads.route');
const { dashboardNotificationRouter } = require('./notification.route');
const { adminLogin } = require('../controllers/auth.controller');
const { loginAdminValidator } = require('../validations/auth.vc');
const { isAuthOrVisitor, allow } = require('../middlewares/auth.mw');
const { userTypes } = require('../../config/constants');

router.use(
	'/category',
	isAuthOrVisitor,
	allow([userTypes.admin]),
	categoryRoutes,
);
router.use('/ad', isAuthOrVisitor, allow([userTypes.admin]), dashboardAdRouter);
router.use(
	'/notification',
	isAuthOrVisitor,
	allow([userTypes.admin]),
	dashboardNotificationRouter,
);

router.post('/login', loginAdminValidator, adminLogin);
module.exports = router;
