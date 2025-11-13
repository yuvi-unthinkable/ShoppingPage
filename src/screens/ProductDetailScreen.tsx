import React, { useContext, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigators/type';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { insertOrUpdateCart } from '../database/cartServices';
import { UserContext } from '../context/UserContext';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductDetail'
>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
  const { user } = useContext(UserContext);
  const [prod, setProd] = useState(product);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth * 0.85;

  // ❤️ Wishlist button
  const handleWishlist = async () => {
    if (!user?.id) return;

    const newWishlistValue = prod.wishlist ? 0 : 1;

    await insertOrUpdateCart({
      productId: prod.id,
      userId: user.id,
      wishlist: newWishlistValue,
    });

    setProd({ ...prod, wishlist: newWishlistValue });
  };

  // 🛒 Cart button
  const handleAddToCart = async () => {
    if (!user?.id) return;

    const newCartValue = prod.cart ? 0 : 1;

    await insertOrUpdateCart({
      productId: prod.id,
      userId: user.id,
      cart: newCartValue,
    });

    setProd({ ...prod, cart: newCartValue });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* 🔹 Product Image Section */}
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

          {/* ❤️ Wishlist Button */}
          <TouchableOpacity
            onPress={handleWishlist}
            style={styles.likeButton}
            activeOpacity={0.7}
          >
            <Heart
              size={22}
              color={prod.wishlist ? '#E63946' : '#555'}
              fill={prod.wishlist ? '#E63946' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* 🔹 Product Info */}
        <Text style={styles.title}>{product.name}</Text>

        <View style={styles.divider} />

        <Text style={styles.description}>{product.description}</Text>

        {/* 🔹 Price & Rating */}
        <View style={styles.infoRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>

        {/* 🔹 Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={handleWishlist}
            style={[styles.actionButton, styles.wishlist]}
          >
            <Text style={styles.actionText}>
              {prod.wishlist ? 'Wishlisted ❤️' : 'Add to Wishlist'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAddToCart}
            style={[styles.actionButton, styles.cart]}
          >
            <Text style={styles.actionText}>
              {prod.cart ? 'Added ✔️' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔹 Product Details Section */}
        <View style={styles.detailsBox}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <Text style={styles.detailText}>
               Quantity : {product.availableQty}{'\n'}
            📦 Category: Electronics{'\n'}
            🏷️ Brand: Generic{'\n'}
            🔖 Model: {product.name}
            {'\n'}⭐ Rated: {product.rating}/5
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F2F2F2',
    paddingVertical: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  imagePlaceholder: {
    borderRadius: 16,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
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
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
  price: {
    fontSize: 26,
    fontWeight: '700',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
  },
  wishlist: {
    backgroundColor: '#FFB6C1',
  },
  cart: {
    backgroundColor: '#007AFF',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  detailsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginTop: 24,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});
