const express = require('express');
const { body, param } = require('express-validator');
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

router.post(
  '/',
  protect,
  restrictTo('vendor'),
  upload.array('images', 5),
  productValidationRules,
  validate,
  createProduct
);

router.get('/', getProducts);

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