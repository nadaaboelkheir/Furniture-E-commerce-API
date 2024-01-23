const mongoose = require('mongoose');
const { paymentMethods, orderStates } = require('../../config/constants');
const AddressSchema = require('../models/address');
const { isArrayNotEmpty } = require('../helpers/functions');
const SpecialOrderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		description: {
			type: String,
			required: [true, 'Product description is required'],
			minlength: [20, 'Too short product description'],
		},
		images: {
			type: [String],
			required: [true, 'Images are required'],
			validate: {
				validator: isArrayNotEmpty,
				message: 'At least one image is required',
			},
		},
		price: {
			type: Number,
			required: true,
		},
		shippingFees: {
			type: Number,
			required: true,
		},
		address: {
			type: AddressSchema,
			required: true,
		},
		paymentMethod: {
			type: String,
			enum: [paymentMethods],
			default: paymentMethods.cash,
		},
		feedbacks: {
			type: mongoose.Schema.ObjectId,
			ref: 'Feedback',
		},

		state: {
			type: String,
			enum: Object.values(orderStates),
			default: orderStates.inCart,
		},
		timeline: [
			{
				state: {
					type: String,
					enum: Object.values(orderStates),
					default: orderStates.inCart,
				},
				date: {
					type: Date,
					default: new Date(),
				},
				_id: false,
			},
		],
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('specialOrder', SpecialOrderSchema);
