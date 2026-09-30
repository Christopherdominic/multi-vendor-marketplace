const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Category = require('../src/models/category');
const Product = require('../src/models/product');
const Shop = require('../src/models/shop');
const { updateVendorStatus } = require('../src/controllers/adminController');
const { getProducts } = require('../src/controllers/productController');

const testMongoUri = process.env.TEST_MONGODB_URI;

test(
  'vendor deactivate/reactivate preserves a soft-deleted product state',
  { skip: !testMongoUri && 'Set TEST_MONGODB_URI to run the MongoDB integration test' },
  async (t) => {
    await mongoose.connect(testMongoUri);
    const unique = new mongoose.Types.ObjectId().toString();
    let vendor;
    let category;
    let product;
    let shop;

    t.after(async () => {
      if (product) await Product.deleteOne({ _id: product._id });
      if (shop) await Shop.deleteOne({ _id: shop._id });
      if (category) await Category.deleteOne({ _id: category._id });
      if (vendor) await User.deleteOne({ _id: vendor._id });
      await mongoose.disconnect();
    });

    vendor = await User.create({
      name: 'Status Regression Vendor',
      email: `vendor-status-${unique}@example.test`,
      password: 'test-password',
      role: 'vendor',
      isActive: true,
    });
    category = await Category.create({ name: `Status Regression ${unique}` });
    product = await Product.create({
      name: 'Soft-deleted fixture',
      description: 'Must remain inactive after its vendor is reactivated.',
      price: 10,
      stock: 0,
      category: category._id,
      vendor: vendor._id,
      isActive: false,
    });
    shop = await Shop.create({ owner: vendor._id, name: `Status shop ${unique}` });

    const invokeUpdateVendorStatus = async (isActive) => {
      let response;
      const res = {
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          response = body;
          return body;
        },
      };

      await updateVendorStatus(
        { body: { isActive }, params: { id: vendor.id } },
        res,
        (error) => {
          if (error) throw error;
        }
      );
      return response;
    };

    let validationError;
    await updateVendorStatus(
      { body: { isActive: 'false' }, params: { id: vendor.id } },
      {},
      (error) => {
        validationError = error;
      }
    );
    assert.equal(validationError.statusCode, 400);
    assert.equal((await User.findById(vendor._id)).isActive, true);

    await invokeUpdateVendorStatus(false);
    assert.equal((await User.findById(vendor._id)).isActive, false);
    assert.equal((await Shop.findById(shop._id)).isActive, false);
    assert.equal((await Product.findById(product._id)).isActive, false);

    await invokeUpdateVendorStatus(true);
    assert.equal((await User.findById(vendor._id)).isActive, true);
    assert.equal((await Shop.findById(shop._id)).isActive, true);
    assert.equal((await Product.findById(product._id)).isActive, false);
  }
);

test(
  'admin totalProducts counts active listings only for active non-deleted vendors',
  { skip: !testMongoUri && 'Set TEST_MONGODB_URI to run the MongoDB integration test' },
  async (t) => {
    await mongoose.connect(testMongoUri);
    const unique = new mongoose.Types.ObjectId().toString();
    const vendors = [];
    const products = [];
    let category;

    t.after(async () => {
      if (products.length) await Product.deleteMany({ _id: { $in: products.map(({ _id }) => _id) } });
      if (category) await Category.deleteOne({ _id: category._id });
      if (vendors.length) await User.deleteMany({ _id: { $in: vendors.map(({ _id }) => _id) } });
      await mongoose.disconnect();
    });

    const activeVendorIds = await User.find({
      role: 'vendor',
      isActive: true,
      deletedAt: null,
    }).distinct('_id');
    const baselineVisibleProducts = await Product.countDocuments({
      isActive: true,
      vendor: { $in: activeVendorIds },
    });

    category = await Category.create({ name: `Analytics Regression ${unique}` });
    for (const [label, isActive] of [
      ['active', true],
      ['inactive', false],
      ['deleted', false],
    ]) {
      const vendor = await User.create({
        name: `${label} analytics vendor`,
        email: `${label}-analytics-${unique}@example.test`,
        password: 'test-password',
        role: 'vendor',
        isActive,
      });
      vendors.push(vendor);
      products.push(await Product.create({
        name: `${label} analytics product`,
        description: 'Analytics visibility fixture.',
        price: 12,
        stock: 2,
        category: category._id,
        vendor: vendor._id,
        isActive: true,
      }));
      if (label === 'deleted') {
        await User.collection.updateOne(
          { _id: vendor._id },
          { $set: { deletedAt: new Date() } }
        );
      }
    }

    let response;
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        response = body;
        return body;
      },
    };

    await require('../src/controllers/adminController').getAnalytics({}, res, (error) => {
      if (error) throw error;
    });

    assert.equal(response.data.totalProducts, baselineVisibleProducts + 1);
  }
);

test(
  'empty product responses preserve requested pagination for no-active-vendor and inactive-vendor cases',
  { skip: !testMongoUri && 'Set TEST_MONGODB_URI to run the MongoDB integration test' },
  async (t) => {
    await mongoose.connect(testMongoUri);
    const unique = new mongoose.Types.ObjectId().toString();
    let inactiveVendor;
    let activeVendor;

    t.after(async () => {
      if (inactiveVendor) await User.deleteOne({ _id: inactiveVendor._id });
      if (activeVendor) await User.deleteOne({ _id: activeVendor._id });
      await mongoose.disconnect();
    });

    inactiveVendor = await User.create({
      name: 'Inactive Pagination Vendor',
      email: `inactive-pagination-${unique}@example.test`,
      password: 'test-password',
      role: 'vendor',
      isActive: false,
    });

    const invokeGetProducts = async (query) => {
      let response;
      const res = {
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          response = body;
          return body;
        },
      };

      await getProducts({ query }, res, (error) => {
        if (error) throw error;
      });
      return response;
    };

    const noActiveVendors = await invokeGetProducts({ page: '3', limit: '7' });
    assert.deepEqual(noActiveVendors.data.pagination, {
      total: 0,
      page: 3,
      pages: 1,
      limit: 7,
    });

    activeVendor = await User.create({
      name: 'Active Pagination Vendor',
      email: `active-pagination-${unique}@example.test`,
      password: 'test-password',
      role: 'vendor',
      isActive: true,
    });

    const inactiveRequestedVendor = await invokeGetProducts({
      vendor: inactiveVendor.id,
      page: '4',
      limit: '25',
    });
    assert.deepEqual(inactiveRequestedVendor.data.pagination, {
      total: 0,
      page: 4,
      pages: 1,
      limit: 25,
    });
  }
);
