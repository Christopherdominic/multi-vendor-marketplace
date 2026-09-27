export default function CartBar({
  cartItems,
  onClearCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
}) {
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (totalCount === 0) return null;

  return (
    <div id="cart" className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/80 bg-white/90 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          {/* Cart Counter & Total */}
          <div className="flex items-center space-x-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100/80 font-bold text-emerald-700 shadow-inner ring-2 ring-emerald-500/20">
              {totalCount}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Cart Subtotal
              </p>
              <p className="text-xl font-extrabold tracking-tight text-gray-900">
                ₦{totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClearCart}
              className="rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-500 transition-all hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              Clear Cart
            </button>
            <button className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-95">
              Checkout →
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs"
            >
              <span className="max-w-[120px] truncate font-medium text-gray-700">
                {item.title}
              </span>

              <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-0.5">
                <button
                  type="button"
                  onClick={() => onDecreaseQuantity(item.id)}
                  className="px-1.5 font-bold text-emerald-600 hover:text-emerald-700"
                >
                  -
                </button>
                <span className="min-w-4 text-center font-semibold text-gray-700">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onIncreaseQuantity(item.id)}
                  className="px-1.5 font-bold text-emerald-600 hover:text-emerald-700"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                className="text-[10px] font-semibold uppercase tracking-wide text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}