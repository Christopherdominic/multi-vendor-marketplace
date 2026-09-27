const express = require('express');
const { body, param } = require('express-validator');
const {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

const addressValidationRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('street').trim().notEmpty().withMessage('Street address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
];

router.use(protect);

router.post('/', addressValidationRules, validate, createAddress);

router.get('/', getMyAddresses);

router.patch(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid address id')],
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
