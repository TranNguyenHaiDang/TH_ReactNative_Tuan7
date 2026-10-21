import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenProps } from '../navigation/types';
import { useAppDispatch } from '../store';
import { addToCart } from '../store/cartSlice';
import bookService from '../services/bookService';
import { Book } from '../types';

const CATEGORIES = ['Tất cả', 'Văn học', 'Kỹ năng', 'Kinh tế', 'Thiếu nhi'];
const PAGE_SIZE = 6;

export default function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const dispatch = useAppDispatch();

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchBooks = useCallback(
    async (
      pageNum: number,
      category: string,
      query: string,
      isRefresh = false
    ) => {
      try {
        if (pageNum === 1 && !isRefresh) {
          setLoading(true);
        }

        const data = await bookService.getAll({
          category,
          q: query,
          _page: pageNum,
          _limit: PAGE_SIZE,
        });

        if (isRefresh || pageNum === 1) {
          setBooks(data);
        } else {
          setBooks((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Re-fetch on filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchBooks(1, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, fetchBooks]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchBooks(1, selectedCategory, searchQuery, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBooks(nextPage, selectedCategory, searchQuery);
    }
  };

  const handleBookPress = (bookId: number) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handleQuickAdd = (book: Book, e: any) => {
    e.stopPropagation();
    dispatch(addToCart(book));
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      activeOpacity={0.8}
      onPress={() => handleBookPress(item.id)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.bookImage}
        resizeMode="cover"
      />
      <View style={styles.bookDetails}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{item.category}</Text>
        </View>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.bookPrice}>
            {item.price.toLocaleString('vi-VN')} đ
          </Text>
          <TouchableOpacity
            style={styles.addCartBtn}
            onPress={(e) => handleQuickAdd(item, e)}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên sách, tác giả..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Pills - Tối ưu 100% hiển thị vừa vặn trên màn hình mobile, không bị che mất */}
      <View style={styles.categoriesWrapper}>
        <View style={styles.categoriesRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, isSelected && styles.activeCategoryTab]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isSelected && styles.activeCategoryTabText,
                  ]}
                  numberOfLines={1}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Book Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải danh sách sách...</Text>
        </View>
      ) : books.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>Không tìm thấy cuốn sách nào phù hợp</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBookItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.footerText}>Đang tải thêm...</Text>
              </View>
            ) : !hasMore && books.length > 0 ? (
              <Text style={styles.endText}>Đã hiển thị hết danh sách</Text>
            ) : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
  },
  categoriesWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  categoryTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  activeCategoryTab: {
    backgroundColor: '#2563eb',
  },
  categoryTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  activeCategoryTabText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 30,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryChipText: {
    color: '#2563eb',
    fontSize: 10,
    fontWeight: '600',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bookPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#dc2626',
  },
  addCartBtn: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
  endText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    paddingVertical: 16,
  },
});
