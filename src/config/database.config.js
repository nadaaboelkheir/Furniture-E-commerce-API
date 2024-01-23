const mongoose = require('mongoose');
const { DB_URL } = require('../api/helpers/env');

module.exports = () => {
	mongoose.set('strictQuery', false);
	return mongoose.connect(DB_URL);
};
