const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const TokenModel = require('../models/token.model');
const AsyncHandler = require('express-async-handler');
const { generateToken, decodeToken } = require('../helpers/functions');
const { sendVerificationCode, verifyCode } = require('../services/twilio');
const { ApiError } = require('../helpers/errorHandler');
const responseHandler = require('../helpers/responseHandler');
const { validateFirebaseToken } = require('../services/firebase');

exports.adminLogin = AsyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	const admin = await UserModel.findOne({ email, isAdmin: true });
	const passwordMatch = await bcrypt.compare(password, admin.password);

	if (!admin || !passwordMatch) {
		return next(
			new ApiError(
				'password or email incorrect',
				'كلمة المرور او البريد الالكتروني غير صحيح',
				401,
			),
		);
	}
	const token = generateToken.login(admin);

	await TokenModel.findOneAndUpdate(
		{ user: admin._id },
		{ $push: { loginTokens: token } },
		{ upsert: true },
	);

	return responseHandler(res, 200, {
		msg: 'Login successful',
		arMsg: 'تم تسجيل الدخول بنجاح',
		token,
	});
});
exports.userSignup = AsyncHandler(async (req, res, next) => {
	const { firstName, lastName, phone, email, newPassword, pushtoken } =
		req.body;
	let user = await UserModel.findOne({ phone, isAdmin: false });

	if (user) {
		if (user.isVerified) {
			return next(
				new ApiError(
					'User already exists and is verified',
					'تم التحقق من هذا المستخدم من قبل',
					403,
				),
			);
		}
		user.firstName = firstName;
		user.lastName = lastName;
		user.email = email;
		user.password = newPassword;
	} else {
		user = new UserModel({
			firstName,
			lastName,
			email,
			phone,
			password: newPassword,
		});
	}

	await sendVerificationCode(user.phone);

	await user.save();
	const token = generateToken.signup(user);

	if (pushtoken) {
		await validateFirebaseToken(pushtoken);
		await TokenModel.findOneAndUpdate(
			{ pushToken: pushtoken },
			{ user: user.id },
			{ upsert: true },
		);
	}

	return responseHandler(res, 201, {
		msg: 'Verification code sent successfully',
		arMsg: 'تم ارسال رمز التحقق بنجاح',
		verifySignupToken: token,
	});
});

exports.verifySignUpCode = AsyncHandler(async (req, res, next) => {
	const { verificationCode } = req.body;
	const user = req.user;
	const userDoc = await UserModel.findById(user.id);

	if (userDoc.isVerified) {
		throw new ApiError(
			'you are already verified',
			'لقد تم التحقق من قبل ',
			403,
		);
	}

	await verifyCode(user.phone, verificationCode);
	const token = generateToken.login(user);

	await TokenModel.findOneAndUpdate(
		{ user: user.id },
		{ $push: { loginTokens: token } },
		{ upsert: true },
	);
	userDoc.isVerified = true;
	await userDoc.save();

	return responseHandler(res, 200, {
		msg: 'User registered and verified successfully',
		arMsg: 'تم التسجيل و التحقق بنجاح',
		LoginToken: token,
	});
});

exports.userLogin = AsyncHandler(async (req, res, next) => {
	const { phone, password, pushtoken } = req.body;
	const user = await UserModel.findOne({ phone, isAdmin: false });

	if (!user) {
		return next(new ApiError('User not found', 'المستخدم غير موجود', 401));
	}
	const passwordMatch = await bcrypt.compare(password, user.password);

	if (!passwordMatch || !user.isVerified) {
		return next(
			new ApiError('Invalid credentials', 'بيانات الدخول غير صالحة', 401),
		);
	}
	const token = generateToken.login(user);

	let pushToken;

	if (pushtoken) {
		await validateFirebaseToken(pushtoken);
		pushToken = pushtoken;
	}

	await TokenModel.findOneAndUpdate(
		{ user: user.id },
		{ $push: { loginTokens: token }, pushToken: pushToken },
		{ upsert: true },
	);
	return responseHandler(res, 200, {
		msg: 'Login successful',
		arMsg: 'تم الدخول بنجاح',
		LoginToken: token,
	});
});

