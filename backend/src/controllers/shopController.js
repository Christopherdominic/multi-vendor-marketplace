const Shop = require('../models/shop');
const Product = require('../models/product');
const AppError = require('../utils/appError');
const sendSuccess = require('../utils/response');
const formatShop = require('../utils/formatShop');

exports.registerShop = async (req, res, next) => {
  const existingShop = await Shop.findOne({ owner: req.user.id });
  if (existingShop) {
    return next(new AppError('You already have a registered shop', 400));
  }

  const { name, description, logo, contactEmail, contactPhone } = req.body;

  const shop = await Shop.create({
    owner: req.user.id,
    name,
    description,
    logo,
    contactEmail,
    contactPhone,
  });

  sendSuccess(res, 201, 'Shop registered successfully', formatShop(shop));
};

exports.getShop = async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop || !shop.isActive) {
    return next(new AppError('Shop not found', 404));
  }

  const productCount = await Product.countDocuments({ vendor: shop.owner, isActive: true });

  sendSuccess(res, 200, 'Shop fetched successfully', formatShop(shop, { productCount }));
};

exports.getShopByVendorId = async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.params.vendorId });

  if (!shop || !shop.isActive) {
    return next(new AppError('Shop not found', 404));
  }

  const productCount = await Product.countDocuments({ vendor: shop.owner, isActive: true });

  sendSuccess(res, 200, 'Shop fetched successfully', formatShop(shop, { productCount }));
};

exports.updateMyShop = async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user.id });

  if (!shop) {
    return next(new AppError('You do not have a registered shop yet', 404));
  }

  const allowedFields = ['name', 'description', 'logo', 'contactEmail', 'contactPhone'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      shop[field] = req.body[field];
    }
  });

  await shop.save();

  sendSuccess(res, 200, 'Shop updated successfully', formatShop(shop));
};

exports.getMyShopDashboard = async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user.id });

  if (!shop) {
    return next(new AppError('You do not have a registered shop yet', 404));
  }

  const [totalProducts, activeProducts] = await Promise.all([
    Product.countDocuments({ vendor: req.user.id }),
    Product.countDocuments({ vendor: req.user.id, isActive: true }),
  ]);

  sendSuccess(res, 200, 'Vendor dashboard fetched successfully', {
    shop: formatShop(shop),
    totalProducts,
    activeProducts,
    // Sales/order figures depend on the Cart & Orders domain (Backend Dev 3)
    // and will populate once that model is merged.
    totalOrders: null,
    totalSales: null,
  });
};
