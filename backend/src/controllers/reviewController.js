const mongoose = require('mongoose');
const userModel = require('../models/user');
const Review = require('../models/review');
const Product = require('../models/product');
const AppError = require('../utils/appError');
const sendSuccess = require('../utils/response');
const formatReview = require('../utils/formatReview');
const { resolveUserModel } = require('../utils/modelCompat');

const User = resolveUserModel(userModel);

const recalculateProductRating = async (productId) => {
  const productObjectId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;
  const activeCustomerIds = await User.find({
    role: 'customer',
    isActive: true,
    deletedAt: null,
  }).distinct('_id');

  const stats = await Review.aggregate([
    {
      $match: {
        product: productObjectId,
        isActive: true,
        user: { $in: activeCustomerIds },
      },
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productObjectId, {
    ratingsAverage: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    ratingsCount: stats.length > 0 ? stats[0].count : 0,
  });
};

exports.createReview = async (req, res, next) => {
  const { product: productId, rating, comment } = req.body;

  if (req.user.role !== 'customer') {
    return next(new AppError('Only customers can submit product reviews', 403));
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  const productVendor = await User.findOne({
    _id: product.vendor,
    role: 'vendor',
    isActive: true,
    deletedAt: null,
  });
  if (!productVendor) {
    return next(new AppError('Product not found', 404));
  }

  const existingReview = await Review.findOne({ product: productId, user: req.user.id });
  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  const review = await Review.create({
    product: product._id,
    user: req.user.id,
    rating,
    comment,
  });

  await recalculateProductRating(product._id);

  sendSuccess(res, 201, 'Review submitted successfully', formatReview(review));
};

exports.getProductReviews = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  const productVendor = await User.findOne({
    _id: product.vendor,
    role: 'vendor',
    isActive: true,
    deletedAt: null,
  });
  if (!productVendor) {
    return next(new AppError('Product not found', 404));
  }

  const activeCustomerIds = await User.find({
    role: 'customer',
    isActive: true,
    deletedAt: null,
  }).distinct('_id');

  const reviews = await Review.find({
    product: req.params.productId,
    isActive: true,
    user: { $in: activeCustomerIds },
  })
    .sort({ createdAt: -1 })
    .populate('user', 'name');

  sendSuccess(res, 200, 'Reviews fetched successfully', reviews.map(formatReview));
};

exports.deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own reviews', 403));
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  sendSuccess(res, 200, 'Review deleted successfully', null);
};
