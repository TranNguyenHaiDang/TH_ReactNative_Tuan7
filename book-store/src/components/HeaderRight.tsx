import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, logoutNow } from '../store/authSlice';
import { RootStackParamList } from '../navigation/types';

export default function HeaderRight() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cartItems = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.auth.user);

  const totalQuantity = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleQuickLogout = () => {
    dispatch(logoutNow());
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.7}
      >
        <Ionicons name="cart-outline" size={24} color="#1e293b" />
        {totalQuantity > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {totalQuantity > 99 ? '99+' : totalQuantity}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {user ? (
        <View style={styles.userSection}>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleQuickLogout}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Login', { redirect: 'goBack' })}
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle-outline" size={26} color="#475569" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  btn: {
    padding: 6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBtn: {
    padding: 2,
  },
  logoutBtn: {
    padding: 4,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
});
