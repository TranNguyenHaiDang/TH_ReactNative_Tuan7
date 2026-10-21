// src/navigation/RootNavigator.tsx
import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HeaderRight from '../components/HeaderRight';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: '#0f172a',
        },
        headerTintColor: '#2563eb',
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'BookStore',
          headerRight: () => <HeaderRight />,
        }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{
          title: 'Chi tiết sách',
          headerRight: () => <HeaderRight />,
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Giỏ hàng',
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: 'Thanh toán',
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Tài khoản',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Hồ sơ cá nhân',
        }}
      />
    </Stack.Navigator>
  );
}
