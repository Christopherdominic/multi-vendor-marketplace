const test = require('node:test');
const assert = require('node:assert/strict');
const { body, validationResult } = require('express-validator');

test('vendor status accepts JSON booleans and rejects boolean strings', async () => {
  const isActiveRule = body('isActive').isBoolean({ strict: true });

  for (const isActive of [true, false]) {
    const req = { body: { isActive } };
    await isActiveRule.run(req);
    assert.equal(validationResult(req).isEmpty(), true);
  }

  for (const isActive of ['true', 'false']) {
    const req = { body: { isActive } };
    await isActiveRule.run(req);
    assert.equal(validationResult(req).isEmpty(), false);
  }
});
