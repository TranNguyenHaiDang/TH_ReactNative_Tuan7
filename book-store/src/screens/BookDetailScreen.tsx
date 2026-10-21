// src/screens/BookDetailScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import ReviewForm from '../components/ReviewForm';
import RelatedBooks from '../components/RelatedBooks';
import PrimaryButton from '../components/PrimaryButton';
import bookService from '../services/bookService';
import reviewService from '../services/reviewService';
import { ScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart } from '../store/cartSlice';
import { logout } from '../store/authSlice';
import { Book, Review } from '../types';
import { averageRating } from '../utils/rating';
import { confirmAction, showAlert } from '../utils/alert';

export default function BookDetailScreen({ navigation, route }: ScreenProps<'BookDetail'>) {
  const { bookId } = route.params;
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false; // tránh setState khi đã rời màn hình

    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Gọi song song: thông tin sách + danh sách review của sách
        const [b, r] = await Promise.all([
          bookService.getById(bookId),
          reviewService.getByBook(bookId),
        ]);
        if (cancelled) return;
        setBook(b);
        setReviews(r);

        // Thử thách: sách liên quan (lỗi phần này không làm hỏng cả trang)
        bookService
          .getRelated(b)
          .then((list) => !cancelled && setRelated(list))
          .catch(() => {});
      } catch {
        if (!cancelled) setError('Không tải được thông tin sách');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // Điểm trung bình tự tính lại mỗi khi mảng reviews thay đổi
  const avg = useMemo(() => averageRating(reviews), [reviews]);

  const handleAddToCart = () => {
    if (book) {
      dispatch(addToCart(book));
      confirmAction(
        'Đã thêm vào giỏ',
        `"${book.title}" đã được thêm vào giỏ hàng của bạn.`,
        () => navigation.navigate('Cart'),
        'Xem giỏ hàng',
        'Tiếp tục xem'
      );
    }
  };

  const handleSubmitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!user) return;
      let created: Review;
      try {
        // POST /reviews → server trả về review vừa tạo
        created = await reviewService.create({
          bookId,
          userId: user.id, // phải trùng chủ token, nếu không server trả 403
          userName: user.name,
          rating,
          comment,
        });
      } catch (err: any) {
        // Token hết hạn (json-server-auth: 1 giờ) → đăng xuất, form đổi thành nút "Đăng nhập"
        if (err?.response?.status === 401) {
          dispatch(logout());
        }
        throw err; // để ReviewForm hiện thông báo lỗi
      }

      // Thêm vào state cục bộ → danh sách + điểm TB đổi ngay, không load lại cả trang
      setReviews((prev) => [created, ...prev]);
    },
    [bookId, user, dispatch]
  );

  const handleDeleteReview = useCallback(
    async (reviewId: number) => {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        showAlert('Thành công', 'Đã xoá đánh giá của bạn.');
      } catch (err: any) {
        showAlert('Lỗi', err?.message || 'Không thể xoá đánh giá này.');
      }
    },
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Đang tải thông tin sách...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.center}>{error ?? 'Không tìm thấy sách'}</Text>
        <PrimaryButton
          title="Quay lại"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.top}>
        <Image
          source={{ uri: book.image }}
          style={styles.cover}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>Tác giả: {book.author}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{book.category}</Text>
          </View>
          <Text style={styles.price}>
            {book.price.toLocaleString('vi-VN')} đ
          </Text>
          <PrimaryButton
            title="Thêm vào giỏ"
            icon="cart-outline"
            onPress={handleAddToCart}
          />
        </View>
      </View>

      <View style={styles.descSection}>
        <Text style={styles.descTitle}>Giới thiệu cuốn sách</Text>
        <Text style={styles.desc}>{book.description}</Text>
      </View>

      {/* ---- Bài 3: Điểm trung bình + danh sách review ---- */}
      <View style={styles.reviewsHeader}>
        <Text style={styles.sectionTitle}>Đánh giá & Nhận xét</Text>
      </View>

      <View style={styles.avgBox}>
        <View style={styles.avgNumberWrapper}>
          <Text style={styles.avgNumber}>{avg.toFixed(1)}</Text>
          <Text style={styles.maxScale}>/ 5</Text>
        </View>
        <View style={styles.avgStarsWrapper}>
          <RatingStars value={avg} size={22} />
          <Text style={styles.count}>{reviews.length} lượt đánh giá từ bạn đọc</Text>
        </View>
      </View>

      {user ? (
        <ReviewForm onSubmit={handleSubmitReview} />
      ) : (
        <View style={styles.loginPromptCard}>
          <Text style={styles.loginPromptText}>
            Bạn muốn chia sẻ cảm nghĩ về cuốn sách này?
          </Text>
          <PrimaryButton
            variant="outline"
            title="Đăng nhập để viết đánh giá"
            icon="log-in-outline"
            onPress={() => navigation.navigate('Login', { redirect: 'goBack' })}
          />
        </View>
      )}

      <Text style={styles.reviewsListTitle}>
        Tất cả nhận xét ({reviews.length})
      </Text>

      {reviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.empty}>
            Chưa có đánh giá nào cho cuốn sách này. Hãy là người đầu tiên để lại cảm nhận!
          </Text>
        </View>
      ) : (
        // Dùng map trong ScrollView
        reviews.map((r) => (
          <ReviewItem
            key={String(r.id)}
            review={r}
            currentUserId={user?.id}
            onDelete={handleDeleteReview}
          />
        ))
      )}

      {/* ---- Thử thách: Sách liên quan ---- */}
      <RelatedBooks
        books={related}
        onPressBook={(id) => navigation.push('BookDetail', { bookId: id })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  top: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cover: {
    width: 125,
    height: 185,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 24,
  },
  author: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    color: '#dc2626',
    fontWeight: '800',
    marginVertical: 6,
  },
  descSection: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  desc: {
    lineHeight: 22,
    color: '#334155',
    fontSize: 14,
  },
  reviewsHeader: {
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  avgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  avgNumberWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  avgNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#0f172a',
  },
  maxScale: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    marginLeft: 2,
  },
  avgStarsWrapper: {
    flex: 1,
  },
  count: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  loginPromptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 12,
  },
  loginPromptText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
  reviewsListTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  empty: {
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },
});
