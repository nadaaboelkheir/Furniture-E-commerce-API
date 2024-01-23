const express = require('express');
const {
	uploadNotificationImage,
	createNotification,
	getAllNotifications,
} = require('../controllers/notification.controller');
const {
	createNotificationValidator,
	getAllNotificationsValidator,
} = require('../validations/notification.vc');

const { uploadSingleImage } = require('../services/multer');

const dashboardNotificationRouter = express.Router();

dashboardNotificationRouter.post(
	'/image',
	uploadSingleImage,
	uploadNotificationImage,
);

dashboardNotificationRouter
	.route('')
	.post(createNotificationValidator, createNotification)
	.get(getAllNotificationsValidator, getAllNotifications);

module.exports = { dashboardNotificationRouter };
