// src/components/RelatedBooks.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Book } from '../types';

export type RelatedBooksProps = {
  books: Book[];
  onPressBook: (id: number) => void;
};

export default function RelatedBooks({ books, onPressBook }: RelatedBooksProps) {
  if (!books || books.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Sách cùng thể loại</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onPressBook(item.id)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.cover}
              resizeMode="cover"
            />
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {item.author}
            </Text>
            <Text style={styles.price}>
              {item.price.toLocaleString('vi-VN')} đ
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  listContent: {
    paddingRight: 16,
    gap: 12,
  },
  card: {
    width: 130,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cover: {
    width: '100%',
    height: 160,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
    lineHeight: 17,
  },
  author: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 'auto',
  },
});
