const express = require('express');
const { body, param } = require('express-validator');
const {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

const addressValidationRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('street').trim().notEmpty().withMessage('Street address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('country').optional().trim(),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be true or false'),
];

const updateAddressValidationRules = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('street').optional().trim().notEmpty().withMessage('Street address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('country').optional().trim(),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be true or false'),
];

router.use(protect, restrictTo('customer'));

router.post('/', addressValidationRules, validate, createAddress);

router.get('/', getMyAddresses);

router.patch(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid address id')],
  updateAddressValidationRules,
  validate,
  updateAddress
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid address id')],
  validate,
  deleteAddress
);

module.exports = router;
