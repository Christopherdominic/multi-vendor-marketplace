const bcrypt = require('bcryptjs');
const userModel = require('../models/user');
const Shop = require('../models/shop');
const Product = require('../models/product');
const AppError = require('../utils/appError');
const sendSuccess = require('../utils/response');
const { resolveUserModel } = require('../utils/modelCompat');

const SafeUser = resolveUserModel(userModel);
const Admin = userModel.Admin || SafeUser.discriminators?.Admin || SafeUser;

exports.createAdmin = async (req, res, next) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const phoneNumber = req.body.phoneNumber.trim();
  const { password } = req.body;

  const existingUser = await SafeUser.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existingUser) {
    const usedField = existingUser.email === email ? 'Email' : 'Phone number';
    return next(new AppError(`An account with this ${usedField} already exists`, 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const adminData = {
    name,
    email,
    phoneNumber,
    password: hashedPassword,
  };

  if (Admin === SafeUser) {
    adminData.role = 'admin';
  }

  const admin = await Admin.create(adminData);
  const responseAdmin = admin.toObject();
  delete responseAdmin.password;

  sendSuccess(res, 201, 'Admin created successfully', responseAdmin);
};

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
    SafeUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SafeUser.countDocuments(filter),
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
    SafeUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SafeUser.countDocuments(filter),
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

  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be a JSON boolean', 400));
  }

  const vendor = await SafeUser.findOne({ _id: req.params.id, role: 'vendor' });
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  if (isActive) {
    const persistedVendor = await SafeUser.collection.findOne(
      { _id: vendor._id },
      { projection: { deletedAt: 1 } }
    );
    if (persistedVendor?.deletedAt) {
      return next(new AppError('Permanently deleted vendors cannot be reactivated', 400));
    }
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
  const [totalUsers, totalVendors, totalCustomers, totalShops, activeVendorIds] = await Promise.all([
    SafeUser.countDocuments(),
    SafeUser.countDocuments({ role: 'vendor' }),
    SafeUser.countDocuments({ role: 'customer' }),
    Shop.countDocuments(),
    SafeUser.find({ role: 'vendor', isActive: true, deletedAt: null }).distinct('_id'),
  ]);
  const totalProducts = await Product.countDocuments({
    isActive: true,
    vendor: { $in: activeVendorIds },
  });

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
