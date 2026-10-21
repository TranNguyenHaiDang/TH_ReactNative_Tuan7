// src/screens/CartScreen.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../store/cartSlice';
import PrimaryButton from '../components/PrimaryButton';
import { CartItem } from '../types';
import { confirmAction, showAlert } from '../utils/alert';

export default function CartScreen({ navigation }: ScreenProps<'Cart'>) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.auth.user);

  const subtotal = cartItems.reduce(
    (acc, curr) => acc + curr.book.price * curr.quantity,
    0
  );
  const shippingFee = subtotal > 200000 || subtotal === 0 ? 0 : 25000;
  const total = subtotal + shippingFee;

  const handleCheckoutPress = () => {
    if (cartItems.length === 0) {
      showAlert('Giỏ hàng trống', 'Vui lòng chọn ít nhất một cuốn sách để thanh toán.');
      return;
    }

    // Bảo vệ màn hình Checkout: Chưa đăng nhập → điều hướng ngay sang Login với redirect: 'Checkout'
    if (!user) {
      navigation.navigate('Login', { redirect: 'Checkout' });
      return;
    }

    // Đã đăng nhập → vào thẳng màn Checkout
    navigation.navigate('Checkout');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.book.image }} style={styles.thumbnail} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.book.title}
        </Text>
        <Text style={styles.itemAuthor}>{item.book.author}</Text>
        <Text style={styles.itemPrice}>
          {item.book.price.toLocaleString('vi-VN')} đ
        </Text>

        <View style={styles.quantityRow}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() =>
                dispatch(
                  updateQuantity({
                    bookId: item.book.id,
                    quantity: item.quantity - 1,
                  })
                )
              }
            >
              <Ionicons name="remove" size={16} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.stepQty}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() =>
                dispatch(
                  updateQuantity({
                    bookId: item.book.id,
                    quantity: item.quantity + 1,
                  })
                )
              }
            >
              <Ionicons name="add" size={16} color="#475569" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => dispatch(removeFromCart(item.book.id))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="cart-outline" size={54} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
        <Text style={styles.emptySubtitle}>
          Hãy khám phá hàng ngàn cuốn sách hay và thêm vào giỏ nhé!
        </Text>
        <PrimaryButton
          title="Tiếp tục mua sách"
          icon="arrow-back-outline"
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.itemCountText}>
          {cartItems.length} loại sách trong giỏ
        </Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Xoá tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.book.id)}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
      />

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>
            {subtotal.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
          <Text style={styles.summaryValue}>
            {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} đ</Text>
        </View>

        <PrimaryButton
          title={user ? 'Tiến hành Thanh toán' : 'Đăng nhập để Thanh toán'}
          icon="card-outline"
          onPress={handleCheckoutPress}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemCountText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  thumbnail: {
    width: 80,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
  itemAuthor: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    paddingHorizontal: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#dc2626',
  },
  checkoutBtn: {
    marginTop: 4,
  },
});
