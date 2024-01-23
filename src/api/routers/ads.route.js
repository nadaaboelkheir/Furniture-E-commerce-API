const express = require('express');
const {
	uploadAdImage,
	createAd,
	getAdById,
	updateAd,
	deleteAd,
	toggleActivate,
	allAds,
	viewAd,
} = require('../controllers/ad.controller');
const {
	createAdValidator,
	adIdValidator,
	updateAdValidator,
	getAllAdsValidator,
} = require('../validations/ads.vc');
const { isAuthOrVisitor, allow } = require('../middlewares/auth.mw');
const { uploadSingleImage } = require('../services/multer');
const { userTypes } = require('../../config/constants');

const dashboardAdRouter = express.Router();

dashboardAdRouter.post('/image', uploadSingleImage, uploadAdImage);

dashboardAdRouter
	.route('')
	.post(createAdValidator, createAd)
	.get(getAllAdsValidator, allAds);

dashboardAdRouter
	.route('/:id')
	.get(adIdValidator, getAdById)
	.put(updateAdValidator, updateAd)
	.delete(adIdValidator, deleteAd);

dashboardAdRouter.patch('/toggle-activate/:id', adIdValidator, toggleActivate);

const userAdRouter = express.Router();

userAdRouter.put(
	'/view/:id',
	isAuthOrVisitor,
	allow([userTypes.user, userTypes.visitor]),
	adIdValidator,
	viewAd,
);

userAdRouter.get('', allAds);

module.exports = { dashboardAdRouter, userAdRouter };
