const express = require('express');
const router = express.Router();
const {
	uploadCategoryImage,
	createCategory,
	deleteCategory,
	updateCategory,
	getCategoryById,
	toggleHideCategory,
	getAllCategories,
} = require('../controllers/category.controller');
const {
	createCategoryValidator,
	deleteCategoryValidator,
	updateCategoryValidator,
	getAllCategoriesValidator,
	getCategoryByIdValidator,
	toggleHideCategoryValidator,
} = require('../validations/category.vc');
const { uploadSingleImage } = require('../services/multer');

router.post('/upload-image', uploadSingleImage, uploadCategoryImage);

router
	.route('')
	.post(createCategoryValidator, createCategory)
	.get(getAllCategoriesValidator, getAllCategories);
router.patch(
	'/:categoryId/toggle-hide',
	toggleHideCategoryValidator,
	toggleHideCategory,
);
router
	.route('/:categoryId')
	.get(getCategoryByIdValidator, getCategoryById)
	.put(updateCategoryValidator, updateCategory)
	.delete(deleteCategoryValidator, deleteCategory);

module.exports = router;
