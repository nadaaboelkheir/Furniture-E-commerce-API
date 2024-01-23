const { deleteImage, uploadImage } = require('../services/aws');
const { ApiError } = require('../helpers/errorHandler');
const AsyncHandler = require('express-async-handler');
const CategoryModel = require('../models/category.model');
const ProductModel = require('../models/product.model');
const responseHandler = require('../helpers/responseHandler');
const { limitOfDocsInOnePage } = require('../../config/constants');
const { arabicSearchRegexPattern } = require('../helpers/functions');

exports.uploadCategoryImage = AsyncHandler(async (req, res, next) => {
	const file = req.file;

	if (!file) {
		throw new ApiError('No file uploaded', 'لم يتم رفع صورة الإشعار', 422);
	}
	const image = await uploadImage(file, 'categories');

	return responseHandler(res, 200, {
		msg: 'Image uploaded successfully',
		arMsg: 'تم رفع الصوره بنجاح',
		image: image,
	});
});

exports.createCategory = AsyncHandler(async (req, res) => {
	const { name, description, image } = req.body;

	await CategoryModel.create({
		name,
		description,
		image,
	});

	return responseHandler(res, 201, {
		msg: 'Category created successfully',
		arMsg: 'تم إنشاء القسم بنجاح',
	});
});

exports.deleteCategory = AsyncHandler(async (req, res, next) => {
	const { categoryId } = req.params;
	const category = await CategoryModel.findById(categoryId);

	if (!category) {
		return next(
			new ApiError('Category not found', 'هذا القسم غير موجود', 404),
		);
	} else {
		await ProductModel.updateMany(
			{ category: category._id },
			{ $pull: { category: category._id } },
		);

		await deleteImage(category.image);
		await CategoryModel.deleteOne({ _id: categoryId });

		return responseHandler(res, 200, {
			msg: 'Category deleted successfully',
			arMsg: 'تم حذف القسم بنجاح',
		});
	}
});

exports.updateCategory = AsyncHandler(async (req, res, next) => {
	const { name, description, image } = req.body;
	const { categoryId } = req.params;
	const category = await CategoryModel.findById(categoryId);

	if (!category) {
		return next(
			new ApiError('Category not found', 'هذا القسم غير موجود', 404),
		);
	}

	if (image && image !== category.image) {
		await deleteImage(category.image);
		category.image = image;
	}
	category.name = name || category.name;
	category.description = description || category.description;
	await category.save();

	return responseHandler(res, 200, {
		msg: 'Category details updated successfully',
		arMsg: 'تم تعديل بيانات القسم بنجاح',
	});
});

exports.getCategoryById = AsyncHandler(async (req, res, next) => {
	const { categoryId } = req.params;
	const category = await CategoryModel.findById(categoryId, {
		name: 1,
		description: 1,
		image: 1,
		isHidden: 1,
	});

	if (!category) {
		return next(
			new ApiError('Category not found', 'هذا القسم غير موجود', 404),
		);
	}
	return responseHandler(res, 200, { category });
});
exports.toggleHideCategory = AsyncHandler(async (req, res, next) => {
	const { categoryId } = req.params;
	const category = await CategoryModel.findById(categoryId);

	if (!category) {
		return next(
			new ApiError('Category not found', 'هذا القسم غير موجود', 404),
		);
	}
	category.isHidden = !category.isHidden;
	await category.save();
	return responseHandler(res, 200, {
		msg: `Category is ${
			category.isHidden ? 'hidden' : 'unhidden'
		} successfully`,
		arMsg: `تم ${category.isHidden ? 'إخفاء' : 'إظهار'} الإعلان بنجاح`,
		isHidden: category.isHidden,
	});
});

exports.getAllCategories = AsyncHandler(async (req, res, next) => {
	const page = req.query.page || 1;
	const limit = Number(req.query.limit) || limitOfDocsInOnePage;
	const skip = Number(page - 1) * limit;

	let filters = {};

	if (req.query.isHidden !== undefined) {
		filters.isHidden = req.query.isHidden;
	}

	if (req.query.search) {
		const search = req.query.search;

		filters.name = arabicSearchRegexPattern(search);
	}

	const categories = await CategoryModel.aggregate([
		{
			$match: filters,
		},
		{
			$addFields: {
				productCount: { $size: '$products' },
			},
		},
		{
			$skip: skip,
		},
		{
			$limit: limit,
		},

		{
			$project: {
				_id: 1,
				name: 1,
				description: 1,
				image: 1,
				isHidden: 1,
				productCount: 1,
			},
		},
	]);

	const totalCategories = await CategoryModel.countDocuments(filters);
	const totalPages = Math.ceil(totalCategories / limit);

	return responseHandler(res, 200, {
		categories,
		totalPages: totalPages,
	});
});
