const mongoose = require('mongoose');
const ColorSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true,
	},
	hexacode: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('Color', ColorSchema);
