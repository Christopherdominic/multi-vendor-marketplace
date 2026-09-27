import { Link, useNavigate, useParams } from "react-router-dom";
import ProductCard from "./ProductCard";

export default function VendorDetail({
  vendors = [],
  products = [],
  cartItems = [],
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const normalizedId = decodeURIComponent(id || "").trim().toLowerCase();

  const vendor = vendors.find(
    (v) =>
      v.id?.trim().toLowerCase() === normalizedId ||
      v.name?.trim().toLowerCase() === normalizedId
  );

  if (!vendor) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Not Found</h2>
        <p className="mt-2 text-gray-600">The vendor you are looking for does not exist.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Back to Marketplace
        </Link>
      </main>
    );
  }

  const vendorProducts = products.filter(
    (p) =>
      p.vendorName?.toLowerCase() === vendor.name.toLowerCase() ||
      p.vendorId?.toLowerCase() === vendor.id.toLowerCase()
  );

  const metrics = [
    { label: "Rating", value: `${vendor.rating ?? "N/A"} / 5.0` },
    { label: "Location", value: vendor.location || "Not provided" },
    { label: "Response Rate", value: vendor.responseRate || "Not provided" },
    { label: "Total Products", value: vendorProducts.length },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-emerald-700"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Marketplace</span>
      </button>

      <section className="mb-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-900 px-6 py-8 text-white sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Verified Vendor
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {vendor.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            {vendor.description || "A trusted seller on the marketplace."}
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {metric.label}
              </p>
              <p className="mt-2 break-words text-lg font-bold text-gray-900">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Products from this seller
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse the latest products listed by {vendor.name}.
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-gray-500">
            {vendorProducts.length} {vendorProducts.length === 1 ? "item" : "items"}
          </span>
        </div>

        {vendorProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vendorProducts.map((product) => (
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
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900">No active products</h3>
            <p className="mt-2 text-sm text-gray-500">
              This seller does not have any active products listed right now.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Continue shopping
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}