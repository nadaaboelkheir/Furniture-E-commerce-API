const express = require('express');
const router = express.Router();
const {
	userLogin,
	verifySignUpCode,
	userSignup,
	verifyPhoneForForgotPassword,
	resetPassword,
	verifyForgotPasswordCode,
	changePassword,
	logout,
	updateUser,
	getUser,
	deleteAccount,
	changePhone,
	verifyNewPhone,
	takeVisitorPushToken,
} = require('../controllers/auth.controller');
const {
	signupUserValidator,
	loginUserValidator,
	verifyPhoneForForgotPasswordValidator,
	resetPasswordValidator,
	verifyCodeValidator,
	changePasswordValidator,
	updateUserInfoValidator,
	changePhoneValidator,
	takeVisitorPushTokenValidator,
} = require('../validations/auth.vc');
const {
	isAuthOrVisitor,
	allow,
	hasSignedUp,
	hasForgotPassword,
} = require('../middlewares/auth.mw');
const { userTypes } = require('../../config/constants');

router.post('/signup', signupUserValidator, userSignup);
router.post(
	'/verifySignup',
	hasSignedUp,
	verifyCodeValidator,
	verifySignUpCode,
);
router.post('/login', loginUserValidator, userLogin);
router.post(
	'/forgotPassword',
	verifyPhoneForForgotPasswordValidator,
	verifyPhoneForForgotPassword,
);
router.post(
	'/verifyForgotPassword',
	hasForgotPassword,
	verifyCodeValidator,
	verifyForgotPasswordCode,
);
router.post(
	'/resetPassword',
	hasForgotPassword,
	resetPasswordValidator,
	resetPassword,
);
router.put(
	'/changePassword',
	isAuthOrVisitor,
	allow([userTypes.user]),
	changePasswordValidator,
	changePassword,
);
router.post('/logout', isAuthOrVisitor, allow([userTypes.user]), logout);
router.put(
	'/updateUserInfo',
	isAuthOrVisitor,
	allow([userTypes.user]),
	updateUserInfoValidator,
	updateUser,
);
router.get('/getUser', isAuthOrVisitor, allow([userTypes.user]), getUser);
router.delete(
	'/deleteAccount',
	isAuthOrVisitor,
	allow([userTypes.user]),
	deleteAccount,
);
router.post(
	'/changePhone',
	isAuthOrVisitor,
	allow([userTypes.user]),
	changePhoneValidator,
	changePhone,
);
router.put(
	'/verifyNewPhone',
	isAuthOrVisitor,
	allow([userTypes.user]),
	verifyCodeValidator,
	verifyNewPhone,
);

router.post(
	'/pushtoken',
	isAuthOrVisitor,
	allow([userTypes.admin]),
	takeVisitorPushTokenValidator,
	takeVisitorPushToken,
);
module.exports = router;
