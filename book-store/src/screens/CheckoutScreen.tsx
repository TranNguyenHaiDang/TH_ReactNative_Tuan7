// src/screens/CheckoutScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import { clearCart } from '../store/cartSlice';
import PrimaryButton from '../components/PrimaryButton';
import { confirmAction, showAlert } from '../utils/alert';

export default function CheckoutScreen({ navigation }: ScreenProps<'Checkout'>) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [receiverName, setReceiverName] = useState(user?.name || '');
  const [phone, setPhone] = useState('0901234567');
  const [address, setAddress] = useState('123 Đường Nguyễn Huệ, Quận 1, TP. HCM');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking' | 'momo'>('cod');
  const [submitting, setSubmitting] = useState(false);

  // Chặn truy cập nếu chưa đăng nhập (Bảo vệ Checkout)
  useEffect(() => {
    if (!user) {
      navigation.replace('Login', { redirect: 'Checkout' });
    }
  }, [user, navigation]);

  const subtotal = cartItems.reduce(
    (acc, curr) => acc + curr.book.price * curr.quantity,
    0
  );
  const shippingFee = subtotal > 200000 || subtotal === 0 ? 0 : 25000;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = () => {
    if (!receiverName.trim() || !phone.trim() || !address.trim()) {
      showAlert('Thiếu thông tin', 'Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      dispatch(clearCart());
      confirmAction(
        '🎉 Đặt hàng thành công!',
        `Cảm ơn bạn ${receiverName}! Đơn hàng trị giá ${total.toLocaleString(
          'vi-VN'
        )} đ đã được tiếp nhận và sẽ sớm được giao đến bạn.`,
        () => navigation.navigate('Home'),
        'Về trang chủ'
      );
    }, 1200);
  };

  if (!user) {
    return (
      <View style={styles.protectedContainer}>
        <Ionicons name="lock-closed-outline" size={56} color="#ef4444" />
        <Text style={styles.protectedTitle}>Màn hình này được bảo vệ</Text>
        <Text style={styles.protectedSubtitle}>
          Bạn cần đăng nhập để xem thông tin thanh toán.
        </Text>
        <PrimaryButton
          title="Đăng nhập ngay"
          icon="log-in-outline"
          onPress={() => navigation.replace('Login', { redirect: 'Checkout' })}
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
      {/* Customer Header */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle-outline" size={22} color="#2563eb" />
          <Text style={styles.cardTitle}>Tài khoản đặt hàng</Text>
        </View>
        <View style={styles.userRow}>
          <Text style={styles.userLabel}>Họ tên:</Text>
          <Text style={styles.userValue}>{user.name}</Text>
        </View>
        <View style={styles.userRow}>
          <Text style={styles.userLabel}>Email:</Text>
          <Text style={styles.userValue}>{user.email}</Text>
        </View>
      </View>

      {/* Shipping Address Form */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location-outline" size={22} color="#2563eb" />
          <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Người nhận hàng</Text>
          <TextInput
            style={styles.input}
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="Tên người nhận"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="0901234567"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Địa chỉ chi tiết</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Số nhà, đường, phường/xã, quận/huyện..."
            multiline
          />
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet-outline" size={22} color="#2563eb" />
          <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
        </View>

        <TouchableOpacity
          style={[styles.methodOption, paymentMethod === 'cod' && styles.methodSelected]}
          onPress={() => setPaymentMethod('cod')}
        >
          <Ionicons
            name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={paymentMethod === 'cod' ? '#2563eb' : '#94a3b8'}
          />
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Thanh toán khi nhận hàng (COD)</Text>
            <Text style={styles.methodDesc}>Trả tiền mặt khi người giao hàng đến</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodOption, paymentMethod === 'banking' && styles.methodSelected]}
          onPress={() => setPaymentMethod('banking')}
        >
          <Ionicons
            name={paymentMethod === 'banking' ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={paymentMethod === 'banking' ? '#2563eb' : '#94a3b8'}
          />
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Chuyển khoản ngân hàng</Text>
            <Text style={styles.methodDesc}>Quét mã VietQR chuyển khoản nhanh 24/7</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodOption, paymentMethod === 'momo' && styles.methodSelected]}
          onPress={() => setPaymentMethod('momo')}
        >
          <Ionicons
            name={paymentMethod === 'momo' ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={paymentMethod === 'momo' ? '#2563eb' : '#94a3b8'}
          />
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Ví điện tử MoMo</Text>
            <Text style={styles.methodDesc}>Thanh toán tiện lợi qua ứng dụng MoMo</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Order Summary */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="receipt-outline" size={22} color="#2563eb" />
          <Text style={styles.cardTitle}>Đơn hàng ({cartItems.length} sản phẩm)</Text>
        </View>

        {cartItems.map((item) => (
          <View key={String(item.book.id)} style={styles.orderItemRow}>
            <Text style={styles.orderItemTitle} numberOfLines={1}>
              {item.quantity}x {item.book.title}
            </Text>
            <Text style={styles.orderItemPrice}>
              {(item.book.price * item.quantity).toLocaleString('vi-VN')} đ
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Tạm tính:</Text>
          <Text style={styles.feeVal}>{subtotal.toLocaleString('vi-VN')} đ</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Phí vận chuyển:</Text>
          <Text style={styles.feeVal}>
            {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalVal}>{total.toLocaleString('vi-VN')} đ</Text>
        </View>
      </View>

      <PrimaryButton
        title={submitting ? 'Đang xử lý đơn hàng...' : 'Xác nhận Đặt hàng'}
        icon="checkmark-circle-outline"
        onPress={handlePlaceOrder}
        loading={submitting}
        disabled={submitting}
        style={styles.submitOrderBtn}
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
  protectedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  protectedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
  },
  protectedSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  userLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  userValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
    backgroundColor: '#ffffff',
    gap: 10,
  },
  methodSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  methodDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderItemTitle: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    marginRight: 10,
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  feeLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  feeVal: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#dc2626',
  },
  submitOrderBtn: {
    marginTop: 8,
  },
});
