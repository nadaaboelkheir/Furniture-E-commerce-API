const AsyncHandler = require('express-async-handler');
const { uploadImage, deleteImage } = require('../services/aws');
const AdsModel = require('../models/ads.model');
const { ApiError } = require('../helpers/errorHandler');
const { arabicSearchRegexPattern } = require('../helpers/functions');
const { userTypes, limitOfDocsInOnePage } = require('../../config/constants');
const responseHandler = require('../helpers/responseHandler');

exports.uploadAdImage = AsyncHandler(async (req, res, next) => {
	const file = req.file;

	if (!file) {
		throw new ApiError('No file uploaded', 'لم يتم رفع صورة الاعلان', 422);
	}
	const image = await uploadImage(file, 'ads');

	return responseHandler(res, 200, {
		msg: 'Image uploaded successfully',
		arMsg: 'تم رفع الصوره بنجاح',
		image: image,
	});
});

exports.createAd = AsyncHandler(async (req, res) => {
	const { image, title, description, ours, link } = req.body;
	const ad = await AdsModel.create({
		image,
		title,
		description,
		ours,
		link,
	});

	return responseHandler(res, 201, {
		msg: 'Advertisement created successfully',
		arMsg: 'تم انشاء الإعلان بنجاح',
		id: ad.id,
	});
});

exports.getAdById = AsyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const ad = await AdsModel.findById(id).select('-visitors -__v');

	if (!ad) {
		return next(
			new ApiError(
				'Advertisement not found',
				'هذا الاعلان غير موجود',
				404,
			),
		);
	}

	return responseHandler(res, 200, { ad });
});

exports.updateAd = AsyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const ad = await AdsModel.findById(id);

	if (!ad) {
		return next(
			new ApiError(
				'Advertisement not found',
				'هذا الاعلان غير موجود',
				404,
			),
		);
	}

	const { image, title, description, ours, link } = req.body;

	if (image && image !== ad.image) {
		await deleteImage(ad.image);
		ad.image = image;
	}

	ad.title = title || ad.title;
	ad.description = description || ad.description;
	ad.ours = ours || ad.ours;
	ad.link = link || ad.link;

	await ad.save();

	return responseHandler(res, 200, {
		msg: 'Ad has been updated successfully',
		arMsg: 'تم تعديل بيانات الإعلان بنجاح',
	});
});

exports.deleteAd = AsyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const ad = await AdsModel.findById(id);

	if (!ad) {
		return next(
			new ApiError(
				'Advertisement not found',
				'هذا الاعلان غير موجود',
				404,
			),
		);
	}

	await deleteImage(ad.image);
	await AdsModel.deleteOne({ _id: id });

	return responseHandler(res, 200, {
		msg: 'Advertisement has been deleted successfully',
		arMsg: 'تم حذف بيانات الإعلان بنجاح',
	});
});

exports.toggleActivate = AsyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const ad = await AdsModel.findById(id);

	if (!ad) {
		return next(
			new ApiError(
				'Advertisement not found',
				'هذا الاعلان غير موجود',
				404,
			),
		);
	}

	ad.active = !ad.active;
	await ad.save();

	return responseHandler(res, 200, {
		msg: `Advertisement has been ${
			ad.active ? 'activated' : 'deactivated'
		} successfully`,
		arMsg: `تم ${ad.active ? 'تفعيل' : 'إالغاء تفعيل'} الإعلان بنجاح`,
	});
});

exports.viewAd = AsyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const ad = await AdsModel.findById(id);

	if (!ad) {
		return next(
			new ApiError(
				'Advertisement not found',
				'هذا الاعلان غير موجود',
				404,
			),
		);
	}

	const clicker = req.user?.id || req.user.type;

	ad.visitors.push(clicker);
	await ad.save();

	return responseHandler(res, 200, {
		msg: 'Advertisement has been viewed',
		arMsg: 'تم مشاهدةالإعلان ',
	});
});

exports.allAds = AsyncHandler(async (req, res, next) => {
	const page = req.query.page || 1;
	const limit = req.query.limit || limitOfDocsInOnePage;
	const skip = (page - 1) * limit;

	let filters = {
		active: true,
	};

	let selectFields = 'title image link';

	if (req.user?.type === userTypes.admin) {
		filters = {};

		selectFields = {
			title: 1,
			description: 1,
			active: 1,
			ours: 1,
			clicks: { $size: '$visitors' },
		};

		if (req.query.search) {
			const search = req.query.search;

			filters.title = arabicSearchRegexPattern(search);
		}

		if (req.query.ours) {
			filters.ours = req.query.ours;
		}
	}

	const ads = await AdsModel.find(filters)
		.select(selectFields)
		.skip(skip)
		.limit(limit);
	const totalAds = await AdsModel.countDocuments(filters);
	const totalPages = Math.ceil(totalAds / limit);

	return responseHandler(res, 200, { ads, totalPages: totalPages });
});
