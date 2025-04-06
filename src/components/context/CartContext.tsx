"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  refreshCart: () => void; // New refresh function
  cartVersion: number; // To trigger re-renders when cart data changes
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartVersion, setCartVersion] = useState(0); // Add a version counter

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);
  
  // Add a refresh function that updates the version number
  const refreshCart = useCallback(() => {
    setCartVersion(prev => prev + 1);
  }, []);

  return (
    <CartContext.Provider value={{ 
      isCartOpen, 
      openCart, 
      closeCart, 
      toggleCart,
      refreshCart,
      cartVersion
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};