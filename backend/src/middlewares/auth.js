const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { resolveUserModel } = require('../utils/modelCompat');
const AppError = require('../utils/appError');

const User = resolveUserModel(userModel);

// Temporary JWT auth guard, pending Backend Dev 1's full auth
// implementation. Verifies a bearer token and attaches the user to
// req.user so other domains (products, shops, orders, etc.) can rely on
// req.user.id / req.user.role today.
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 403));
  }

  req.user = user;
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
