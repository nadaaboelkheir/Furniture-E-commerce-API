const mongoose = require('mongoose');
const TokenSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},

	loginTokens: [
		{
			type: String,
		},
	],
	pushToken: String,
	resetToken: String,
});

module.exports = mongoose.model('Token', TokenSchema);
