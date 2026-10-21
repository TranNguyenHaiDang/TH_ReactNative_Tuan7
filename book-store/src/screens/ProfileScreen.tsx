// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, logoutNow } from '../store/authSlice';
import PrimaryButton from '../components/PrimaryButton';
import {
  BASE_URL,
  LAN_IP,
  currentHost,
  updateApiBaseUrl,
} from '../api/client';

import { showAlert } from '../utils/alert';

export default function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  const dispatch = useAppDispatch();
  const { user, expiresAt } = useAppSelector((state) => state.auth);

  const [hostInput, setHostInput] = useState(currentHost);
  const [activeUrl, setActiveUrl] = useState(BASE_URL);

  const handleLogout = () => {
    dispatch(logoutNow());
    dispatch(logout());
    navigation.navigate('Home');
  };

  const handleApplyHost = () => {
    if (!hostInput.trim()) return;
    updateApiBaseUrl(hostInput.trim());
    setActiveUrl(`http://${hostInput.trim()}:3000`);
    showAlert(
      'Đã cập nhật Máy chủ API',
      `Địa chỉ mới: http://${hostInput.trim()}:3000`
    );
  };

  const formatExpiry = (ms: number | null) => {
    if (!ms) return 'Không có';
    return new Date(ms).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? (
        <>
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#2563eb" />
                <Text style={styles.roleBadgeText}>Thành viên đã xác thực</Text>
              </View>
            </View>
          </View>

          {/* Account Details */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeaderTitle}>Thông tin phiên đăng nhập</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã người dùng (ID):</Text>
              <Text style={styles.infoVal}>#{user.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phiên JWT hết hạn lúc:</Text>
              <Text style={styles.infoVal}>{formatExpiry(expiresAt)}</Text>
            </View>
          </View>

          {/* Logout Button */}
          <PrimaryButton
            title="Đăng xuất"
            icon="log-out-outline"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutBtn}
          />
        </>
      ) : (
        <View style={styles.unauthCard}>
          <Ionicons name="person-circle-outline" size={64} color="#94a3b8" />
          <Text style={styles.unauthTitle}>Bạn chưa đăng nhập</Text>
          <Text style={styles.unauthSubtitle}>
            Đăng nhập để theo dõi giỏ hàng, viết bình luận và mua sắm dễ dàng.
          </Text>
          <PrimaryButton
            title="Đăng nhập ngay"
            icon="log-in-outline"
            onPress={() => navigation.navigate('Login', { redirect: 'goBack' })}
            style={{ marginTop: 16, width: '100%' }}
          />
        </View>
      )}

      {/* API Server Configuration helper */}
      <View style={styles.serverCard}>
        <View style={styles.serverHeader}>
          <Ionicons name="server-outline" size={20} color="#2563eb" />
          <Text style={styles.serverTitle}>Cấu hình kết nối JSON Server</Text>
        </View>
        <Text style={styles.serverSubtitle}>
          Hiện tại: <Text style={styles.boldText}>{activeUrl}</Text>
        </Text>

        <View style={styles.hostInputRow}>
          <TextInput
            style={styles.hostInput}
            value={hostInput}
            onChangeText={setHostInput}
            placeholder="IP hoặc localhost"
          />
          <TouchableOpacity style={styles.applyBtn} onPress={handleApplyHost}>
            <Text style={styles.applyBtnText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.presetRow}>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => {
              setHostInput('localhost');
              updateApiBaseUrl('localhost');
              setActiveUrl('http://localhost:3000');
            }}
          >
            <Text style={styles.presetText}>Localhost</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => {
              setHostInput(LAN_IP);
              updateApiBaseUrl(LAN_IP);
              setActiveUrl(`http://${LAN_IP}:3000`);
            }}
          >
            <Text style={styles.presetText}>LAN ({LAN_IP})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => {
              setHostInput('10.0.2.2');
              updateApiBaseUrl('10.0.2.2');
              setActiveUrl('http://10.0.2.2:3000');
            }}
          >
            <Text style={styles.presetText}>Android (10.0.2.2)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleBadgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  logoutBtn: {
    marginBottom: 20,
  },
  unauthCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  unauthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 10,
  },
  unauthSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  serverCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  serverTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  serverSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '600',
    color: '#2563eb',
  },
  hostInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  hostInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  applyBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 12,
    color: '#334155',
  },
});
