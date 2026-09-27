const formatShop = (shop, extra = {}) => ({
  id: shop.id,
  name: shop.name,
  description: shop.description,
  logo: shop.logo,
  contactEmail: shop.contactEmail,
  contactPhone: shop.contactPhone,
  isActive: shop.isActive,
  ownerId: shop.owner.toString ? shop.owner.toString() : shop.owner,
  createdAt: shop.createdAt,
  ...extra,
});

module.exports = formatShop;
