const { check, oneOf } = require('express-validator');
const validatorMiddleware = require('../middlewares/validators.mw');
const {
	passwordValidationOptions,
	phone_E164FormatRegex,
} = require('../../config/constants');

const passwordMatch =
	(passwordField, confirmPasswordField) =>
	(value, { req }) => {
		if (value !== req.body[passwordField]) {
			return Promise.reject([
				`The ${passwordField} and ${confirmPasswordField} fields do not match`,
				'كلمة السر غير متطابقه',
			]);
		}
		return true;
	};

const commonFieldValidation = {
	phone: [
		check('phone')
			.exists()
			.withMessage([
				'no phone field exists in the request data',
				'لم يتم ادخال رقم هاتف',
			])
			.bail()
			.trim()
			.notEmpty()
			.withMessage(['phone required', 'رقم الهاتف مطلوب'])
			.bail()
			.isMobilePhone()
			.withMessage(['Invalid phone number', 'هذا الرقم غير صالح'])
			.bail()
			.matches(phone_E164FormatRegex)
			.withMessage([
				'phone number should match E.164 format',
				'برجاء ادخال رقم الهاتف بطريقه صحيحه',
			]),
	],
	password: [
		check('newPassword')
			.exists()
			.withMessage([
				'no password field exists in the request data',
				'لم يتم ادخال الرقم السري',
			])
			.bail()
			.notEmpty()
			.withMessage(['password required', 'الرقم السري مطلوب'])
			.isStrongPassword(passwordValidationOptions)
			.withMessage([
				'password should be strong',
				'برجاء ادخال كلمة سر قويه تحتوي علي حروف و ارقام و رموز',
			]),
	],
	passwordConfirm: [
		check('newPasswordConfirm')
			.optional()
			.custom(passwordMatch('newPassword', 'newPasswordConfirm')),
	],
	passwordForLoggedUsers: [
		check('password')
			.exists()
			.withMessage([
				'no password field exists in the request data',
				'برجاء ادخال كلمة المرور',
			])
			.bail()
			.trim()
			.notEmpty()
			.withMessage(['password required', 'كلمة المرور مطلوبه']),
	],
	email: [
		check('email')
			.exists()
			.withMessage([
				'no email field exists in the request data',
				'لم يتم ادخال بريد الكتروني',
			])
			.bail()
			.trim()
			.notEmpty()
			.withMessage(['Email required', 'البريد الالكتروني مطلوب'])
			.bail()
			.isEmail()
			.withMessage(['Invalid email address', 'بريد الكتروني غير صالح']),
	],
	firstName: [
		check('firstName')
			.exists()
			.withMessage([
				'no firstName field exists in the request data',
				'برجاء ادخال الاسم الاول',
			])
			.bail()
			.trim()
			.notEmpty()
			.withMessage(['firstName is required', 'الاسم الاول مطلوب']),
	],
	lastName: [
		check('lastName')
			.exists()
			.withMessage([
				'no lastName field exists in the request data',
				'برجاء ادخال الاسم الثاني',
			])
			.bail()
			.trim()
			.notEmpty()
			.withMessage(['lastName is required', 'الاسم التاني مطلوب']),
	],
	pushToken: [
		check('pushtoken')
			.optional()
			.trim()
			.notEmpty()
			.withMessage(['pushToken must be not empty']),
	],
};

exports.loginAdminValidator = [
	commonFieldValidation.email,
	commonFieldValidation.passwordForLoggedUsers,
	validatorMiddleware,
];
exports.signupUserValidator = [
	commonFieldValidation.firstName,
	commonFieldValidation.lastName,
	check('email')
		.optional()
		.trim()
		.isEmail()
		.withMessage(['Invalid email address', 'بريد الكتروني غير صالح']),
	commonFieldValidation.phone,
	commonFieldValidation.password,
	commonFieldValidation.passwordConfirm,
	commonFieldValidation.pushToken,
	validatorMiddleware,
];
exports.loginUserValidator = [
	commonFieldValidation.phone,
	commonFieldValidation.passwordForLoggedUsers,
	commonFieldValidation.pushToken,
	validatorMiddleware,
];
exports.verifyPhoneForForgotPasswordValidator = [
	commonFieldValidation.phone,
	validatorMiddleware,
];
exports.resetPasswordValidator = [
	check('resetPasswordToken')
		.exists()
		.withMessage(['no resetPasswordToken field exists in the request data'])
		.bail()
		.trim()
		.notEmpty()
		.withMessage(['resetPasswordToken required']),
	commonFieldValidation.password,
	commonFieldValidation.passwordConfirm,
	validatorMiddleware,
];
exports.verifyCodeValidator = [
	check('verificationCode')
		.exists()
		.withMessage([
			'no verificationCode field exists in the request data',
			'برجاء ادخال رقم التحقق',
		])
		.bail()
		.notEmpty()
		.withMessage([
			'verificationCode confirmation required',
			'رمز التحقق مطلوب',
		])
		.isNumeric()
		.withMessage([
			'verificationCode must be number',
			'رقم التحقق يحب ان يكون رقماً',
		])
		.isLength(4)
		.withMessage([
			'verificationCode must be 4 number',
			'رقم التحقق يتكون من 4 ارقام',
		]),
	validatorMiddleware,
];
exports.changePasswordValidator = [
	commonFieldValidation.password,
	commonFieldValidation.passwordConfirm,
	commonFieldValidation.passwordForLoggedUsers,
	validatorMiddleware,
];
exports.updateUserInfoValidator = [
	oneOf(
		[
			check('email')
				.exists()
				.withMessage([
					'no email field exists in the request data',
					'لم يتم ادخال بريد الكتروني',
				]),
			check('firstName')
				.exists()
				.withMessage([
					'no firstName field exists in the request data',
					'برجاء ادخال الاسم الاول',
				]),
			check('lastName')
				.exists()
				.withMessage([
					'no lastName field exists in the request data',
					'برجاء ادخال الاسم الثاني',
				]),
		],
		{ message: ['There is no Updates!', 'لا يوجد تحديثات'] },
	),
	check('email')
		.optional()
		.trim()
		.notEmpty()
		.withMessage(['Email required', 'البريد الالكتروني مطلوب'])
		.bail()
		.isEmail()
		.withMessage(['Invalid email address', 'بريد الكتروني غير صالح']),
	check('firstName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage(['firstName is required', 'الاسم الاول مطلوب']),
	check('lastName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage(['lastName is required', 'الاسم التاني مطلوب']),
	validatorMiddleware,
];
exports.changePhoneValidator = [
	commonFieldValidation.phone,
	validatorMiddleware,
];
exports.takeVisitorPushTokenValidator = [
	check('pushtoken')
		.exists()
		.withMessage(['pushToken is required'])
		.bail()
		.trim()
		.notEmpty()
		.withMessage(['pushToken must be not empty']),
	validatorMiddleware,
];
