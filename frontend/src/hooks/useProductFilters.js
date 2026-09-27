import { useEffect, useMemo, useState } from 'react';

import {
  ALL_CATEGORY,
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  DEFAULT_SORT,
  SORT_OPTIONS,
} from '../utils/constants';

export function useProductFilters(products) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);

  const categoryProducts = useMemo(
    () => products.filter((product) =>
      selectedCategory === ALL_CATEGORY || product.category === selectedCategory
    ),
    [products, selectedCategory]
  );

  const catalogPriceBounds = useMemo(() => {
    if (products.length === 0) {
      return { min: DEFAULT_MIN_PRICE, max: DEFAULT_MAX_PRICE };
    }

    return products.reduce(
      (bounds, product) => ({
        min: Math.min(bounds.min, product.price),
        max: Math.max(bounds.max, product.price),
      }),
      { min: Infinity, max: -Infinity }
    );
  }, [products]);

  const priceBounds = useMemo(() => {
    if (categoryProducts.length === 0) {
      return { min: DEFAULT_MIN_PRICE, max: DEFAULT_MAX_PRICE };
    }

    return categoryProducts.reduce(
      (bounds, product) => ({
        min: Math.min(bounds.min, product.price),
        max: Math.max(bounds.max, product.price),
      }),
      { min: Infinity, max: -Infinity }
    );
  }, [categoryProducts]);

  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);

  useEffect(() => {
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  }, [priceBounds]);

  const handleMinPriceChange = (value) => {
    const nextMin = Number(value);
    if (Number.isFinite(nextMin)) {
      setMinPrice(Math.max(priceBounds.min, Math.min(nextMin, maxPrice)));
    }
  };

  const handleMaxPriceChange = (value) => {
    const nextMax = Number(value);
    if (Number.isFinite(nextMax)) {
      setMaxPrice(Math.min(priceBounds.max, Math.max(nextMax, minPrice)));
    }
  };

  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) => {
        const titleMatch = (product.title || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === ALL_CATEGORY || product.category === selectedCategory;

        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        const matchesStock = inStockOnly ? product.inStock : true;

        return titleMatch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === SORT_OPTIONS.PRICE_LOW) return a.price - b.price;
        if (sortBy === SORT_OPTIONS.PRICE_HIGH) return b.price - a.price;
        if (sortBy === SORT_OPTIONS.NAME) return a.title.localeCompare(b.title);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(ALL_CATEGORY);
    setMinPrice(catalogPriceBounds.min);
    setMaxPrice(catalogPriceBounds.max);
    setInStockOnly(false);
    setSortBy(DEFAULT_SORT);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceFloor: priceBounds.min,
    priceCeiling: priceBounds.max,
    minPrice,
    setMinPrice: handleMinPriceChange,
    maxPrice,
    setMaxPrice: handleMaxPriceChange,
    inStockOnly,
    setInStockOnly,
    sortBy,
    setSortBy,
    filteredProducts,
    handleResetFilters,
  };
}
