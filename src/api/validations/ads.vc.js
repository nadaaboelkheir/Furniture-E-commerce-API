const { check, param, query, oneOf } = require('express-validator');
const validatorMiddleware = require('../middlewares/validators.mw');
const { generalUrl, folders } = require('../../config/constants');
const { escapeRegExp } = require('../helpers/functions');

const commonFieldValidation = {
	image: [
		check('image')
			.trim()
			.notEmpty()
			.withMessage([
				'image must be not empty',
				'صورة الاعلان يجب أن لا تكون فارغه',
			])
			.bail()
			.isString()
			.withMessage([
				'Image URL should be string',
				'رابط صورة الاعلان يجب ان يكون نصاَ',
			])
			.bail()
			.isURL()
			.withMessage(['Image must be URL', 'صورة الاعلان ليست رابطاَ'])
			.bail()
			.matches(new RegExp(`^${generalUrl}${folders.ads}`))
			.withMessage([
				'Image URL does not match',
				'صورة الاعلان غير صالحة',
			]),
	],
	id: [
		param('id')
			.isMongoId()
			.withMessage(['Invalid MongoDB ObjectId', 'رقم تعريفي غير صالح']),
	],
};

exports.createAdValidator = [
	commonFieldValidation.image,
	check('title')
		.optional()
		.trim()
		.isString()
		.withMessage([
			'Title should be string',
			'عنوان الاعلان يجب ان يكون نصاً',
		]),
	check('description')
		.optional()
		.trim()
		.isString()
		.withMessage(['Description should be string', 'الوصف يجب ان يكون نصاً'])
		.isLength({ min: 3 })
		.withMessage([
			'Description should be with a minimum length of three characters',
			'الوصف يجب ان لا يكون اقل من 3 حروف',
		]),
	check('ours')
		.trim()
		.notEmpty()
		.withMessage(['you should choose type of ad', 'يجب اختيار نوع الاعلان'])
		.bail()
		.isBoolean()
		.withMessage(['invalid value', 'قيمة غير صحيحه']),
	check('link')
		.trim()
		.notEmpty()
		.withMessage(['link must be not empty', 'يجب اضافة رابط الاعلان'])
		.bail()
		.isURL()
		.withMessage(['link must be URL', 'يحب ان يكون رابطاً']),
	validatorMiddleware,
];

exports.adIdValidator = [commonFieldValidation.id, validatorMiddleware];

exports.updateAdValidator = [
	commonFieldValidation.id,
	oneOf(
		[
			check('image')
				.exists()
				.withMessage(['image Path is required', 'صورة الاعلان مطلوبه']),
			check('title')
				.exists()
				.withMessage(['Title is required', 'العنوان مطلوب']),
			check('description')
				.exists()
				.withMessage(['description is required', 'التفاصيل مطلوبه']),
			check('ours')
				.exists()
				.withMessage(['Type of Ad is required', 'نوع الاعلان مطلوب']),
			check('link')
				.exists()
				.withMessage(['link is required', 'رابط الاعلان مطلوب']),
		],
		{
			message: ['There is no Updates!', 'لا يوجد تحديثات'],
		},
	),
	check('image')
		.optional()
		.trim()
		.isString()
		.withMessage([
			'Image URL should be string',
			'رابط صورة الاعلان يجب ان يكون نصاَ',
		])
		.bail()
		.isURL()
		.withMessage(['Image must be URL', 'صورة الاعلان ليست رابطاَ'])
		.bail()
		.matches(new RegExp(`^${generalUrl}${folders.ads}`))
		.withMessage(['Image URL does not match', 'صورة الاعلان غير صالحة']),
	check('title')
		.optional()
		.trim()
		.isString()
		.withMessage(['Title should be string', 'العنوان يجب ان يكون نصاً']),
	check('description')
		.optional()
		.trim()
		.isString()
		.withMessage(['Description should be string', 'الوصف يجب ان يكون نصاً'])
		.isLength({ min: 3 })
		.withMessage([
			'Description should be with a minimum length of three characters',
			'الوصف يجب ان لا يقل عن 3 حروف',
		]),
	query('ours')
		.optional()
		.isBoolean()
		.withMessage(['invalid value', 'قيمة غير صحيحه']),
	check('link')
		.optional()
		.trim()
		.isURL()
		.withMessage(['link must be URL', 'يجب ان يكون رابطاً']),

	validatorMiddleware,
];

exports.getAllAdsValidator = [
	query('search')
		.trim()
		.customSanitizer((value) => {
			return escapeRegExp(value);
		}),
	query('ours')
		.optional()
		.trim()
		.isBoolean()
		.withMessage(['ours must be a boolean value']),
	validatorMiddleware,
];
