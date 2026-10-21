// src/components/ReviewForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RatingStars from './RatingStars';
import PrimaryButton from './PrimaryButton';
import { showAlert } from '../utils/alert';

export type ReviewFormProps = {
  onSubmit: (rating: number, comment: string) => Promise<void>;
};

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await onSubmit(rating, comment.trim());
      setComment('');
      setRating(5);
      showAlert('Thành công', 'Đánh giá của bạn đã được gửi thành công!');
    } catch (err: any) {
      setError(err?.message || 'Gửi đánh giá không thành công');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viết đánh giá của bạn</Text>

      <View style={styles.ratingRow}>
        <Text style={styles.label}>Đánh giá chất lượng:</Text>
        <RatingStars
          value={rating}
          size={28}
          interactive={true}
          onChange={(newVal) => {
            setRating(newVal);
            if (error) setError(null);
          }}
        />
        <Text style={styles.ratingValueText}>{rating}/5 sao</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
        placeholderTextColor="#94a3b8"
        multiline
        numberOfLines={3}
        value={comment}
        onChangeText={(text) => {
          setComment(text);
          if (error) setError(null);
        }}
        editable={!submitting}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton
        title={submitting ? 'Đang gửi đánh giá...' : 'Gửi đánh giá'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
        icon="send-outline"
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  ratingValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 10,
  },
  submitBtn: {
    marginTop: 4,
  },
});
