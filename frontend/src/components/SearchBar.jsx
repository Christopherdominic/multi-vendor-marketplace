import { SortDropdown } from './SortDropdown';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* Search Input Container with Flexbox */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by title..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm text-gray-800 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Sort Select Container */}
      <div className="flex items-center space-x-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
          Sort by:
        </label>
        <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
      </div>
    </div>
  );
}