exports.verifyPhoneForForgotPassword = AsyncHandler(async (req, res, next) => {
	const { phone } = req.body;
	const user = await UserModel.findOne({
		phone,
		isVerified: true,
		isAdmin: false,
	});

	if (!user) {
		return next(new ApiError('User not found', 'المستخدم غير موجود', 401));
	}
	const tokenDoc = await TokenModel.findOne({ user: user._id });

	if (tokenDoc.resetToken) {
		if (decodeToken.resetPassword(tokenDoc.resetToken)) {
			throw new ApiError(
				'you already verified forgot password',
				undefined,
				403,
			);
		}

		tokenDoc.resetToken = undefined;
		await tokenDoc.save();
	}

	await sendVerificationCode(user.phone);
	const token = generateToken.forgotPassword(user);

	return responseHandler(res, 200, {
		msg: 'Verification code sent successfully',
		arMsg: 'تم ارسال رمز التحقق بنجاح',
		verifyPhoneForFogotPassword: token,
	});
});
exports.verifyForgotPasswordCode = AsyncHandler(async (req, res, next) => {
	const { verificationCode } = req.body;
	const user = req.user;
	const tokenDoc = await TokenModel.findOne({ user: user.id });

	if (tokenDoc.resetToken) {
		throw new ApiError(
			'you already verified forgot password',
			'حدث خطأ حاول مره اخري بعد 10 دقائق',
			403,
		);
	}

	await verifyCode(user.phone, verificationCode);
	const token = generateToken.resetPassword(user, req.user.exp);

	tokenDoc.resetToken = token;
	await tokenDoc.save();

	return responseHandler(res, 200, {
		msg: 'reset password verified successfully',
		arMsg: 'تم التحقق من إعادة تعيين كلمة السر بنجاح',
		resetPasswordToken: token,
	});
});
exports.resetPassword = AsyncHandler(async (req, res, next) => {
	const { newPassword, resetPasswordToken } = req.body;
	const user = req.user;

	const userDoc = await UserModel.findById(user.id);

	const tokenDoc = await TokenModel.findOne({
		user: user.id,
	});

	if (!tokenDoc.resetToken) {
		return next(
			new ApiError(
				'you have already reset your password',
				'لقد قمتَ بإعادة تعيين كلمة المرور بالفعل',
				403,
			),
		);
	} else if (tokenDoc.resetToken !== resetPasswordToken) {
		return next(new ApiError('Incorrect reset token', undefined, 498));
	}
	const isOldPasswordMatch = await bcrypt.compare(
		newPassword,
		userDoc.password,
	);

	if (isOldPasswordMatch) {
		return next(
			new ApiError(
				'please not use the old password ',
				'لا يمكن استخدام كلمة المرور السابقه',
				409,
			),
		);
	}
	userDoc.password = newPassword;
	await TokenModel.findOneAndUpdate(
		{ user: user.id },
		{ $unset: { resetToken: 1 } },
		{ upsert: true },
	);
	await userDoc.save();

	return responseHandler(res, 200, {
		msg: 'Password reset successful',
		arMsg: 'تم إعادة تعيين كلمة السر بنجاح',
	});
});

