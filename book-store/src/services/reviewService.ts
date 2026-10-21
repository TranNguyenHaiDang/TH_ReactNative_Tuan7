// src/services/reviewService.ts
import { api } from '../api/client';
import { Review } from '../types';

export type NewReview = Omit<Review, 'id' | 'createdAt'>;

// GET /reviews?bookId=3&_sort=createdAt&_order=desc
// (tương đương GET /books/3/reviews nhưng có sắp xếp mới nhất lên đầu)
async function getByBook(bookId: number): Promise<Review[]> {
  const res = await api.get<Review[]>('/reviews', {
    params: { bookId, _sort: 'createdAt', _order: 'desc' },
  });
  return res.data;
}

// POST /reviews — route 644: ai cũng đọc được, nhưng muốn tạo phải
// gửi kèm token VÀ userId trong body phải trùng với chủ token
async function create(input: NewReview): Promise<Review> {
  const res = await api.post<Review>('/reviews', {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return res.data; // json-server trả về bản ghi vừa tạo (có id mới)
}

// Thử thách: Xoá review của chính mình (DELETE /reviews/:id)
// Server sẽ tự chặn nếu không phải chính chủ (403)
async function deleteReview(id: number): Promise<void> {
  await api.delete(`/reviews/${id}`);
}

export default { getByBook, create, deleteReview };
