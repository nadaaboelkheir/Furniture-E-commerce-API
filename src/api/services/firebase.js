const admin = require('firebase-admin');
const serviceAccount = require('../../../nano-e-commerce-firebase-adminsdk-qez5w-5963aaf71a.json');
const { FirebaseError, ApiError } = require('../helpers/errorHandler');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const validateFirebaseToken = async (firebaseToken) => {
	if (!firebaseToken.trim()) {
		throw new ApiError('firebaseToken must be not mpty', undefined, 422);
	}
	const decodedToken = await PushNotification(
		[firebaseToken],
		undefined,
		undefined,
		undefined,
		true,
	);

	if (!decodedToken.responses[0].success) {
		throw new FirebaseError('invalid push token', undefined, 498);
	}
};

const PushNotification = (tokens, title, body, image, dryRun) => {
	try {
		const message = {
			notification: {
				title,
				body,
				image,
			},
			tokens,
		};

		return admin.messaging().sendEachForMulticast(message, dryRun);
	} catch (err) {
		//console.log(err);
		throw new FirebaseError(err.message, undefined, 422);
	}
};

const sendNotification = async (tokens, title, body, image) => {
	const batchSize = 500;
	const batchLimit = Math.ceil(tokens.length / batchSize);
	const notificationResponse = [];
	let failureCount = 0;
	let successCount = 0;

	for (let i = 0; i < batchLimit; i++) {
		const start = i * batchSize;
		const end = (i + 1) * batchSize;
		const batch = tokens.slice(start, end);
		const {
			responses,
			failureCount: batchFailureCount,
			successCount: batchSuccessCount,
		} = await PushNotification(batch, title, body, image, false);

		notificationResponse.push(...responses);
		failureCount += batchFailureCount;
		successCount += batchSuccessCount;
	}

	return { notificationResponse, failureCount, successCount };
};

module.exports = { sendNotification, validateFirebaseToken };
