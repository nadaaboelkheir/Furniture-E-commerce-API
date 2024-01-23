const mongoose = require('mongoose');
const {
	generalUrl,
	folders,
	TargetCustomersEnum,
	notificationTypes,
} = require('../../config/constants');

const NotificationSchema = new mongoose.Schema(
	{
		image: {
			type: String,
			validate: {
				validator: (url) =>
					new RegExp(`^${generalUrl}${folders.notifications}`).test(
						url,
					),
				message: 'Image URL does not match',
			},
		},
		title: {
			type: String,
			required: [true, 'title required'],
		},
		description: {
			type: String,
			required: [true, 'description required'],
			minlength: [3, 'Too short description '],
			maxlength: [100, 'Too long description '],
		},
		targetCustomers: {
			type: String,
			enum: [TargetCustomersEnum],
			required: [true, 'Target Customers required'],
		},
		recievers: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Token',
			},
		],
		notificationResponse: {
			type: Array,
			require: [true, 'Recievers required'],
		},
		successCount: {
			type: Number,
			require: [true, 'Success Count required'],
		},
		failureCount: {
			type: Number,
			require: [true, 'Failure Count required'],
		},
		type: {
			type: String,
			enum: [notificationTypes],
			required: [true, 'Type required'],
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

module.exports = mongoose.model('Notification', NotificationSchema);
