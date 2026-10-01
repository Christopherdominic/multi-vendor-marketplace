const express = require('express');
const { body, param } = require('express-validator');
const {
  registerShop,
  getShop,
  getShopByVendorId,
  updateMyShop,
  getMyShopDashboard,
} = require('../controllers/shopController');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

const shopUpdateValidationRules = [
  body('name').optional().trim().notEmpty().withMessage('Shop name cannot be empty'),
  body('description').optional().trim(),
  body('logo').optional().isURL().withMessage('Logo must be a valid URL'),
  body('contactEmail').optional().isEmail().withMessage('Contact email must be valid'),
  body('contactPhone').optional().trim().notEmpty().withMessage('Contact phone cannot be empty'),
];

router.post(
  '/',
  protect,
  restrictTo('vendor'),
  [body('name').trim().notEmpty().withMessage('Shop name is required')],
  validate,
  registerShop
);

router.get('/me/dashboard', protect, restrictTo('vendor'), getMyShopDashboard);

router.patch(
  '/me',
  protect,
  restrictTo('vendor'),
  shopUpdateValidationRules,
  validate,
  updateMyShop
);

router.get(
  '/vendor/:vendorId',
  [param('vendorId').isMongoId().withMessage('Invalid vendor id')],
  validate,
  getShopByVendorId
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid shop id')], validate, getShop);

module.exports = router;
