const User = require('../models/user');
const Shop = require('../models/shop');
const Product = require('../models/product');
const AppError = require('../utils/appError');
const sendSuccess = require('../utils/response');

const paginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

exports.getVendors = async (req, res, next) => {
  const { page, limit, skip } = paginationParams(req);

  const filter = { role: 'vendor' };
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;

  const [vendors, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const shops = await Shop.find({ owner: { $in: vendors.map((vendor) => vendor.id) } });
  const shopByOwner = new Map(shops.map((shop) => [shop.owner.toString(), shop]));

  const data = vendors.map((vendor) => {
    const shop = shopByOwner.get(vendor.id);
    return {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
      shop: shop ? { id: shop.id, name: shop.name, isActive: shop.isActive } : null,
    };
  });

  sendSuccess(res, 200, 'Vendors fetched successfully', {
    vendors: data,
    pagination: { total, page, pages: Math.ceil(total / limit) || 1, limit },
  });
};

exports.getCustomers = async (req, res, next) => {
  const { page, limit, skip } = paginationParams(req);

  const filter = { role: 'customer' };

  const [customers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Customers fetched successfully', {
    customers: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
    })),
    pagination: { total, page, pages: Math.ceil(total / limit) || 1, limit },
  });
};

exports.updateVendorStatus = async (req, res, next) => {
  const { isActive } = req.body;

  const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  vendor.isActive = isActive;
  await vendor.save();

  await Shop.findOneAndUpdate({ owner: vendor.id }, { isActive });

  sendSuccess(res, 200, `Vendor ${isActive ? 'activated' : 'deactivated'} successfully`, {
    id: vendor.id,
    isActive: vendor.isActive,
  });
};

exports.getAnalytics = async (req, res, next) => {
  const [totalUsers, totalVendors, totalCustomers, totalShops, totalProducts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'vendor' }),
    User.countDocuments({ role: 'customer' }),
    Shop.countDocuments(),
    Product.countDocuments({ isActive: true }),
  ]);

  sendSuccess(res, 200, 'Platform analytics fetched successfully', {
    totalUsers,
    totalVendors,
    totalCustomers,
    totalShops,
    totalProducts,
    // Revenue and top-vendor rankings depend on the Cart & Orders domain
    // (Backend Dev 3) and will populate once Order data is available.
    totalRevenue: null,
    topVendors: null,
  });
};
