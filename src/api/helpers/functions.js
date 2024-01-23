const {
	MAXLENGTH_ARRAYS,
	MINLENGTH_ARRAYS,
} = require('../../config/constants');
const {
	JWT_LOGIN_SECRET_KEY,
	JWT_SIGNUP_SECRET_KEY,
	JWT_FORGOTPASSWORD_SECRET_KEY,
	JWT_RESETPASSWORD_SECRET_KEY,
} = require('../helpers/env');
const jwt = require('jsonwebtoken');
const { JwtError } = require('./errorHandler');
const isArrayNotEmpty = (array) => array.length > 0;
const areAllArraysEqualLength = (arrayOfArrays) => {
	const firstInnerArrayLength = arrayOfArrays[0].length;

	return arrayOfArrays.every(
		(innerArray) => innerArray.length === firstInnerArrayLength,
	);
};
const validateRangeArray = (
	array,
	minlength = MAXLENGTH_ARRAYS,
	maxlength = MINLENGTH_ARRAYS,
) => {
	const firstInnerArrayLength = array[0].length;

	return (
		firstInnerArrayLength >= minlength && firstInnerArrayLength <= maxlength
	);
};
const removeFeildWithEmptyArray = (doc) => {
	for (const field in doc) {
		if (Array.isArray(doc[field]) && doc[field].length === 0) {
			delete doc[field];
		}
	}
};

const generateToken = {
	login: (user) => {
		return jwt.sign(
			{
				id: user._id,
				isAdmin: user.isAdmin,
			},
			JWT_LOGIN_SECRET_KEY,
			{
				expiresIn: '1y',
			},
		);
	},
	signup: (user) => {
		return jwt.sign(
			{ id: user._id, phone: user.phone },
			JWT_SIGNUP_SECRET_KEY,
			{
				expiresIn: '10m',
			},
		);
	},
	forgotPassword: (user) => {
		return jwt.sign(
			{ id: user._id, phone: user.phone },
			JWT_FORGOTPASSWORD_SECRET_KEY,
			{
				expiresIn: '10m',
			},
		);
	},
	resetPassword: (user, date) => {
		const remainingTime = date - Math.floor(Date.now() / 1000);

		return jwt.sign(
			{ id: user._id, phone: user.phone },
			JWT_FORGOTPASSWORD_SECRET_KEY,
			{
				expiresIn: `${remainingTime}s`,
			},
		);
	},
};

const arrayOfUniqueElements = (array) => {
	const arrayOfStrings = array.map((obj) => JSON.stringify(obj));
	let uniqueSet = new Set(arrayOfStrings);

	return uniqueSet.size === array.length;
};

const arabicSearchRegexPattern = (searchQuery) => {
	const alfLettersRegex = /[أإاآ]/;
	const yaaRegex = /[ىيئ]/;
	const endingHaaRegex = /[هة]$/;

	if (searchQuery.match(alfLettersRegex)) {
		searchQuery = searchQuery.replace(/[أإاآ]/g, '[أإاآ]');
	}

	if (searchQuery.match(yaaRegex)) {
		searchQuery = searchQuery.replace(/[ىيئ]/g, '[ىيئ]');
	}

	if (searchQuery.match(endingHaaRegex)) {
		searchQuery = searchQuery.replace(/[هة]$/g, '[هة]$');
	}

	const searchRegex = new RegExp(searchQuery, 'i');

	return searchRegex;
};

const escapeRegExp = (string) => {
	return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

const decodeToken = {
	login: (token) => {
		return jwt.verify(token, JWT_LOGIN_SECRET_KEY, (err, decoded) => {
			if (err) {
				if (err.message === 'jwt expired') {
					throw new JwtError(
						err.message,
						'انتهت الوقت المحدد لارسال رمز التحقق برجاء المحاولة مره اخري',
						401,
					);
				}
				throw new JwtError(err.message, undefined, 401);
			}
			return decoded;
		});
	},
	signup: (token) => {
		return jwt.verify(token, JWT_SIGNUP_SECRET_KEY, (err, decoded) => {
			if (err) {
				if (err.message === 'jwt expired') {
					throw new JwtError(
						err.message,
						'انتهت الوقت المحدد لارسال رمز التحقق برجاء المحاولة مره اخري',
						401,
					);
				}
				throw new JwtError(err.message, undefined, 401);
			}
			return decoded;
		});
	},
	forgotPassword: (token) => {
		return jwt.verify(
			token,
			JWT_FORGOTPASSWORD_SECRET_KEY,
			(err, decoded) => {
				if (err) {
					if (err.message === 'jwt expired') {
						throw new JwtError(
							err.message,
							'انتهت الوقت المحدد لارسال رمز التحقق برجاء المحاولة مره اخري',
							401,
						);
					}
					throw new JwtError(err.message, undefined, 401);
				}
				return decoded;
			},
		);
	},
	resetPassword: (token) => {
		return jwt.verify(
			token,
			JWT_RESETPASSWORD_SECRET_KEY,
			(err, decoded) => {
				if (err) {
					return false;
				}
				return decoded;
			},
		);
	},
};

const differenceBetweenDatesInMinites = (date1, date2 = new Date()) => {
	const diffTime = Math.abs(date2 - date1);

	return Math.ceil(diffTime / (1000 * 60));
};

module.exports = {
	isArrayNotEmpty,
	areAllArraysEqualLength,
	validateRangeArray,
	removeFeildWithEmptyArray,
	generateToken,
	arrayOfUniqueElements,
	arabicSearchRegexPattern,
	decodeToken,
	escapeRegExp,
	differenceBetweenDatesInMinites,
};
