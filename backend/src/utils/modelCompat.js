const resolveUserModel = (userModule) => {
  if (!userModule) return null;
  return userModule.User || userModule;
};

const normalizeBooleanFlag = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (typeof value === 'number') return value === 1;
  return false;
};

module.exports = {
  resolveUserModel,
  normalizeBooleanFlag,
};
