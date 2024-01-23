const mongoose = require('mongoose');
const { arrayOfUniqueElements } = require('../helpers/functions');
const { ApiError } = require('../helpers/errorHandler');
const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			unique: [true, 'Category must be unique'],
			minlength: [3, 'Too short category name'],
			maxlength: [40, 'Too long category name'],
			required: [true, 'category name required'],
		},
		description: {
			type: String,
			minlength: [3, 'Too short description name'],
			maxlength: [1000, 'Too long description name'],
		},
		image: {
			type: String,
		},
		isHidden: {
			type: Boolean,
			default: false,
		},
		products: {
			type: [
				{
					type: mongoose.Schema.ObjectId,
					ref: 'Product',
				},
			],
			validate: {
				validator: arrayOfUniqueElements,
				message: 'Products must be unique',
			},
		},
	},
	{ timestamps: true },
);

CategorySchema.post('save', function (error, doc, next) {
	if (error.name === 'MongoServerError' && error.code === 11000) {
		return next(
			new ApiError(
				'duplicate error for unique field ',
				'تم اضافة هذا القسم من قبل',
				409,
			),
		);
	} else if (error.name === 'ValidationError') {
		return next(
			new ApiError(
				'you try to add product twice',
				'تم اضافة هذاالمنتج من قبل الي القسم',
				409,
			),
		);
	} else {
		return next(new ApiError(error));
	}
});

module.exports = mongoose.model('Category', CategorySchema);
