import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './src/store';
import { restoreSession } from './src/store/authSlice';
import RootNavigator from './src/navigation/RootNavigator';

// Ẩn thanh cuộn desktop thô cứng trên Web/MobileView để giao diện chuẩn mobile
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'mobile-scroll-fix';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      ::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
      }
      * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

function AppContent() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  // Auto-login: Khi mở app, kiểm tra AsyncStorage có token hợp lệ
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.splashText}>Đang khởi động BookStore...</Text>
      </View>
    );
  }

  return (
    <View style={styles.rootWrapper}>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    // Đẩy toàn bộ giao diện xuống 40px tránh tai thỏ (notch) của khung MobileView/Web
    paddingTop: Platform.OS === 'web' ? 40 : 0,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  splashText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
});
