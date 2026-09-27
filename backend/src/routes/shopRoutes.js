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

router.post(
  '/',
  protect,
  restrictTo('vendor'),
  [body('name').trim().notEmpty().withMessage('Shop name is required')],
  validate,
  registerShop
);

router.get('/me/dashboard', protect, restrictTo('vendor'), getMyShopDashboard);

router.patch('/me', protect, restrictTo('vendor'), updateMyShop);

router.get(
  '/vendor/:vendorId',
  [param('vendorId').isMongoId().withMessage('Invalid vendor id')],
  validate,
  getShopByVendorId
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid shop id')], validate, getShop);

module.exports = router;
