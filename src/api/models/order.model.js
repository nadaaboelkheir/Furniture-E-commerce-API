const mongoose = require('mongoose');
const { paymentMethods, orderStates } = require('../../config/constants');
const AddressSchema = require('../models/address');
const OrderSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	items: [
		{
			price: {
				type: Number,
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
			},
			product: {
				type: mongoose.Schema.ObjectId,
				ref: 'Product',
				required: true,
				unique: true,
			},
			_id: false,
		},
	],
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
	feedbacks: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'Feedback',
		},
	],
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
				default: Date.now(),
			},
			_id: false,
		},
	],
});

module.exports = mongoose.model('Order', OrderSchema);
