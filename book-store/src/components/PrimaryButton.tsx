// src/components/PrimaryButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function PrimaryButton({
  title,
  onPress,
  variant = 'solid',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: PrimaryButtonProps) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  const containerStyles = [
    styles.button,
    isOutline && styles.outlineButton,
    isDanger && styles.dangerButton,
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    isOutline && styles.outlineText,
    isDanger && styles.dangerText,
    disabled && styles.disabledText,
    textStyle,
  ];

  const iconColor = isOutline ? '#2563eb' : isDanger ? '#ffffff' : '#ffffff';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={containerStyles}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isOutline ? '#2563eb' : '#ffffff'} />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={iconColor}
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2563eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  disabledButton: {
    opacity: 0.55,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineText: {
    color: '#2563eb',
  },
  dangerText: {
    color: '#ffffff',
  },
  disabledText: {
    opacity: 0.8,
  },
});
