import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  cartItems,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
}) {
  if (!products || products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          🔍
        </div>
        <h3 className="text-base font-semibold text-gray-800">
          No products found
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Try adjusting your search terms, price limits, or active filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          cartItems={cartItems}
          onAddToCart={onAddToCart}
          onIncreaseQuantity={onIncreaseQuantity}
          onDecreaseQuantity={onDecreaseQuantity}
        />
      ))}
    </div>
  );
}