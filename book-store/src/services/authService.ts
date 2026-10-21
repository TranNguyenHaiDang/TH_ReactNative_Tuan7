// src/services/authService.ts
import { api, getServerMessage } from '../api/client';
import { User } from '../types';

export type AuthResult = {
  token: string;
  user: User;
  expiresAt: number; // mốc thời gian (ms) token hết hạn, đọc từ JWT
};

type AuthResponse = {
  accessToken: string;
  user: User & { password?: string };
};

// Hàm giải mã base64url an toàn cho mọi môi trường (Web, iOS, Android, Hermes)
function decodeBase64(input: string): string {
  try {
    if (typeof atob === 'function') {
      return atob(input);
    }
  } catch {}

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  for (
    let bc = 0, bs = 0, buffer: any, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

// JWT gồm 3 phần header.payload.signature; payload là JSON mã hoá base64url,
// trong đó "exp" là thời điểm hết hạn (tính bằng GIÂY)
export function getJwtExpiry(token: string): number {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return Date.now() + 60 * 60 * 1000;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeBase64(base64);
    const payload = JSON.parse(decoded);
    if (payload.exp) {
      return payload.exp * 1000;
    }
    return Date.now() + 60 * 60 * 1000;
  } catch {
    return Date.now() + 60 * 60 * 1000; // không đọc được → coi như 1 giờ
  }
}

// Không bao giờ giữ mật khẩu (dù đã băm) trong app
export const toPublicUser = ({ password, ...user }: User & { password?: string }): User => user;

const toResult = (data: AuthResponse): AuthResult => ({
  token: data.accessToken,
  user: toPublicUser(data.user),
  expiresAt: getJwtExpiry(data.accessToken),
});

// Đổi thông báo tiếng Anh của json-server-auth sang tiếng Việt
const MESSAGES: Record<string, string> = {
  'Cannot find user': 'Email hoặc mật khẩu không đúng',
  'Incorrect password': 'Email hoặc mật khẩu không đúng',
  'Email already exists': 'Email đã được sử dụng',
  'Email format is invalid': 'Email không đúng định dạng',
  'Password is too short': 'Mật khẩu quá ngắn',
};

const toAppError = (err: unknown): Error => {
  const msg = getServerMessage(err);
  if (msg) return new Error(MESSAGES[msg] ?? msg);
  return new Error('Không kết nối được máy chủ. Kiểm tra json-server và địa chỉ IP');
};

async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const res = await api.post<AuthResponse>('/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    return toResult(res.data);
  } catch (err) {
    throw toAppError(err);
  }
}

async function register(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    const res = await api.post<AuthResponse>('/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return toResult(res.data);
  } catch (err) {
    throw toAppError(err);
  }
}

// Xác minh token khi auto-login: route /users là 600 → chỉ chủ tài khoản đọc được.
// Token sai/hết hạn → 401, token của người khác → 403
async function getMe(userId: number): Promise<User> {
  const res = await api.get<User & { password?: string }>(`/users/${userId}`);
  return toPublicUser(res.data);
}

export default { login, register, getMe, getJwtExpiry, toPublicUser };
