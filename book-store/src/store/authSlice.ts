// src/store/authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/client';
import authService, { AuthResult } from '../services/authService';
import { User } from '../types';

export const AUTH_STORAGE_KEY = '@bookstore_auth';

export type AuthState = {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  expiresAt: null,
  loading: false,
  error: null,
  isInitialized: false,
};

// Auto-login: đọc AsyncStorage khi mở app
export const restoreSession = createAsyncThunk<AuthResult | null>(
  'auth/restore',
  async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;

      const saved: AuthResult = JSON.parse(raw);
      const isValid = !!saved.token && !!saved.user?.id && saved.expiresAt > Date.now();

      if (!isValid) {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY); // token hết hạn → xoá
        setAuthToken(null);
        return null;
      }

      setAuthToken(saved.token);

      // Xác minh token với server: GET /users/:id (route 600, cần token hợp lệ)
      try {
        const user = await authService.getMe(saved.user.id);
        const updated = { ...saved, user };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      } catch (err: any) {
        // 401: token sai/hết hạn · 403: không phải chủ tài khoản · 404: user đã bị xoá
        if ([401, 403, 404].includes(err?.response?.status)) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          setAuthToken(null);
          return null;
        }
        return saved; // mất mạng: vẫn cho vào bằng dữ liệu đã lưu
      }
    } catch {
      return null; // dữ liệu hỏng (JSON lỗi) → coi như chưa đăng nhập
    }
  }
);

export const loginUser = createAsyncThunk<
  AuthResult,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const result = await authService.login(email, password);
    setAuthToken(result.token);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
    return result;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Đăng nhập không thành công');
  }
});

export const registerUser = createAsyncThunk<
  AuthResult,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const result = await authService.register(name, email, password);
    setAuthToken(result.token);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
    return result;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Đăng ký không thành công');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } finally {
    setAuthToken(null);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logoutNow: (state) => {
      state.user = null;
      state.token = null;
      state.expiresAt = null;
      state.error = null;
      setAuthToken(null);
      AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
    },
  },
  extraReducers: (builder) => {
    // Restore session
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.expiresAt = action.payload.expiresAt;
        } else {
          state.user = null;
          state.token = null;
          state.expiresAt = null;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.expiresAt = null;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.expiresAt = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đăng nhập thất bại';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.expiresAt = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đăng ký thất bại';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.user = null;
        state.token = null;
        state.expiresAt = null;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.expiresAt = null;
        state.error = null;
      });
  },
});

export const { clearAuthError, logoutNow } = authSlice.actions;
export default authSlice.reducer;
