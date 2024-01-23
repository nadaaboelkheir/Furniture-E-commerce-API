const multer = require('multer');
const { MulterError } = require('../helpers/errorHandler');
const {
	IMAGE_ALLOWEDEXTENTION,
	IMAGE_SIZE,
} = require('../../config/constants');

const storage = multer.diskStorage({
	filename: async function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const originalname = file.originalname;
		const filename =
			uniqueSuffix +
			'-' +
			originalname.toLowerCase().split(' ').join('-');

		cb(null, filename);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedExtensions = IMAGE_ALLOWEDEXTENTION;
	const fileExtension = file.originalname
		.toLowerCase()
		.slice(file.originalname.lastIndexOf('.'));

	if (allowedExtensions.includes(fileExtension)) {
		cb(null, true);
	} else {
		cb(
			new MulterError(
				'Invalid file type. Only images with .jpg, .jpeg or .png extensions are allowed',
				'برجاء رفع الصوره بإحدى الامتدات التاليه : .jpg, .jpeg , .png',
				415,
			),
		);
	}
};

const createMulterInstance = (options) =>
	multer({ storage, fileFilter, ...options });

const uploadMulterSingle = createMulterInstance({
	limits: {
		fileSize: IMAGE_SIZE,
	},
}).single('image');

const uploadSingleImage = (req, res, next) => {
	uploadMulterSingle(req, res, (err) => {
		if (err) {
			if (
				err instanceof multer.MulterError ||
				err instanceof MulterError
			) {
				if (err.code === 'LIMIT_FILE_SIZE') {
					return next(
						new MulterError(
							'Image size limit exceeded',
							'تم تجاوز الحد الاقصي لحجم الصوره',
							413,
						),
					);
				}
				return next(
					new MulterError(err.message, err.arMessage, err.status),
				);
			}
			return next(
				new MulterError(err.message, undefined, err.statusCode),
			);
		}
		next();
	});
};

module.exports = { uploadSingleImage };
