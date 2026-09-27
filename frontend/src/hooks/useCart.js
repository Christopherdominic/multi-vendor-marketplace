import { useCallback, useEffect, useState } from 'react';

import { CART_STORAGE_KEY } from '../utils/constants';

const getStoredCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};

export function useCart() {
  const [cartItems, setCartItems] = useState(getStoredCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = useCallback((product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: quantityToAdd }];
    });
  }, []);

  const handleIncreaseQuantity = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const handleDecreaseQuantity = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return {
    cartItems,
    handleAddToCart,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveItem,
    handleClearCart,
  };
}