exports.changePassword = AsyncHandler(async (req, res, next) => {
	const { password, newPassword } = req.body;
	const user = req.user;
	const userDoc = await UserModel.findById(user.id);

	const isCorrectPassword = await bcrypt.compare(password, userDoc.password);

	if (!isCorrectPassword) {
		return next(
			new ApiError(
				'Incorrect current password ',
				'كلمة المرور الحاليه غير صحيحه',
				403,
			),
		);
	}

	const isOldPasswordMatch = await bcrypt.compare(
		newPassword,
		userDoc.password,
	);

	if (isOldPasswordMatch) {
		return next(
			new ApiError(
				'please not use the old password ',
				'لا يمكن استخدام كلمة المرور السابقه',
				409,
			),
		);
	}
	userDoc.password = newPassword;
	await userDoc.save();
	return responseHandler(res, 200, {
		msg: 'Password changes successful',
		arMsg: 'تم تغير كلمة المرور بنجاح',
	});
});
exports.logout = AsyncHandler(async (req, res) => {
	const user = req.user;
	const token = req.headers.authorization.split(' ')[1];

	await TokenModel.updateOne(
		{ user: user.id },
		{ $pull: { loginTokens: token } },
	);
	return responseHandler(res, 200, {
		msg: 'you are Logged out successfully',
		arMsg: 'تم تسجيل الخروج بنجاح',
	});
});
exports.updateUser = AsyncHandler(async (req, res) => {
	const { firstName, lastName, email } = req.body;
	const user = req.user;

	await UserModel.updateOne(
		{ _id: user.id },
		{ firstName, lastName, email },
		{ new: true },
	);
	return responseHandler(res, 200, {
		msg: 'user information updates successfully',
		arMsg: 'تم تعديل بيانات المستخدم بنجاح',
	});
});
exports.getUser = AsyncHandler(async (req, res) => {
	const user = req.user;
	const existanceUser = await UserModel.findOne({
		_id: user.id,
		isAdmin: false,
	}).select({
		firstName: 1,
		lastName: 1,
		email: 1,
		phone: 1,
	});

	return responseHandler(res, 200, { existanceUser });
});
exports.deleteAccount = AsyncHandler(async (req, res) => {
	/*hint for later: user has a reference in many documents if you try to populate it,
    it will not work =>
    we need to replace the null in populate with a string 'deleted account'
    @ShroukElBassiouny
    */
	await UserModel.deleteOne({ _id: req.user.id });
	await TokenModel.deleteOne({ user: req.user.id });

	return responseHandler(res, 202, {
		msg: 'account deleted successfully',
		arMsg: 'تم حذف بيانات المستخدم بنجاح',
	});
});

exports.changePhone = AsyncHandler(async (req, res, next) => {
	const { phone } = req.body;
	const users = await UserModel.find({
		$or: [{ _id: req.user.id }, { phone }],
	});
	const userIndex = users.findIndex(
		(user) => user.id.toString() == req.user.id,
	);
	const authenticatedUser = users[userIndex];

	if (authenticatedUser.phone == phone) {
		return next(new ApiError('this is already your phone', 409));
	}
	const anotherUserHasTheSamePhone = users[Number(!userIndex)];

	if (anotherUserHasTheSamePhone) {
		return next(
			new ApiError(
				'Phone already registered by another user',
				'تم تسجيل هذا الرقم بالفعل من قبل مستخدم آخر',
				409,
			),
		);
	}

	await sendVerificationCode(phone);

	authenticatedUser.newPhone = phone;
	await authenticatedUser.save();

	return responseHandler(res, 200, {
		msg: 'otp has been sent to new phone',
		arMsg: 'تم ارسال رمز التحقق للرقم الجديد',
	});
});
exports.verifyNewPhone = AsyncHandler(async (req, res, next) => {
	const { verificationCode } = req.body;
	const user = await UserModel.findById(req.user.id);

	if (!user.newPhone)
		throw new ApiError(
			"you didn't provide a new phone to change into",
			'أنت لم تقدم هاتفًا جديدًا للتغيير إليه',
			404,
		);

	await verifyCode(user.newPhone, verificationCode);

	user.phone = user.newPhone;
	user.newPhone = undefined;
	await user.save();

	return responseHandler(res, 200, {
		msg: 'phone changed successfully',
		arMsg: 'تم تغير رقم الهاتف بنجاح',
	});
});

exports.takeVisitorPushToken = AsyncHandler(async (req, res, next) => {
	const { pushtoken } = req.body;

	await validateFirebaseToken(pushtoken);
	await TokenModel.create({ pushToken: pushtoken });
	return responseHandler(res, 201, {
		msg: 'Token is valid and saved',
		arMsg: 'Token is valid and saved',
	});
});
