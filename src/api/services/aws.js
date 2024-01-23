const AWS = require('aws-sdk');
const {
	AWS_ENDPOINT,
	AWS_ACCESS_KEY_ID,
	AWS_ACCESS_SECRET_KEY,
	AWS_REGION,
	AWS_BUCKET_NAME,
} = require('../helpers/env');
const { AWSError } = require('../helpers/errorHandler');
const fs = require('fs');
const configureAWSService = () => {
	const credentials = new AWS.SharedIniFileCredentials({ profile: 'wasabi' });

	AWS.config.credentials = credentials;
	AWS.config.credentials.accessKeyId = AWS_ACCESS_KEY_ID;
	AWS.config.credentials.secretAccessKey = AWS_ACCESS_SECRET_KEY;
	AWS.config.region = AWS_REGION;

	const ep = new AWS.Endpoint(AWS_ENDPOINT);
	const s3 = new AWS.S3({ endpoint: ep });

	return s3;
};
const s3 = configureAWSService();

const deleteImage = async (imageUrl) => {
	const parsedUrl = new URL(imageUrl);
	const imagekey = parsedUrl.pathname.substring(1);
	const deleteParams = {
		Bucket: AWS_BUCKET_NAME,
		Key: imagekey,
	};

	try {
		await s3.deleteObject(deleteParams).promise();
	} catch (deleteErr) {
		throw new AWSError(deleteErr.message, undefined, deleteErr.statusCode);
	}
};

const uploadSingleImage = async (file, object) => {
	var fileStream = fs.createReadStream(file.path);
	const uniqueKey = `${object}/${file.filename}`;

	const params = {
		Bucket: AWS_BUCKET_NAME,
		Key: uniqueKey,
		Body: fileStream,
		ContentType: file.mimetype,
	};

	const uploadData = await s3.upload(params).promise();

	return uploadData.Location;
};

const uploadImage = async (file, object) => {
	try {
		const imageUrl = await uploadSingleImage(file, object);

		return imageUrl;
	} catch (err) {
		throw new AWSError(err.message, undefined, err.statusCode);
	}
};

module.exports = { configureAWSService, deleteImage, s3, uploadImage };
