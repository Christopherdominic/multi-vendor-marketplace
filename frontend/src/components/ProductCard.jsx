import { Link } from "react-router-dom";

export default function ProductCard({
  product,
  cartItems = [],
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
}) {
  const { id, title, price, image, category, vendorId, vendorName, inStock } = product;
  const displayTitle = title || "Product";
  const displayVendor = vendorName || "Verified Vendor";
  const vendorPath = vendorId || vendorName;
  const cartItem = cartItems.find((item) => item.id === id);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div>
        {/* Clickable Image -> Product Detail Page */}
        <Link to={`/products/${id}`} className="block relative mb-3.5 h-48 w-full overflow-hidden rounded-xl bg-gray-100">
          <img
            src={image}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              inStock
                ? "bg-emerald-100/90 text-emerald-800 backdrop-blur-sm"
                : "bg-rose-100/90 text-rose-800 backdrop-blur-sm"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </Link>

        {/* Category & Clickable Title -> Product Detail Page */}
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
          {category}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Sold by{" "}
          <Link
            to={`/vendors/${vendorPath}`}
            className="font-semibold text-gray-700 hover:text-emerald-600 hover:underline"
          >
            {displayVendor}
          </Link>
        </p>
        <Link to={`/products/${id}`} className="block">
          <h3 className="mt-1 text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-emerald-700">
            {displayTitle}
          </h3>
        </Link>
      </div>

      {/* Price & Add to Cart Container */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium text-gray-400">Price</span>
          <p className="truncate text-sm font-bold text-gray-900 sm:text-base">
            ₦{(price || 0).toLocaleString()}
          </p>
        </div>

        {!inStock ? (
          <button
            disabled
            className="min-h-11 shrink-0 cursor-not-allowed whitespace-nowrap rounded-lg bg-gray-100 px-3 text-xs font-semibold text-gray-400"
          >
            Unavailable
          </button>
        ) : cartItem ? (
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-1">
            <button
              type="button"
              onClick={() => onDecreaseQuantity(cartItem.id)}
              className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-600 text-lg font-bold leading-none text-white transition hover:bg-emerald-700"
              aria-label={`Decrease ${displayTitle} quantity`}
            >
              -
            </button>
            <span className="min-w-5 text-center text-sm font-bold text-gray-800">
              {cartItem.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncreaseQuantity(cartItem.id)}
              className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-600 text-lg font-bold leading-none text-white transition hover:bg-emerald-700"
              aria-label={`Increase ${displayTitle} quantity`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="min-h-11 shrink-0 whitespace-nowrap rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}