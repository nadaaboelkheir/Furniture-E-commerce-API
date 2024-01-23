const mongoose = require('mongoose');
const {
	isArrayNotEmpty,
	validateRangeArray,
	areAllArraysEqualLength,
} = require('../helpers/functions');

const ProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: [3, 'Too short product title'],
			maxlength: [100, 'Too long product title'],
		},
		description: {
			type: String,
			required: [true, 'Product description is required'],
			minlength: [20, 'Too short product description'],
		},
		width: {
			type: Number,
			required: true,
		},
		height: {
			type: Number,
			required: true,
		},
		length: {
			type: Number,
			required: true,
		},
		maxload: {
			type: Number,
			required: true,
		},
		images: {
			type: [String],
			required: true,
			validate: {
				validator: isArrayNotEmpty,
				message: 'At least one image is required',
			},
		},
		price: {
			type: Number,
			required: [true, 'Product price is required'],
			trim: true,
		},
		priceAfterDiscount: {
			type: Number,
		},
		priceBeforeDiscount: {
			type: Number,
		},
		addDiscountAt: Date,
		shippingFees: {
			type: Number,
			required: true,
		},
		ratings: {
			type: Number,
			min: [1, 'Rating must be above or equal 1.0'],
			max: [5, 'Rating must be below or equal 5.0'],
		},

		category: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Category',
			},
		],
		orders: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Order',
			},
		],
		feedbacks: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Feedback',
			},
		],
		colors: {
			type: [
				{
					type: mongoose.Schema.ObjectId,
					ref: 'Color',
				},
			],
			validate: [
				{
					validator: isArrayNotEmpty,
					message: 'At least one color array is required',
				},

				{
					validator: areAllArraysEqualLength,
					message: 'All color arrays must have the same length ',
				},
				{
					validator: validateRangeArray,
					message:
						'All color arrays must have the same range from 1 to 3',
				},
			],
		},

		isHidden: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Product', ProductSchema);
