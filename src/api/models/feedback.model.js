const mongoose = require('mongoose');
const FeedbackSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		product: {
			type: mongoose.Schema.ObjectId,
			ref: 'Product',
			required: true,
		},
		isHidden: {
			type: Boolean,
			default: false,
		},
		comment: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
