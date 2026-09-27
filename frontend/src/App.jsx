import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/products";

import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import CategoryBar from "./components/CategoryBar";
import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";
import CartBar from "./components/CartBar";
import ProductDetail from "./components/ProductDetail";
import VendorDetail from "./components/VendorDetail";
import { useCart } from "./hooks/useCart";
import { useProductFilters } from "./hooks/useProductFilters";
import { categoriesList, dummyProducts, dummyVendors } from "./data/productsData";

const getPageSize = () => {
  if (window.innerWidth < 640) return 4;
  if (window.innerWidth < 1024) return 8;
  return 12;
};

export default function App() {
  const [products] = useState(dummyProducts);
  const [cartViewed, setCartViewed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(getPageSize);

  const {
    cartItems,
    handleAddToCart,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveItem,
    handleClearCart,
  } = useCart();

  const addToCart = (...args) => {
    setCartViewed(false);
    handleAddToCart(...args);
  };

  const increaseQuantity = (...args) => {
    setCartViewed(false);
    handleIncreaseQuantity(...args);
  };

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceFloor,
    priceCeiling,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    inStockOnly,
    setInStockOnly,
    sortBy,
    setSortBy,
    filteredProducts,
    handleResetFilters,
  } = useProductFilters(products);

  const pageCount = Math.ceil(filteredProducts.length / pageSize);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(pageStart, pageStart + pageSize);
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  const visiblePages = Array.from(
    { length: Math.min(pageCount, 5) },
    (_, index) => firstVisiblePage + index
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts, pageSize]);

  useEffect(() => {
    const updatePageSize = () => setPageSize(getPageSize());
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  const marketplacePage = (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Search Bar */}
      <div>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* 2. Category Bar with top/bottom separation */}
      <div className="py-2">
        <CategoryBar
          categories={categoriesList}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* 3. Main Grid & Filters */}
      <div className="flex flex-col gap-8 pt-2 xl:flex-row">
        <FilterSidebar
          priceFloor={priceFloor}
          priceCeiling={priceCeiling}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          inStockOnly={inStockOnly}
          onInStockChange={setInStockOnly}
          onResetFilters={handleResetFilters}
        />
        <div className="flex-1">
          <ProductGrid
            products={paginatedProducts}
            cartItems={cartItems}
            onAddToCart={addToCart}
            onIncreaseQuantity={increaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
          />
          {pageCount > 1 && (
            <nav aria-label="Product pages" className="mt-8 flex flex-wrap justify-center gap-1 sm:gap-2">
              {pageCount > 5 && (
                <>
                  <button
                    type="button"
                    aria-label="First page"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-11 min-w-11 rounded-md border border-gray-200 bg-white px-2 text-gray-700 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    |&lt;
                  </button>
                  <button
                    type="button"
                    aria-label="Previous page"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="h-11 min-w-11 rounded-md border border-gray-200 bg-white px-2 text-gray-700 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &lt;
                  </button>
                </>
              )}
              {visiblePages.map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  onClick={() => setCurrentPage(page)}
                  className={`h-11 min-w-11 rounded-md border px-3 text-sm font-semibold transition ${
                    currentPage === page
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {page}
                </button>
              ))}
              {pageCount > 5 && (
                <>
                  <button
                    type="button"
                    aria-label="Next page"
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                    disabled={currentPage === pageCount}
                    className="h-11 min-w-11 rounded-md border border-gray-200 bg-white px-2 text-gray-700 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &gt;
                  </button>
                  <button
                    type="button"
                    aria-label="Last page"
                    onClick={() => setCurrentPage(pageCount)}
                    disabled={currentPage === pageCount}
                    className="h-11 min-w-11 rounded-md border border-gray-200 bg-white px-2 text-gray-700 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &gt;|
                  </button>
                </>
              )}
            </nav>
          )}
        </div>
      </div>

      {/* 4. Cart Sidebar / Drawer */}
      <CartBar
        cartItems={cartItems}
        onClearCart={handleClearCart}
        onIncreaseQuantity={handleIncreaseQuantity}
        onDecreaseQuantity={handleDecreaseQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </main>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Persistent Navbar across all routes */}
      <Navbar
        cartCount={cartViewed ? 0 : cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setCartViewed(true)}
      />

      {/* Routes setup */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={marketplacePage} />
        <Route path="/marketplace" element={marketplacePage} />
        <Route
          path="/cart"
          element={
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Cart</h1>
              <CartBar
                cartItems={cartItems}
                onClearCart={handleClearCart}
                onIncreaseQuantity={increaseQuantity}
                onDecreaseQuantity={handleDecreaseQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </main>
          }
        />
        <Route
          path="/products/:id"
          element={
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <ProductDetail
                products={products}
                onAddToCart={addToCart}
              />
            </main>
          }
        />
        <Route
          path="/vendors/:id"
          element={
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <VendorDetail
                vendors={dummyVendors}
                products={products}
                cartItems={cartItems}
                onAddToCart={addToCart}
                onIncreaseQuantity={increaseQuantity}
                onDecreaseQuantity={handleDecreaseQuantity}
              />
            </main>
          }
        />
        <Route
          path="*"
          element={
            <main className="mx-auto max-w-7xl px-4 py-16 text-center">
              <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
              <p className="mt-2 text-gray-600">Page Not Found</p>
              <Link
                to="/products"
                className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition-colors"
              >
                Back to Marketplace
              </Link>
            </main>
          }
        />
      </Routes>
    </div>
  );
}