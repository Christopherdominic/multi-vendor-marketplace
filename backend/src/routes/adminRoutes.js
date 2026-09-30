const express = require('express');
const { body, param } = require('express-validator');
const {
  getVendors,
  getCustomers,
  updateVendorStatus,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/vendors', getVendors);

router.get('/customers', getCustomers);

router.patch(
  '/vendors/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid vendor id'),
      body('isActive')
        .isBoolean({ strict: true })
        .withMessage('isActive must be a JSON boolean'),
  ],
  validate,
  updateVendorStatus
);

router.get('/analytics', getAnalytics);

module.exports = router;
