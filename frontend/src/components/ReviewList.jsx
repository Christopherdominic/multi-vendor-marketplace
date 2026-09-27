export default function ReviewList({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-gray-500">
        No reviews yet for this product. Be the first to write one!
      </div>
    );
  }

  const averageRating = (
    reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Rating Header */}
      <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
        <div className="text-center">
          <span className="text-3xl font-extrabold text-gray-900">{averageRating}</span>
          <div className="text-[11px] font-medium text-gray-400">out of 5</div>
        </div>
        <div className="space-y-0.5">
          <div className="flex text-amber-400 text-sm">
            {"★".repeat(Math.round(averageRating))}
            {"☆".repeat(5 - Math.round(averageRating))}
          </div>
          <p className="text-xs text-gray-500">Based on {reviews.length} customer reviews</p>
        </div>
      </div>

      {/* Review Items */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id || review._id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-800">{review.author || "Verified Buyer"}</span>
              <span className="text-[10px] text-gray-400">{review.date || "Recently"}</span>
            </div>
            <div className="flex text-amber-400 text-xs mb-2">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}