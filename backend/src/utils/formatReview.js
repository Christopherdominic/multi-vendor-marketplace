const formatReview = (review) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  productId: review.product.toString ? review.product.toString() : review.product,
  user:
    review.populated && review.populated('user')
      ? { id: review.user.id, name: review.user.name }
      : { id: review.user.toString() },
  createdAt: review.createdAt,
});

module.exports = formatReview;
