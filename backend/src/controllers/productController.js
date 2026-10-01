const userModel = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const AppError = require('../utils/appError');
const sendSuccess = require('../utils/response');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');
const deleteFromCloudinary = require('../utils/deleteFromCloudinary');
const { formatProductSummary, formatProductDetail } = require('../utils/formatProduct');
const { resolveUserModel } = require('../utils/modelCompat');
const { getProductPagination, getEmptyProductResult } = require('../utils/productPagination');

const User = resolveUserModel(userModel);

const SORT_OPTIONS = {
  newest: '-createdAt',
  price_asc: 'price',
  price_desc: '-price',
  rating: '-ratingsAverage',
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const deleteUploadedImages = async (uploadResults, message) => {
  const publicIds = uploadResults.map((result) => result.public_id);
  if (publicIds.length === 0) return;

  try {
    await deleteFromCloudinary(publicIds);
  } catch (err) {
    console.error(message, err.message);
  }
};

const uploadProductImages = async (files) => {
  const results = await Promise.allSettled(
    files.map((file) => uploadBufferToCloudinary(file.buffer))
  );
  const uploadResults = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  const failedUpload = results.find((result) => result.status === 'rejected');

  if (failedUpload) {
    await deleteUploadedImages(
      uploadResults,
      'Failed to clean up partially uploaded product images:'
    );
    throw failedUpload.reason;
  }

  return uploadResults;
};

exports.createProduct = async (req, res, next) => {
  const { name, description, price, stock, category } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new AppError('At least one product image is required', 400));
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  const uploadResults = await uploadProductImages(req.files);

  const images = uploadResults.map((result) => result.secure_url);
  const imagePublicIds = uploadResults.map((result) => result.public_id);

  let product;
  try {
    product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      images,
      imagePublicIds,
      vendor: req.user.id,
    });
  } catch (err) {
    await deleteUploadedImages(
      uploadResults,
      'Failed to clean up product images after product creation failed:'
    );
    throw err;
  }

  product.category = categoryExists;

  sendSuccess(res, 201, 'Product created successfully', formatProductDetail(product));
};

exports.getProducts = async (req, res, next) => {
  const { category, minPrice, maxPrice, minRating, inStock, search, sort, vendor } = req.query;
  const { page, limit, skip } = getProductPagination(req.query);

  const filter = { isActive: true };

  const activeVendorIds = await User.find({
    role: 'vendor',
    isActive: true,
    deletedAt: null,
  }).distinct('_id');
  if (activeVendorIds.length === 0) {
    return sendSuccess(
      res,
      200,
      'Products fetched successfully',
      getEmptyProductResult({ page, limit })
    );
  }

  if (category) filter.category = category;
  if (vendor) {
    const vendorUser = await User.findOne({
      _id: vendor,
      role: 'vendor',
      isActive: true,
      deletedAt: null,
    });
    if (!vendorUser) {
      return sendSuccess(
        res,
        200,
        'Products fetched successfully',
        getEmptyProductResult({ page, limit })
      );
    }
    filter.vendor = vendor;
  } else {
    filter.vendor = { $in: activeVendorIds };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minRating) {
    filter.ratingsAverage = { $gte: Number(minRating) };
  }

  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  const searchTerm = typeof search === 'string' ? search.trim() : '';
  if (searchTerm) {
    const escapedSearch = escapeRegex(searchTerm);
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip(skip).limit(limit).populate('category', 'name'),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Products fetched successfully', {
    products: products.map(formatProductSummary),
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    },
  });
};

exports.getProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');

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

  const activeVendorIds = await User.find({
    role: 'vendor',
    isActive: true,
    deletedAt: null,
  }).distinct('_id');

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
    vendor: { $in: activeVendorIds },
  })
    .limit(4)
    .populate('category', 'name');

  sendSuccess(res, 200, 'Product fetched successfully', {
    product: formatProductDetail(product),
    relatedProducts: relatedProducts.map(formatProductSummary),
  });
};

exports.updateProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .select('+imagePublicIds')
    .populate('category', 'name');

  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  if (product.vendor.toString() !== req.user.id) {
    return next(new AppError('You can only update your own products', 403));
  }

  if (req.body.category !== undefined) {
    const categoryExists = await Category.findById(req.body.category);

    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }
  }

  const oldImagePublicIds = product.imagePublicIds || [];
  let newUploadResults = [];
  if (req.files && req.files.length > 0) {
    newUploadResults = await uploadProductImages(req.files);
    product.images = newUploadResults.map((result) => result.secure_url);
    product.imagePublicIds = newUploadResults.map((result) => result.public_id);
  }

  const allowedFields = ['name', 'description', 'price', 'stock', 'category'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  try {
    await product.save();
  } catch (err) {
    await deleteUploadedImages(
      newUploadResults,
      'Failed to clean up replacement product images after update failed:'
    );
    throw err;
  }

  if (newUploadResults.length > 0) {
    await deleteUploadedImages(
      oldImagePublicIds.map((public_id) => ({ public_id })),
      'Failed to delete replaced product images from Cloudinary:'
    );
  }

  await product.populate('category', 'name');

  sendSuccess(res, 200, 'Product updated successfully', formatProductDetail(product));
};

exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  if (product.vendor.toString() !== req.user.id) {
    return next(new AppError('You can only delete your own products', 403));
  }

  product.isActive = false;
  await product.save();

  sendSuccess(res, 200, 'Product deleted successfully', null);
};
