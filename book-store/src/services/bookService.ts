// src/services/bookService.ts
import { api } from '../api/client';
import { Book } from '../types';

export type BookQueryOptions = {
  category?: string;
  q?: string;
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
};

async function getAll(params?: BookQueryOptions): Promise<Book[]> {
  const cleanParams: Record<string, any> = {};
  if (params?.category && params.category !== 'Tất cả') {
    cleanParams.category = params.category;
  }
  if (params?.q && params.q.trim()) {
    cleanParams.q = params.q.trim();
  }
  if (params?._page) cleanParams._page = params._page;
  if (params?._limit) cleanParams._limit = params._limit;
  if (params?._sort) cleanParams._sort = params._sort;
  if (params?._order) cleanParams._order = params._order;

  const res = await api.get<Book[]>('/books', { params: cleanParams });
  return res.data;
}

async function getById(id: number): Promise<Book> {
  const res = await api.get<Book>(`/books/${id}`);
  return res.data;
}

// Sách liên quan: lọc NGAY TRÊN SERVER
// category=... : cùng danh mục (so khớp chính xác)
// id_ne=... : trừ sách hiện tại (_ne = not equal)
// _limit=10 : tối đa 10 cuốn
async function getRelated(book: Book, limit = 10): Promise<Book[]> {
  const res = await api.get<Book[]>('/books', {
    params: {
      category: book.category,
      id_ne: book.id,
      _limit: limit,
    },
  });
  return res.data;
}

export default { getAll, getById, getRelated };
