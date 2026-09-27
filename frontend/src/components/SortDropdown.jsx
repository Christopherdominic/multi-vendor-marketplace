import { useState, useRef, useEffect } from 'react';

export function SortDropdown({ sortBy, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Exact values from your original code
  const options = [
    { label: 'Featured', value: 'default' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Name (A-Z)', value: 'name' },
  ];

  const currentLabel =
    options.find((o) => o.value === sortBy)?.label || 'Featured';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 bg-white border ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-gray-200 hover:border-emerald-500'
        } text-gray-700 text-sm font-medium rounded-xl px-4 py-2 transition-all shadow-sm min-w-[170px]`}
      >
        <span>{currentLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSortChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-emerald-50 text-emerald-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}