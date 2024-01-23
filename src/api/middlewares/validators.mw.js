const { validationResult } = require('express-validator');
const responseHandler = require('../helpers/responseHandler');

const ValidatorMiddleware = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return responseHandler(res, 422, { errors: errors.array() });
	}
	next();
};

module.exports = ValidatorMiddleware;
