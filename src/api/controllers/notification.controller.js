const AsyncHandler = require('express-async-handler');
const { uploadImage } = require('../services/aws');
const notificationModel = require('../models/notification.model');
const TokenModel = require('../models/token.model');
const UserModel = require('../models/user.model');
const { ApiError } = require('../helpers/errorHandler');
const {
	TargetCustomersEnum,
	notificationTypes,
	limitOfDocsInOnePage,
} = require('../../config/constants');
const { arabicSearchRegexPattern } = require('../helpers/functions');
const { sendNotification } = require('../services/firebase');
const responseHandler = require('../helpers/responseHandler');

exports.uploadNotificationImage = AsyncHandler(async (req, res, next) => {
	const file = req.file;

	if (!file) {
		throw new ApiError('No file uploaded', 'لم يتم رفع صورة الإشعار', 422);
	}
	const image = await uploadImage(file, 'notifications');

	return responseHandler(res, 200, {
		msg: 'Image uploaded successfully',
		arMsg: 'تم رفع الصوره بنجاح',
		image: image,
	});
});

exports.createNotification = AsyncHandler(async (req, res, next) => {
	const { image, title, description, type, targetCustomers, receivers } =
		req.body;

	//test after create orders:
	let users = [];
	let tokens = [];
	let tokensId = [];
	let usersId = [];

	if (targetCustomers === TargetCustomersEnum.allUsers) {
		users = await TokenModel.find({
			user: { $exists: true },
			pushToken: { $exists: true, $ne: null },
		}).select('pushToken user');
	} else if (targetCustomers === TargetCustomersEnum.hasInCompleteCart) {
		const usersHaveInCompleteCart = await UserModel.find({
			cart: { $exists: true, $ne: null },
		}).select('_id');

		users = await TokenModel.find({
			user: { $in: usersHaveInCompleteCart },
			pushToken: { $exists: true, $ne: null },
		}).select('pushToken user');
	} else if (targetCustomers === TargetCustomersEnum.visitors) {
		users = await TokenModel.find({
			user: { $exists: false },
			pushToken: { $exists: true, $ne: null },
		}).select('pushToken user');
	} else if (targetCustomers === TargetCustomersEnum.someClients) {
		users = await TokenModel.find({ user: { $in: receivers } }).select(
			'pushToken user',
		);
	}

	if (!users.length) {
		return next(
			new ApiError(
				'There is no users!',
				'لا يوجد مستخدم مطابق للفئة المختاره',
				404,
			),
		);
	}

	users.forEach(({ pushToken, _id, user }) => {
		tokens.push(pushToken);
		tokensId.push(_id);
		usersId.push(user);
	});

	const NotificationDetails = await sendNotification(
		tokens,
		title,
		description,
		image,
	);

	const notification = await notificationModel.create({
		image,
		title,
		description,
		type,
		targetCustomers,
		recievers: tokensId,
		notificationResponse: NotificationDetails.notificationResponse,
		successCount: NotificationDetails.successCount,
		failureCount: NotificationDetails.failureCount,
	});

	if (notification.targetCustomers !== TargetCustomersEnum.visitors) {
		await UserModel.updateMany(
			{ _id: { $in: usersId } },
			{ $push: { notifications: notification._id } },
		);
	}

	return responseHandler(res, 201, {
		msg: 'Notification has been sent successfully',
		arMsg: 'تم إرسال الإشعار بنجاح',
	});
});

exports.getAllNotifications = AsyncHandler(async (req, res, next) => {
	const page = req.query.page || 1;
	const limit = req.query.limit || limitOfDocsInOnePage;
	const skip = (page - 1) * limit;

	let filters = {
		type: notificationTypes.dashboard,
	};

	if (req.query.search) {
		const search = req.query.search;

		filters.title = arabicSearchRegexPattern(search);
	}

	const Notifications = await notificationModel
		.find(filters)
		.select('image title description targetCustomers createdAt')
		.skip(skip)
		.limit(limit);

	const totalNotifications = await notificationModel.countDocuments(filters);
	const totalPages = Math.ceil(totalNotifications / limit);

	return responseHandler(res, 200, { Notifications, totalPages: totalPages });
});
