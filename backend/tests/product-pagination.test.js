const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getProductPagination,
  getEmptyProductResult,
} = require('../src/utils/productPagination');

test('empty catalog preserves requested page and limit when there are no active vendors', () => {
  const pagination = getProductPagination({ page: '3', limit: '7' });
  assert.deepEqual(getEmptyProductResult(pagination), {
    products: [],
    pagination: { total: 0, page: 3, pages: 1, limit: 7 },
  });
});

test('empty catalog preserves requested page and limit for an inactive requested vendor', () => {
  const pagination = getProductPagination({ page: '4', limit: '25' });
  assert.deepEqual(getEmptyProductResult(pagination), {
    products: [],
    pagination: { total: 0, page: 4, pages: 1, limit: 25 },
  });
});

test('product pagination applies defaults and controller bounds', () => {
  assert.deepEqual(getProductPagination({}), { page: 1, limit: 12, skip: 0 });
  assert.deepEqual(getProductPagination({ page: '-2', limit: '500' }), {
    page: 1,
    limit: 50,
    skip: 0,
  });
});
