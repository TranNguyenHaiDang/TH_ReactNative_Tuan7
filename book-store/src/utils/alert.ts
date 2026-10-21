// src/utils/alert.ts
import { Alert, Platform } from 'react-native';

/**
 * Hiển thị thông báo đơn giản hỗ trợ cả Mobile và Web
 */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Hiển thị hộp thoại xác nhận (Confirm) hỗ trợ cả Mobile và Web
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Đồng ý',
  cancelText = 'Huỷ',
  onCancel?: () => void
): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(message ? `${title}\n\n${message}` : title);
      if (ok) {
        onConfirm();
      } else if (onCancel) {
        onCancel();
      }
    } else {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, onPress: onConfirm },
    ]);
  }
}

export default { showAlert, confirmAction };
