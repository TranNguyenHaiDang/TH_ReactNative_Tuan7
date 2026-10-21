// src/api/client.ts
import axios from 'axios';
import { Platform } from 'react-native';

// ===== Địa chỉ json-server =====
// - Điện thoại thật (Expo Go): IP LAN của máy tính chạy json-server, cùng Wi-Fi: 192.168.1.51
// - Android Emulator: 10.0.2.2
// - iOS Simulator / Web: localhost
export const LAN_IP = '192.168.1.90'; // IP LAN máy tính
export const PORT = 3000;
export const USE_REAL_DEVICE = false; // Đặt true khi test trên điện thoại thật (Expo Go)

// Mặc định hỗ trợ cả Web/Emulator và có thể chuyển sang LAN IP cho thiết bị thật
export let currentHost = USE_REAL_DEVICE
  ? LAN_IP
  : Platform.OS === 'web'
  ? 'localhost'
  : Platform.OS === 'android'
  ? '10.0.2.2'
  : 'localhost';

export const BASE_URL = `http://${currentHost}:${PORT}`;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Cho phép cập nhật BASE_URL linh hoạt (hỗ trợ đổi IP trong app nếu cần)
export const updateApiBaseUrl = (host: string, port = PORT) => {
  currentHost = host;
  api.defaults.baseURL = `http://${host}:${port}`;
};

// Gắn token vào mọi request. json-server-auth đọc header này để phân quyền
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Lấy thông báo lỗi từ json-server-auth (server trả về chuỗi, vd "Incorrect password")
export const getServerMessage = (err: any): string | undefined => {
  if (typeof err?.response?.data === 'string') {
    return err.response.data;
  }
  if (typeof err?.response?.data?.message === 'string') {
    return err.response.data.message;
  }
  return undefined;
};
