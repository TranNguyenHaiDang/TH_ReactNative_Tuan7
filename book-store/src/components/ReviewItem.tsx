import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import { Review } from '../types';
import { confirmAction } from '../utils/alert';

export type ReviewItemProps = {
  review: Review;
  currentUserId?: number;
  onDelete?: (id: number) => void;
};

export default function ReviewItem({ review, currentUserId, onDelete }: ReviewItemProps) {
  const isOwner = !!currentUserId && review.userId === currentUserId;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleConfirmDelete = () => {
    if (!onDelete) return;
    confirmAction(
      'Xoá đánh giá',
      'Bạn có chắc chắn muốn xoá đánh giá này không?',
      () => onDelete(review.id),
      'Xoá',
      'Huỷ'
    );
  };

  const initial = (review.userName || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{review.userName}</Text>
              {isOwner && <Text style={styles.ownerBadge}>Bạn</Text>}
            </View>
            <View style={styles.starsRow}>
              <RatingStars value={review.rating} size={14} />
              <Text style={styles.dateText}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
        </View>

        {isOwner && onDelete && (
          <TouchableOpacity
            onPress={handleConfirmDelete}
            style={styles.deleteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#4338ca',
    fontWeight: '700',
    fontSize: 15,
  },
  nameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1e293b',
  },
  ownerBadge: {
    fontSize: 11,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deleteBtn: {
    padding: 4,
  },
  comment: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
});
