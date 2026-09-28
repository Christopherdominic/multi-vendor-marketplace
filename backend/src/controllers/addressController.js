const Address = require('../models/address');
const AppError = require('../utils/appError');
const sendSuccess = require('../utils/response');
const formatAddress = require('../utils/formatAddress');
const { normalizeBooleanFlag } = require('../utils/modelCompat');

exports.createAddress = async (req, res, next) => {
  const { fullName, phone, street, city, state, country } = req.body;
  const shouldSetDefault = normalizeBooleanFlag(req.body.isDefault);

  const address = await Address.create({
    user: req.user.id,
    fullName,
    phone,
    street,
    city,
    state,
    country,
    isDefault: shouldSetDefault,
  });

  if (shouldSetDefault) {
    await Address.updateMany({ user: req.user.id, _id: { $ne: address._id } }, { isDefault: false });
  }

  sendSuccess(res, 201, 'Address created successfully', formatAddress(address));
};

exports.getMyAddresses = async (req, res, next) => {
  const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
  sendSuccess(res, 200, 'Addresses fetched successfully', addresses.map(formatAddress));
};

exports.updateAddress = async (req, res, next) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user.id });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  const shouldSetDefault = normalizeBooleanFlag(req.body.isDefault);
  const allowedFields = ['fullName', 'phone', 'street', 'city', 'state', 'country', 'isDefault'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      address[field] = field === 'isDefault' ? shouldSetDefault : req.body[field];
    }
  });

  await address.save();

  if (address.isDefault) {
    await Address.updateMany(
      { user: req.user.id, _id: { $ne: address._id } },
      { isDefault: false }
    );
  }

  sendSuccess(res, 200, 'Address updated successfully', formatAddress(address));
};

exports.deleteAddress = async (req, res, next) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  sendSuccess(res, 200, 'Address deleted successfully', null);
};
