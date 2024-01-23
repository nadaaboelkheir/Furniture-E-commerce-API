const mongoose = require('mongoose');
const AddressSchema = require('../models/address');
const {
	isArrayNotEmpty,
	removeFeildWithEmptyArray,
} = require('../helpers/functions');
const { SALT_ROUNDS } = require('../../config/constants');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			trim: true,
			required: [
				function () {
					return !this.isAdmin; // Only required if not an admin
				},
				'firstname is required ',
			],
		},
		lastName: {
			type: String,
			trim: true,
			required: [
				function () {
					return !this.isAdmin;
				},
				'last name is required',
			],
		},
		email: {
			type: String,
			required: [
				function () {
					return this.isAdmin;
				},
				'email is required',
			],
			lowercase: true,
		},
		phone: {
			type: String,
			required: [
				function () {
					return !this.isAdmin;
				},
				'phone is required',
			],
			unique: true,
		},

		password: {
			type: String,
			required: [true, 'password required'],
		},
		isBlocked: {
			type: Boolean,
			default: function () {
				if (!this.isAdmin) return false;
			},
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		addresses: [
			{
				type: AddressSchema,
				validate: [
					{
						validator: isArrayNotEmpty,
						message: 'At least one address is required',
					},
				],
			},
		],
		wishlist: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Product',
			},
		],
		orders: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Order',
			},
		],
		specialOrders: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'SpecialOrder',
			},
		],
		feedbacks: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Feedback',
			},
		],
		notifications: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Notification',
			},
		],
		cart: {
			type: mongoose.Schema.ObjectId,
			ref: 'Order',
		},
		isVerified: {
			type: Boolean,
			default: function () {
				if (!this.isAdmin) return false;
			},
		},
		newPhone: {
			//temporary field
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

UserSchema.pre('save', async function (next) {
	if (this.isAdmin) {
		removeFeildWithEmptyArray(this._doc);
	}

	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
	}
	next();
});
UserSchema.pre('updateOne', async function (next) {
	const updatedFields = this.getUpdate();

	if (updatedFields.password) {
		updatedFields.password = await bcrypt.hash(
			updatedFields.password,
			SALT_ROUNDS,
		);
	}

	next();
});
module.exports = mongoose.model('User', UserSchema);
