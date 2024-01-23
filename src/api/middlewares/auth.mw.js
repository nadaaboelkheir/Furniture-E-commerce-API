const AsyncHandler = require('express-async-handler');

const TokenModel = require('../models/token.model');
const { JwtError } = require('../helpers/errorHandler');
const { userTypes } = require('../../config/constants');
const { decodeToken } = require('../helpers/functions');
const userModel = require('../models/user.model');

const validateBearerToken = (authHeader) => {
	if (!authHeader.startsWith('Bearer')) {
		throw new JwtError(
			'No valid Authorization header with Bearer token',
			' استخدم Bearer token',
			401,
		);
	}
};

const validateSession = async (token, decodedToken) => {
	const userId = decodedToken.id;
	const userToken = await TokenModel.findOne({
		user: userId,
		loginTokens: token,
	});

	if (!userToken) {
		throw new JwtError(
			'Token not exist for this user ',
			'انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى',
			401,
		);
	}
};

exports.isAuthOrVisitor = AsyncHandler(async (req, res, next) => {
	if (req.headers.authorization) {
		const authHeader = req.headers.authorization;

		validateBearerToken(authHeader);
		const token = authHeader.split(' ')[1];
		const decodedToken = decodeToken.login(token);

		await validateSession(token, decodedToken);

		req.user = decodedToken;
		req.user.type = decodedToken.isAdmin ? userTypes.admin : userTypes.user;
		const user = await userModel
			.findById(decodedToken.id)
			.select('isBlocked');

		if (user.isBlocked) {
			return next(
				new JwtError('user is blocked', 'هذا المستخدم محظور', 403),
			);
		}
	} else {
		req.user = {
			type: userTypes.visitor,
		};
	}
	next();
});

exports.allow = (allowedUserTypes) => {
	return (req, res, next) => {
		if (!allowedUserTypes.includes(req.user.type)) {
			next(
				new JwtError(
					'user type not allowed ',
					'غير مسموح لهذا المستخدم الدخول',
					403,
				),
			);
		}
		next();
	};
};

exports.hasSignedUp = AsyncHandler(async (req, res, next) => {
	if (!req.headers.authorization) {
		return next(
			new JwtError(
				'Authorization header is missing',
				'Authorization header غير موجود',
				401,
			),
		);
	}
	const authHeader = req.headers.authorization;

	validateBearerToken(authHeader);
	const token = authHeader.split(' ')[1];

	const decodedToken = decodeToken.signup(token);

	req.user = decodedToken;
	next();
});

exports.hasForgotPassword = AsyncHandler(async (req, res, next) => {
	if (!req.headers.authorization) {
		return next(
			new JwtError(
				'Authorization header is missing',
				'Authorization header غير موجود',
				401,
			),
		);
	}
	const authHeader = req.headers.authorization;

	validateBearerToken(authHeader);
	const token = authHeader.split(' ')[1];
	const decodedToken = decodeToken.forgotPassword(token);

	req.user = decodedToken;
	next();
});
