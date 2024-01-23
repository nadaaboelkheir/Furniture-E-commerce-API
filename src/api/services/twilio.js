const twilio = require('twilio');
const {
	TWILIO_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_SERVICE,
} = require('../helpers/env');
const { TwilioError, ApiError } = require('../helpers/errorHandler');
const { twilioVerificationStates } = require('../../config/constants');
const { differenceBetweenDatesInMinites } = require('../helpers/functions');
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

const sendVerificationCode = async (phone) => {
	const verificationAttempts =
		await client.verify.v2.verificationAttempts.list({
			'channelData.to': phone,
			limit: 1,
		});
	const lastVerificationSid = verificationAttempts[0]?.verificationSid;
	let verification;

	if (lastVerificationSid) {
		try {
			verification = await client.verify.v2
				.services(TWILIO_SERVICE)
				.verifications(lastVerificationSid)
				.fetch();
		} catch (err) {
			//didn't find a pending verification which is fine
			console.log('not an error ', err);
		}

		if (
			verification &&
			verification.status === twilioVerificationStates.pending
		) {
			const timeDiffernce = differenceBetweenDatesInMinites(
				verification.dateCreated,
			);

			if (timeDiffernce < 2) {
				throw new ApiError(
					"can't resend otp, please wait 2 minutes",
					'لا يمكن ارسال رمز التحقق مره اخري الان ، برجاء الانتظار دقيقتين',
					401,
				);
			} else {
				//(timeDiffernce >= 2 && timeDiffernce < 10)
				await client.verify.v2
					.services(TWILIO_SERVICE)
					.verifications(lastVerificationSid)
					.update({ status: twilioVerificationStates.canceled });
			}
		}
	}
	try {
		return await client.verify.v2
			.services(TWILIO_SERVICE)
			.verifications.create({
				to: phone,
				channel: 'sms',
			});
	} catch (err) {
		throw new TwilioError(err);
	}
};
const verifyCode = async (phone, verificationCode) => {
	try {
		const verificationResult = await client.verify.v2
			.services(TWILIO_SERVICE)
			.verificationChecks.create({
				to: phone,
				code: verificationCode,
			});

		if (verificationResult.status !== twilioVerificationStates.approved) {
			let result = {};

			if (
				verificationResult.status === twilioVerificationStates.pending
			) {
				result.message = 'wrong otp';
				result.arMessage = 'رمز تحقق خاطئ';
			} else {
				result.message = 'verification canceled';
				result.arMessage = 'تم إلغاء التحقق';
			}

			throw new ApiError(result.message, result.arMessage, 401);
		}
	} catch (err) {
		if (err.constructor.name === 'ApiError') {
			throw err;
		}
		throw new TwilioError(err);
	}
};

module.exports = {
	sendVerificationCode,
	verifyCode,
};
