// src/types.ts

// json-server dùng id kiểu number (tự tăng 1, 2, 3...)
export type Id = number;

export type User = {
  id: Id;
  name: string;
  email: string;
};

export type Book = {
  id: Id;
  title: string;
  author: string;
  category: string;
  price: number;
  image: string;
  description: string;
};

// Resource riêng /reviews, liên kết với sách qua bookId (khoá ngoại)
export type Review = {
  id: Id;
  bookId: Id;
  userId: Id;
  userName: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string; // ISO string
};

export type CartItem = {
  book: Book;
  quantity: number;
};
