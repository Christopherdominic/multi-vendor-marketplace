const getProductPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getEmptyProductResult = ({ page, limit }) => ({
  products: [],
  pagination: {
    total: 0,
    page,
    pages: 1,
    limit,
  },
});

module.exports = {
  getProductPagination,
  getEmptyProductResult,
};