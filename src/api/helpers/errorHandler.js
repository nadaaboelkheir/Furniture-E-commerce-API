//  this class is responsible about operation errors (errors that i can predict)
class ApiError extends Error {
	constructor(message, arMessage, statusCode) {
		super(message);
		this.arName = 'خطأ';
		this.arMessage = arMessage || 'خطأ غير معروف';
		this.status = statusCode || 500;
	}
}

class TwilioError extends ApiError {
	constructor(error) {
		super(error.message, error.status);
		this.name = 'Twilio Error';
		this.arName = 'خطأ في تويليو';
		this.twilioMessage = error.message;
		this.code = error.code;
		this.moreInfo = error.moreInfo;
		this.details = error.details;
		this.arMessage = undefined;
		if (error.code === 20404 && error.status === 404) {
			this.message =
				'otp expired, has not been sent yet or already verified';
			this.arMessage =
				'انتهت صلاحية رمز التحقق ، لم يتم إرساله بعد، أو تم التحقق منه بالفعل';
			this.status = 404;
		} else if (error.code === 20003 && error.status === 401) {
			//will not happen in production
			this.message =
				'wrong credintials provided or free trial 15$ expired';
			this.status = 401;
		} else if (error.code === 21608 && error.status === 403) {
			//will not happen in production
			this.message =
				'this is a free trial account from twilio only verified numbers are allowed to use it';
			this.status = 403;
		} else if (
			(error.code === 60202 || error.code === 60203) &&
			error.status === 429
		) {
			this.message =
				'you reached 5 attempts, wait untill the current verification expires (10 min)';
			this.arMessage =
				'لقد وصلت إلى 5 محاولات، انتظر حتى ينتهي التحقق الحالي بعد 10 دقائق';
			this.status = 429;
		} else if (error.code === 'ENOTFOUND' && !error.status) {
			//will not happen in production
			this.message = 'probably, no internet';
			this.arMessage = 'برجاء التحقق من اتصال الانترنت';
		}
	}
}

class JwtError extends ApiError {
	constructor(message, arMessage, statusCode) {
		super(message, arMessage, statusCode);
		this.name = 'Authentication Error';
		this.arName = 'خطأ في المصادقة';
	}
}

class MulterError extends ApiError {
	constructor(message, arMessage, statusCode) {
		super(message, arMessage, statusCode);
		this.name = 'Multer Error';
		this.arName = 'خطأ في رفع الملف';
	}
}

class AWSError extends ApiError {
	constructor(message, arMessage, statusCode) {
		super(message, arMessage, statusCode);
		this.name = 'AWS Error';
		this.arName = 'خطأ في الرفع السحابي للملف';
	}
}

class FirebaseError extends ApiError {
	constructor(message, arMessage, statusCode) {
		super(message, arMessage, statusCode);
		this.name = 'Firebase Error';
		this.arMessage = undefined;
	}
}

module.exports = {
	ApiError,
	TwilioError,
	JwtError,
	MulterError,
	FirebaseError,
	AWSError,
};
