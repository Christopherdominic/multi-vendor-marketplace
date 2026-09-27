import { useEffect, useState } from "react";

export default function FilterSidebar({
  priceFloor,
  priceCeiling,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  inStockOnly,
  onInStockChange,
  onResetFilters,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const priceSpan = priceCeiling - priceFloor;
  const minProgress = priceSpan > 0 ? ((minPrice - priceFloor) / priceSpan) * 100 : 0;
  const maxProgress = priceSpan > 0 ? ((maxPrice - priceFloor) / priceSpan) * 100 : 100;
  const [minDraft, setMinDraft] = useState(String(minPrice));
  const [maxDraft, setMaxDraft] = useState(String(maxPrice));

  useEffect(() => {
    setMinDraft(String(minPrice));
    setMaxDraft(String(maxPrice));
  }, [minPrice, maxPrice]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const commitMin = () => {
    const value = Number(minDraft);
    const nextValue = Number.isFinite(value)
      ? Math.max(priceFloor, Math.min(value, maxPrice))
      : priceFloor;
    setMinDraft(String(nextValue));
    onMinPriceChange(nextValue);
  };

  const commitMax = () => {
    const value = Number(maxDraft);
    const nextValue = Number.isFinite(value)
      ? Math.min(priceCeiling, Math.max(value, minPrice))
      : priceCeiling;
    setMaxDraft(String(nextValue));
    onMaxPriceChange(nextValue);
  };

  const commitOnEnter = (event, commitValue) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitValue();
      event.currentTarget.blur();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="mb-2 flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm xl:hidden"
      >
        <span>Filters</span>
        <span className="text-emerald-700">Open</span>
      </button>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-950/40 xl:hidden"
        />
      )}
      <aside className={`w-full rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all xl:sticky xl:top-4 xl:block xl:w-64 xl:self-start ${
        mobileOpen
          ? "fixed inset-x-4 top-20 z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto"
          : "hidden xl:block"
      }`}>
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
          Filters
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetFilters}
            className="min-h-11 px-2 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
          >
            Reset All
          </button>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-xl text-gray-600 hover:bg-gray-100 xl:hidden"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Price Range (₦)
        </h3>

        <div className="pt-1">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <label className="block text-[10px] font-semibold uppercase text-gray-400">
              Min
              <input
                type="number"
                aria-label="Minimum price"
                min={priceFloor}
                max={maxPrice}
                value={minDraft}
                onChange={(event) => setMinDraft(event.target.value)}
                onBlur={commitMin}
                onKeyDown={(event) => commitOnEnter(event, commitMin)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
              />
            </label>
            <label className="block text-[10px] font-semibold uppercase text-gray-400">
              Max
              <input
                type="number"
                aria-label="Maximum price"
                min={minPrice}
                max={priceCeiling}
                value={maxDraft}
                onChange={(event) => setMaxDraft(event.target.value)}
                onBlur={commitMax}
                onKeyDown={(event) => commitOnEnter(event, commitMax)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          </div>
          <div className="mb-2 flex justify-between text-[11px] font-medium text-gray-500">
            <span className="font-semibold text-gray-800">₦{minPrice.toLocaleString()}</span>
            <span className="font-semibold text-gray-800">₦{maxPrice.toLocaleString()}</span>
          </div>
          <div className="relative h-6">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
              style={{
                background: `linear-gradient(to right, #e5e7eb ${minProgress}%, #059669 ${minProgress}%, #059669 ${maxProgress}%, #e5e7eb ${maxProgress}%)`,
              }}
            />
            <input
              type="range"
              aria-label="Minimum price slider"
              min={priceFloor}
              max={Math.max(priceFloor, maxPrice - 1)}
              step="1"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              className="price-range-thumb"
              style={{ zIndex: minPrice >= maxPrice - 1 ? 4 : 3 }}
            />
            <input
              type="range"
              aria-label="Maximum price slider"
              min={Math.min(priceCeiling, minPrice + 1)}
              max={priceCeiling}
              step="1"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              className="price-range-thumb"
              style={{ zIndex: minPrice >= maxPrice - 1 ? 3 : 4 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            <span>Minimum</span>
            <span>Maximum</span>
          </div>
        </div>
      </div>

      {/* Stock Checkbox */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <label className="group flex min-h-11 cursor-pointer items-center space-x-3">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 transition focus:ring-emerald-500"
          />
          <span className="text-xs font-medium text-gray-700 transition-colors group-hover:text-emerald-700">
            In Stock Only
          </span>
        </label>
      </div>
      </aside>
    </>
  );
}