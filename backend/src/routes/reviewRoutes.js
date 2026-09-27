const express = require('express');
const { body, param } = require('express-validator');
const {
  createReview,
  getProductReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  restrictTo('customer'),
  [
    body('product').isMongoId().withMessage('A valid product id is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
  ],
  validate,
  createReview
);

router.get(
  '/product/:productId',
  [param('productId').isMongoId().withMessage('Invalid product id')],
  validate,
  getProductReviews
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid review id')],
  validate,
  deleteReview
);

module.exports = router;
