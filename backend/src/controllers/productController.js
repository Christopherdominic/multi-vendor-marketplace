const Product = require('../models/product');
const Category = require('../models/category');
const AppError = require('../utils/appError');
const sendSuccess = require('../utils/response');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');
const deleteFromCloudinary = require('../utils/deleteFromCloudinary');
const {
  formatProductSummary,
  formatProductDetail,
} = require('../utils/formatProduct');

const SORT_OPTIONS = {
  newest: '-createdAt',
  price_asc: 'price',
  price_desc: '-price',
  rating: '-ratingsAverage',
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

  const uploadResults = await Promise.all(
    req.files.map((file) => uploadBufferToCloudinary(file.buffer))
  );

  const images = uploadResults.map((result) => result.secure_url);
  const imagePublicIds = uploadResults.map((result) => result.public_id);

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    images,
    imagePublicIds,
    vendor: req.user.id,
  });

  product.category = categoryExists;

  sendSuccess(
    res,
    201,
    'Product created successfully',
    formatProductDetail(product)
  );
};

exports.getProducts = async (req, res, next) => {
  const {
    category,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    search,
    sort,
    vendor,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (vendor) filter.vendor = vendor;

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

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name'),
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
  const product = await Product.findById(req.params.id).populate(
    'category',
    'name'
  );

  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
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
    return next(
      new AppError('You can only update your own products', 403)
    );
  }

  if (req.body.category !== undefined) {
    const categoryExists = await Category.findById(req.body.category);

    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }
  }

  if (req.files && req.files.length > 0) {
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );

    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      try {
        await deleteFromCloudinary(product.imagePublicIds);
      } catch (err) {
        console.error(
          'Failed to delete old product images from Cloudinary:',
          err.message
        );
      }
    }

    product.images = uploadResults.map((result) => result.secure_url);
    product.imagePublicIds = uploadResults.map((result) => result.public_id);
  }

  const allowedFields = [
    'name',
    'description',
    'price',
    'stock',
    'category',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  await product.save();
  await product.populate('category', 'name');

  sendSuccess(
    res,
    200,
    'Product updated successfully',
    formatProductDetail(product)
  );
};

exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  if (product.vendor.toString() !== req.user.id) {
    return next(
      new AppError('You can only delete your own products', 403)
    );
  }

  product.isActive = false;
  await product.save();

  sendSuccess(res, 200, 'Product deleted successfully', null);
};