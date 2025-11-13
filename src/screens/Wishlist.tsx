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
                  <Text style={styles.price}>PRICE : ₹{item.price}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.star}>RATING :</Text>
                    <Text style={styles.rating}>{item.rating}⭐</Text>
                  </View>
                </View>
              <TouchableOpacity
                onPress={() => handleRemoveFromWishlist(item)}
                style={styles.cartButton}
                activeOpacity={0.8}
              >
                <Text style={styles.cartButtonText}>Remove from Wishlist</Text>
              </TouchableOpacity>
              </View>

              {/* 🔹 Remove Wishlist */}
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
  cardContainer: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 6,
    gap: 20,
    justifyContent: 'center',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },

  imageWrapper: {
    flex: 1,
    borderColor: 'transparent',
    borderWidth: 2,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    maxWidth: 150,
  },

  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
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

  infoContainer: {
    flex: 2,
    marginTop: 10,
    justifyContent: 'flex-start',
    marginLeft: 20,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },

  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },

  priceRow: {
    marginTop: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6e6e6ee3',
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#FFF4E3',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  star: {
    // color: '#FFB300',
    fontSize: 14,
    marginRight: 2,
  },

  rating: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  cartButton: {
    marginTop: 10,
    backgroundColor: '#a72630ff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  cartButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
