// src/components/RatingStars.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type RatingStarsProps = {
  value: number; // 0..5
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  color?: string;
  emptyColor?: string;
};

export default function RatingStars({
  value = 0,
  size = 20,
  interactive = false,
  onChange,
  color = '#f59e0b',
  emptyColor = '#d1d5db',
}: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];

  const renderStar = (starIndex: number) => {
    let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';
    let iconColor = emptyColor;

    if (value >= starIndex) {
      iconName = 'star';
      iconColor = color;
    } else if (value >= starIndex - 0.5) {
      iconName = 'star-half';
      iconColor = color;
    }

    if (interactive && onChange) {
      return (
        <TouchableOpacity
          key={starIndex}
          activeOpacity={0.7}
          onPress={() => onChange(starIndex)}
          style={styles.starTouch}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons name={iconName} size={size} color={iconColor} />
        </TouchableOpacity>
      );
    }

    return (
      <View key={starIndex} style={styles.starWrap}>
        <Ionicons name={iconName} size={size} color={iconColor} />
      </View>
    );
  };

  return <View style={styles.container}>{stars.map(renderStar)}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starTouch: {
    paddingHorizontal: 2,
  },
  starWrap: {
    paddingHorizontal: 1,
  },
});
