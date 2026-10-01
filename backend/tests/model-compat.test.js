const assert = require('node:assert/strict');
const { resolveUserModel, normalizeBooleanFlag } = require('../src/utils/modelCompat');

const namedUser = { User: { modelName: 'User' }, Customer: {}, Vendor: {}, Admin: {} };
const defaultUser = { modelName: 'User' };

assert.deepEqual(resolveUserModel(namedUser), namedUser.User);
assert.deepEqual(resolveUserModel(defaultUser), defaultUser);
assert.equal(normalizeBooleanFlag(true), true);
assert.equal(normalizeBooleanFlag('true'), true);
assert.equal(normalizeBooleanFlag('false'), false);
assert.equal(normalizeBooleanFlag(undefined), false);

console.log('model compat checks passed');
