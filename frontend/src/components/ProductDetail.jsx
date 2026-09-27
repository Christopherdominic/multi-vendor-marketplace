import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReviewList from './ReviewList';

export default function ProductDetail({ products = [], onAddToCart }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  if (!id || Number.isNaN(Number(id))) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Invalid Product ID</h2>
        <p className="mt-2 text-xs text-gray-500">
          The product link is missing or invalid.
        </p>
        <Link
          to="/products"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const product = products.find((p) => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <p className="mt-2 text-xs text-gray-500">
          The item you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/products"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const productTitle = product.title || 'Product';
  const productVendor = product.vendorName || 'Verified Vendor';
  const vendorPath = product.vendorId || product.vendorName;
  const images = Array.isArray(product.images)
    ? product.images
    : [product.image || 'https://via.placeholder.com/600x600'];

  const mockReviews = product.reviews || [
    {
      id: 1,
      author: 'Amina B.',
      rating: 5,
      comment:
        'Excellent product quality! Delivery was super quick and vendor was communicative.',
      date: '2 days ago',
    },
    {
      id: 2,
      author: 'David O.',
      rating: 4,
      comment: 'Matches the description well. Good value for money.',
      date: '1 week ago',
    },
  ];

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
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
        <span>Back to Products</span>
      </button>

      <nav className="mb-6 flex items-center space-x-2 text-xs text-gray-500">
        <Link to="/products" className="hover:text-emerald-600">
          Products
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="max-w-[200px] truncate font-medium text-gray-800">
          {productTitle}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <img
              src={images[selectedImage]}
              alt={productTitle}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                {product.category}
              </span>

              <Link
                to={`/vendors/${vendorPath}`}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <span>Sold by {productVendor}</span>
                <span>→</span>
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {productTitle}
            </h1>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-2xl font-black text-gray-900">
                  ₦{(product.price || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.inStock !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-gray-600">
              {product.description ||
                'High quality item sourced directly from trusted vendors across Nigeria.'}
            </p>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div className="flex items-center space-x-4">
              <label className="text-xs font-bold uppercase text-gray-500">
                Quantity
              </label>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {product.inStock !== false
                ? `Add ${quantity} to Cart • ₦${(product.price * quantity).toLocaleString()}`
                : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 flex space-x-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-xs font-bold transition-all ${
              activeTab === 'description'
                ? 'border-b-2 border-emerald-600 text-emerald-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-bold transition-all ${
              activeTab === 'reviews'
                ? 'border-b-2 border-emerald-600 text-emerald-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Customer Reviews ({mockReviews.length})
          </button>
        </div>

        {activeTab === 'description' ? (
          <div className="space-y-3 text-xs leading-relaxed text-gray-600">
            <p>
              {product.description || 'No detailed description available for this product.'}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>Guaranteed authentic from official vendor</li>
              <li>Eligible for fast nationwide delivery</li>
              <li>Standard 7-day return policy applies</li>
            </ul>
          </div>
        ) : (
          <ReviewList reviews={mockReviews} />
        )}
      </div>
    </div>
  );
}