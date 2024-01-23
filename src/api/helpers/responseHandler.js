const { NODE_ENV } = require('./env');

const responseHandler = (res, status, responseObj) => {
	let finalResponse = {};
	let arMsgs = 1;
	let DataResponse;

	if (
		!(
			NODE_ENV?.trim() === 'production' ||
			NODE_ENV?.trim() === 'PreProduction'
		)
	) {
		delete responseObj.arMsg;
		arMsgs = 0;
	} else {
		delete responseObj.msg;
		finalResponse.status = status;
	}
	if (responseObj.errors) {
		finalResponse.errors = {};
		responseObj.errors.map(
			(err) =>
				(finalResponse.errors[err.path] =
					err.msg[arMsgs] || err.msg[0]),
		);
	} else {
		const { arMsg, msg, ...response } = responseObj;

		finalResponse.msg = arMsg || msg;
		DataResponse = response;
	}
	return res.status(status).json({ ...finalResponse, ...DataResponse });
};

module.exports = responseHandler;
