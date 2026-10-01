const express = require('express');
const { body, param } = require('express-validator');
const {
  createAdmin,
  getVendors,
  getCustomers,
  updateVendorStatus,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.post(
  '/create-admin',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('A valid email is required'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  createAdmin
);

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
