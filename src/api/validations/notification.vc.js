const { check, param, query } = require('express-validator');
const validatorMiddleware = require('../middlewares/validators.mw');
const {
	generalUrl,
	folders,
	TargetCustomersEnum,
	notificationTypes,
} = require('../../config/constants');
const { escapeRegExp } = require('../helpers/functions');

const commonFieldValidation = {
	image: [
		check('image')
			.optional()
			.trim()
			.isString()
			.withMessage([
				'Image URL should be string',
				'صورة الإشعار ليست نصاً',
			])
			.bail()
			.isURL()
			.withMessage(['Image must be URL', 'صورة الإشعار ليست رابطاً'])
			.bail()
			.matches(new RegExp(`^${generalUrl}${folders.notifications}`))
			.withMessage([
				'Image URL does not match',
				'صورة الإشعار غير صالحة',
			]),
	],
	id: [
		param('id')
			.isMongoId()
			.withMessage(['Invalid MongoDB ObjectId', 'رقم تعريفي غير صالح']),
	],
};

exports.createNotificationValidator = [
	commonFieldValidation.image,
	check('title')
		.trim()
		.notEmpty()
		.withMessage([
			'Title must be not empty',
			'عنوان الإشعار لا يجب ان يكون فارغاً',
		])
		.bail()
		.isString()
		.withMessage([
			'Title should be string',
			'عنوان الإشعار يجب ان يكون نصاً',
		]),
	check('description')
		.trim()
		.notEmpty()
		.withMessage([
			'Description must be not empty',
			'تفاصيل الإشعار لا يجب ان تكون فارغه',
		])
		.bail()
		.isString()
		.withMessage([
			'Description should be string',
			'تفاصيل الإشعار يجب ان تكون نصاً',
		])
		.isLength({ min: 3, max: 100 })
		.withMessage([
			'Description should be with a minimum length of three characters',
			'تفاصيل الإشعار يجب ان تكون اكتر من ثلاثة حروف',
		]),
	check('targetCustomers')
		.trim()
		.notEmpty()
		.withMessage(
			'TargetCustomers Should be not empty',
			'نوع العملاء المستهدفين لا يجب ان يكون فارغاَ',
		)
		.bail()
		.isIn(Object.values(TargetCustomersEnum))
		.withMessage([
			'Invaild Type: you should choose one of this: جميع العملاء , العملاء أصحاب السلة الغير مكتملة , الزوار , اختيار بعض العملاء',
			'نوع غير صالح ، برجاء اختيار النوع من الاختيارات الآتيه : جميع العملاء , العملاء أصحاب السلة الغير مكتملة , الزوار , اختيار بعض العملاء',
		]),
	check('type')
		.trim()
		.notEmpty()
		.withMessage([
			'Type Should be not empty',
			'نوع الإشعار يجب ان لا يكون فارغاً',
		])
		.bail()
		.isIn(Object.values(notificationTypes))
		.withMessage([
			'Invaild Type: you should choose one of this: dashboard , autoGenerated',
			'نوع غير صالح ، برجاء إختيار النوع من الاختيارات التاليه : dashboard , autoGenerated ',
		]),
	check('receivers')
		.if(check('targetCustomers').equals(TargetCustomersEnum.someClients))
		.isArray({ min: 1 })
		.withMessage([
			'you should choose some clients!',
			'يجب اختيار بعض العملاء',
		]),
	check('receivers.*')
		.trim()
		.isMongoId()
		.withMessage(['Invalid MongoDB ObjectId', 'رقم تعريفي غير صالح']),
	validatorMiddleware,
];

exports.getAllNotificationsValidator = [
	query('search')
		.trim()
		.customSanitizer((value) => {
			return escapeRegExp(value);
		}),
	validatorMiddleware,
];
