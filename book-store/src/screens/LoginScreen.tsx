// src/screens/LoginScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import { clearAuthError, loginUser, registerUser, logout, logoutNow } from '../store/authSlice';
import PrimaryButton from '../components/PrimaryButton';

export default function LoginScreen({ navigation, route }: ScreenProps<'Login'>) {
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);
  const redirect = route.params?.redirect;

  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Inline field errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError('Vui lòng nhập địa chỉ email');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      setEmailError('Email không đúng định dạng (vd: user@example.com)');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Mật khẩu tối thiểu 6 ký tự');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateName = (val: string): boolean => {
    if (!isLoginTab && !val.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      return false;
    }
    setNameError(null);
    return true;
  };

  const validateConfirmPassword = (val: string): boolean => {
    if (!isLoginTab) {
      if (!val) {
        setConfirmPasswordError('Vui lòng xác nhận mật khẩu');
        return false;
      }
      if (val !== password) {
        setConfirmPasswordError('Mật khẩu xác nhận không trùng khớp');
        return false;
      }
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handlePostAuthRedirect = useCallback(() => {
    if (redirect === 'Checkout') {
      navigation.replace('Checkout');
    } else if (redirect === 'goBack' && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [redirect, navigation]);

  // Tự động chuyển hướng ngay nếu tài khoản đã đăng nhập có yêu cầu redirect (ví dụ: Checkout)
  useEffect(() => {
    if (user && redirect) {
      handlePostAuthRedirect();
    }
  }, [user, redirect, handlePostAuthRedirect]);

  const handleSubmit = async () => {
    dispatch(clearAuthError());

    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);
    const isNameValid = isLoginTab ? true : validateName(name);
    const isConfirmValid = isLoginTab ? true : validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPassValid || !isNameValid || !isConfirmValid) {
      return;
    }

    if (isLoginTab) {
      const res = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(res)) {
        handlePostAuthRedirect();
      }
    } else {
      const res = await dispatch(
        registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
        })
      );
      if (registerUser.fulfilled.match(res)) {
        handlePostAuthRedirect();
      }
    }
  };

  const fillTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('123456');
    setEmailError(null);
    setPasswordError(null);
    dispatch(clearAuthError());
  };

  if (user && !redirect) {
    return (
      <View style={styles.alreadyLoggedInContainer}>
        <View style={styles.alreadyLoggedInCard}>
          <View style={styles.alreadyLoggedInAvatar}>
            <Text style={styles.alreadyLoggedInAvatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.alreadyLoggedInTitle}>Bạn đã đăng nhập</Text>
          <Text style={styles.alreadyLoggedInName}>{user.name}</Text>
          <Text style={styles.alreadyLoggedInEmail}>{user.email}</Text>

          <PrimaryButton
            title="Về Trang chủ mua sách"
            icon="home-outline"
            onPress={() => navigation.navigate('Home')}
            style={{ width: '100%', marginTop: 20 }}
          />

          <PrimaryButton
            title="Đến Hồ sơ cá nhân"
            variant="outline"
            icon="person-outline"
            onPress={() => navigation.navigate('Profile')}
            style={{ width: '100%', marginTop: 10 }}
          />

          <PrimaryButton
            title="Đăng xuất"
            variant="danger"
            icon="log-out-outline"
            onPress={() => {
              dispatch(logoutNow());
              dispatch(logout());
              navigation.navigate('Home');
            }}
            style={{ width: '100%', marginTop: 10 }}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="book" size={36} color="#2563eb" />
          </View>
          <Text style={styles.title}>BookStore</Text>
          <Text style={styles.subtitle}>
            {isLoginTab
              ? 'Đăng nhập để mua sách và viết đánh giá'
              : 'Tạo tài khoản mới để trải nghiệm đầy đủ tính năng'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLoginTab && styles.activeTabButton]}
            onPress={() => {
              setIsLoginTab(true);
              dispatch(clearAuthError());
            }}
          >
            <Text style={[styles.tabText, isLoginTab && styles.activeTabText]}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLoginTab && styles.activeTabButton]}
            onPress={() => {
              setIsLoginTab(false);
              dispatch(clearAuthError());
            }}
          >
            <Text style={[styles.tabText, !isLoginTab && styles.activeTabText]}>
              Đăng ký
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server Error Alert */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Form Inputs */}
        <View style={styles.form}>
          {!isLoginTab && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <View style={[styles.inputWrapper, nameError && styles.inputErrorBorder]}>
                <Ionicons name="person-outline" size={20} color="#64748b" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn An"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (nameError) validateName(val);
                  }}
                  autoCapitalize="words"
                />
              </View>
              {nameError ? <Text style={styles.fieldErrorText}>{nameError}</Text> : null}
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailError && styles.inputErrorBorder]}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="test@gmail.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (emailError) validateEmail(val);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={[styles.inputWrapper, passwordError && styles.inputErrorBorder]}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (passwordError) validatePassword(val);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
          </View>

          {/* Confirm Password Field (Register only) */}
          {!isLoginTab && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View
                style={[
                  styles.inputWrapper,
                  confirmPasswordError && styles.inputErrorBorder,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#64748b"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (confirmPasswordError) validateConfirmPassword(val);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
              {confirmPasswordError ? (
                <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>
          )}

          <PrimaryButton
            title={
              loading
                ? 'Đang xử lý...'
                : isLoginTab
                ? 'Đăng nhập'
                : 'Tạo tài khoản'
            }
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
          />
        </View>

        {/* Quick Test Accounts Box */}
        <View style={styles.testAccountBox}>
          <Text style={styles.testAccountTitle}>
            Tài khoản mẫu (mật khẩu mặc định: 123456):
          </Text>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              style={styles.testChip}
              onPress={() => fillTestAccount('test@gmail.com')}
            >
              <Text style={styles.testChipText}>test@gmail.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testChip}
              onPress={() => fillTestAccount('an@gmail.com')}
            >
              <Text style={styles.testChipText}>an@gmail.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testChip}
              onPress={() => fillTestAccount('binh@gmail.com')}
            >
              <Text style={styles.testChipText}>binh@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 18,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#2563eb',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: '#dc2626',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  fieldErrorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtn: {
    marginTop: 8,
  },
  testAccountBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testAccountTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testChipText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  alreadyLoggedInContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  alreadyLoggedInCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  alreadyLoggedInAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alreadyLoggedInAvatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563eb',
  },
  alreadyLoggedInTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  alreadyLoggedInName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  alreadyLoggedInEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
});
