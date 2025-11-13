import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState, useContext } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigators/type';
import { getDB } from '../database/db';
import { UserContext } from '../context/UserContext';
import { getWishlistItems, insertOrUpdateCart } from '../database/cartServices'; // NEW FUNCTION

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function WishlistList() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { user } = useContext(UserContext);
  const userId = user?.id;

  if (!userId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  const loadWishlistItems = useCallback(async () => {
    const items = await getWishlistItems(userId);
    setWishlistItems(items);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadWishlistItems();
    }, [loadWishlistItems]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWishlistItems();
    setRefreshing(false);
  }, [loadWishlistItems]);

  const handleRemoveFromWishlist = async (product: any) => {
    if (!user?.id) return;

    const newWishlistValue = product.wishlist ? 0 : 1;

    await insertOrUpdateCart({
      productId: product.id,
      userId: user.id,
      wishlist: newWishlistValue,
    });
    loadWishlistItems();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>❤️ Your Wishlist</Text>

      <FlatList
        data={wishlistItems}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProductDetail', { product: item })
            }
            activeOpacity={0.9}
            style={styles.cardContainer}
          >
            <View style={styles.card}>
              {/* 🔹 Product Image */}
              <View style={styles.imageWrapper}>
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require('../assets/images/placeholder.png')
                  }
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>

              {/* 🔹 Product Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>

                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                </View>
              </View>

              {/* 🔹 Remove Wishlist */}
              <TouchableOpacity
                onPress={() => handleRemoveFromWishlist(item)}
                style={styles.cartButton}
                activeOpacity={0.8}
              >
                <Text style={styles.cartButtonText}>Remove from Wishlist</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#888', fontSize: 16 }}>
              Your wishlist is empty.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f2f2' },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardContainer: { marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },
  imageWrapper: { borderRadius: 10, overflow: 'hidden' },
  image: { width: '100%', height: 160, backgroundColor: '#eee' },
  infoContainer: { marginTop: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  description: { fontSize: 13, color: '#666', marginVertical: 4 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 16, fontWeight: '700', color: '#007AFF' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E3',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  star: { color: '#FFB300', fontSize: 14, marginRight: 2 },
  rating: { fontSize: 13, color: '#333' },
  cartButton: {
    marginTop: 10,
    backgroundColor: '#E63946',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cartButtonText: { color: '#fff', fontWeight: '600' },
});
