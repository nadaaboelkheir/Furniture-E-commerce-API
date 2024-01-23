const mongoose = require('mongoose');
const { generalUrl, folders } = require('../../config/constants');

const AdsSchema = new mongoose.Schema(
	{
		image: {
			type: String,
			required: [true, 'image required'],
			validate: {
				validator: (url) =>
					new RegExp(`^${generalUrl}${folders.ads}`).test(url),
				message: 'Image URL does not match',
			},
		},
		title: {
			type: String,
		},
		description: {
			type: String,
			minlength: [3, 'Too short description '],
		},
		visitors: [
			{
				type: mongoose.Schema.Types.Mixed,
			},
		],
		active: {
			type: Boolean,
			default: true,
		},
		ours: {
			type: Boolean,
			required: true,
		},
		link: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Ad', AdsSchema);
