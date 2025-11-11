import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigators/type';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth * 0.8; // responsive width

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* --- Product Image --- */}
        <View style={styles.imageWrapper}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={[styles.image, { width: imageSize, height: imageSize }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { width: imageSize, height: imageSize },
              ]}
            >
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
        </View>

        {/* --- Product Info --- */}
        <Text style={styles.title}>{product.name}</Text>

        <View style={styles.divider} />

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  image: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  imagePlaceholder: {
    borderRadius: 12,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    width: '80%',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginTop: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007AFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  star: {
    color: '#FFB300',
    fontSize: 18,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
});
