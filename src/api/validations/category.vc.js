const { check, param, query, oneOf } = require('express-validator');
const validatorMiddleware = require('../middlewares/validators.mw');
const { generalUrl, folders } = require('../../config/constants');
const { escapeRegExp } = require('../helpers/functions');
const commonFieldValidation = {
	name: [
		check('name')
			.trim()
			.notEmpty()
			.withMessage(['Category name is required', 'اسم القسم مطلوب'])
			.bail()
			.isLength({ min: 3, max: 40 })
			.withMessage([
				'Category name must be between 3 and 40 characters',
				'اسم القسم يجب ان لا يكون اقل من 3 حروف و لا يزيد عن 40 حرف',
			]),
	],
	description: [
		check('description')
			.optional()
			.trim()
			.isLength({ min: 3, max: 1000 })
			.withMessage([
				'Description must be between 3 and 1000 characters',
				'وصف القسم يجب الا يقل عن 3 حروف و لا يزيد عن 1000 حروف',
			]),
	],
	categoryId: [
		param('categoryId')
			.isMongoId()
			.withMessage(['Invalid MongoDB ObjectId', 'رقم تعريفي غير صالح']),
	],
	image: [
		check('image')
			.optional()
			.matches(new RegExp(`^${generalUrl}${folders.categories}`))
			.withMessage(['Image URL does not match', 'صورة القسم غير صالحة']),
	],
};

exports.createCategoryValidator = [
	commonFieldValidation.name,
	commonFieldValidation.description,
	commonFieldValidation.image,
	validatorMiddleware,
];
exports.deleteCategoryValidator = [
	commonFieldValidation.categoryId,
	validatorMiddleware,
];
exports.updateCategoryValidator = [
	commonFieldValidation.categoryId,
	oneOf(
		[
			commonFieldValidation.name,
			check('description')
				.exists()
				.withMessage([
					'Category description field is not exist',
					'وصف القسم يجب الايكون فارغأَ',
				])
				.bail()
				.trim()
				.notEmpty()
				.withMessage([
					'Category description is required',
					'وصف القسم مطلوب',
				])
				.bail()
				.isLength({ min: 3, max: 1000 })
				.withMessage([
					'Description must be between 3 and 1000 characters',
					'وصف القسم يجب الا يقل عن 3 حروف و لا يزيد عن 1000 حروف',
				]),
			check('image')
				.exists()
				.withMessage(['Category name is required', 'اسم القسم مطلوب'])
				.bail()
				.trim()
				.notEmpty()
				.withMessage([
					'Category image is required',
					'صورة القسم مطلوبه',
				])
				.bail()
				.matches(new RegExp(`^${generalUrl}${folders.categories}`))
				.withMessage([
					'Image URL does not match',
					'صورة القسم غير صالحة',
				]),
		],
		{
			message: ['There is no Updates!', 'لا يوجد تحديثات'],
			errorType: 'least_errored',
		},
	),
	validatorMiddleware,
];
exports.getCategoryByIdValidator = [
	commonFieldValidation.categoryId,
	validatorMiddleware,
];
exports.toggleHideCategoryValidator = [
	commonFieldValidation.categoryId,
	validatorMiddleware,
];
exports.getAllCategoriesValidator = [
	query('search')
		.trim()
		.customSanitizer((value) => {
			return escapeRegExp(value);
		}),
	query('isHidden')
		.optional()
		.trim()
		.isBoolean()
		.withMessage(['isHidden must be a boolean value'])
		.toBoolean(),
	validatorMiddleware,
];
