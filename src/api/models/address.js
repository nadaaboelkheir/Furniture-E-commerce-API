const mongoose = require('mongoose');
const AddressSchema = new mongoose.Schema(
	{
		name: String,
		address: {
			type: String,
			required: [true, 'Please add address'],
		},
		city: {
			type: String,
			required: [true, 'Please add city'],
		},
		state: {
			type: String,
			required: [true, 'Please add state'],
		},
		postalCode: {
			type: String,
			required: [true, 'Please add postalCode'],
		},
		unitNumber: {
			type: Number,
			required: [true, 'Please add unitNumber'],
		},
		floorNumber: {
			type: Number,
			required: [true, 'Please add floorNumber'],
		},
		coordinates: {
			latitude: {
				type: Number,
				required: true,
			},
			longitude: {
				type: Number,
				required: true,
			},
		},
	},
	{
		_id: false,
	},
);

module.exports = AddressSchema;
