const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');

const router = express.Router();

const productValidationRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive whole number'),
  body('category').isMongoId().withMessage('A valid category id is required'),
];

const productQueryValidationRules = [
  query('category').optional().isMongoId().withMessage('Category id must be valid'),
  query('vendor').optional().isMongoId().withMessage('Vendor id must be valid'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

router.post(
  '/',
  protect,
  restrictTo('vendor'),
  upload.array('images', 5),
  productValidationRules,
  validate,
  createProduct
);

router.get('/', productQueryValidationRules, validate, getProducts);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid product id')],
  validate,
  getProduct
);

router.put(
  '/:id',
  protect,
  restrictTo('vendor'),
  upload.array('images', 5),
  [param('id').isMongoId().withMessage('Invalid product id')],
  validate,
  updateProduct
);

router.delete(
  '/:id',
  protect,
  restrictTo('vendor'),
  [param('id').isMongoId().withMessage('Invalid product id')],
  validate,
  deleteProduct
);

module.exports = router;