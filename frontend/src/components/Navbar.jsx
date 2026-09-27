import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ cartCount = 0, onCartClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-30 bg-emerald-600 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 sm:py-4 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-white transition-colors hover:text-emerald-100 sm:text-2xl"
        >
          Marketplace
        </Link>

        {/* Navigation Links & Cart Icon */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex lg:gap-6">
            <Link to="/" className="hover:text-emerald-200 transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-emerald-200 transition-colors">
              Products
            </Link>
            <Link to="/login" className="hover:text-emerald-200 transition-colors">
              Login
            </Link>
            <Link to="/register" className="hover:text-emerald-200 transition-colors">
              Register
            </Link>
          </nav>

          {/* SVG Cart Button */}
          <Link
            to="/cart"
            onClick={onCartClick}
            aria-label="Shopping Cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-700 text-white transition-all hover:bg-emerald-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.023-.811 2.182-1.928l1.103-7.72A1.125 1.125 0 0020.25 3.75H5.108m2.392 10.5h11.25"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 20.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9 20.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white ring-2 ring-emerald-700">
                {cartCount > 10 ? "10+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg border border-emerald-400/50 text-white md:hidden"
          >
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full grid gap-1 border-t border-emerald-500 bg-emerald-700 p-3 text-sm font-medium shadow-lg md:hidden"
        >
          <Link onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 hover:bg-emerald-600" to="/">Home</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 hover:bg-emerald-600" to="/products">Products</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 hover:bg-emerald-600" to="/login">Login</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 hover:bg-emerald-600" to="/register">Register</Link>
        </nav>
      )}
    </header>
  );
}