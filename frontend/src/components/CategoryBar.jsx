import { useRef } from "react";

export default function CategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  const scrollContainerRef = useRef(null);

  // Smooth scroll handler
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.6; // Scroll 60% of the container width
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex items-center gap-2 mb-6 w-full">
      {/* Left Scroll Button */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll Left"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Scrollable Categories List */}
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex flex-1 items-center space-x-2 overflow-x-auto scroll-smooth px-1 py-2"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`min-h-11 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all focus:outline-none shrink-0 ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll Right"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}