// src/store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book, CartItem } from '../types';

export type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Book>) => {
      const book = action.payload;
      const existing = state.items.find((item) => item.book.id === book.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ book, quantity: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      const bookId = action.payload;
      state.items = state.items.filter((item) => item.book.id !== bookId);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ bookId: number; quantity: number }>
    ) => {
      const { bookId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.book.id !== bookId);
      } else {
        const item = state.items.find((i) => i.book.id === bookId);
        if (item) {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
