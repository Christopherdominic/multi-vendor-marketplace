const formatAddress = (address) => ({
  id: address.id,
  fullName: address.fullName,
  phone: address.phone,
  street: address.street,
  city: address.city,
  state: address.state,
  country: address.country,
  isDefault: address.isDefault,
});

module.exports = formatAddress;
