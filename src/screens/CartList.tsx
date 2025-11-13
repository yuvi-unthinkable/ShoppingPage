import {
  Alert,
  Button,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState, useEffect, useContext } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigators/type';

import {
  addQuantity,
  getCartItems,
  insertOrUpdateCart,
  subtractQuantity,
} from '../database/cartServices';
import { UserContext } from '../context/UserContext';
import { buyProduct } from '../database/productService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartList() {
  const [cartItems, setCartItems] = useState<any[]>([]);
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

  const loadCartItems = useCallback(async () => {
    const items = await getCartItems(userId);
    console.log('🚀 ~ CartList ~ items:', items);
    setCartItems(items);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [loadCartItems]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCartItems();
    setRefreshing(false);
  }, [loadCartItems]);

  const handleRemoveFromCart = async (product: any) => {
    if (!user?.id) return;

    const newCartValue = product.cart ? 0 : 1;

    await insertOrUpdateCart({
      productId: product.id,
      userId: user.id,
      cart: newCartValue,
    });
    loadCartItems();
  };

  const handleAddQuantity = async (productId: number) => {
    
    await addQuantity(productId, userId);
    loadCartItems();
  };
  const handleSubtractQuantity = async (productId: number) => {
    await subtractQuantity(productId, userId);
    loadCartItems();
  };

  const handleBuy = async (cartItems: object) => {
    await buyProduct(userId);
    loadCartItems();
    Alert.alert('Sucess', 'All the items ordered');
  };


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛒 Your Cart</Text>

      <FlatList
        data={cartItems}
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
                  <Text style={styles.price}>Price : ₹{item.price}</Text>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                      }}
                    >

                      <Button
                        title="+"
                        color={'grey'}
                        onPress={() => handleAddQuantity(item?.id)}
                        disabled = {item.quantity<item.availableQty ? false : true}
                      />
                      <Text>{item.quantity}</Text>
                      <Button
                        title="-"
                        color={'grey'}
                        onPress={() => handleSubtractQuantity(item?.id)}
                        disabled={item.quantity < 1 && true}
                      />
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.star}>Rating </Text>
                      <Text style={styles.rating}>{item.rating}⭐</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveFromCart(item)}
                  style={[
                    styles.cartButton,
                    { backgroundColor: '#d44141ff' }, // green when added
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cartButtonText}>Remove from Cart</Text>
                </TouchableOpacity>
              </View>

              {/* 🔹 Remove from Cart */}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#888', fontSize: 16 }}>
              Your cart is empty.
            </Text>
          </View>
        }
      />

      <View style={styles.priceCard}>
        <Text style={styles.summaryTitle}>Price Summary</Text>

        {cartItems.map(item => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {item.name} × {item.quantity}
            </Text>
            <Text style={styles.summaryText}>
              ₹{item.price * item.quantity}
            </Text>
          </View>
        ))}

        <View style={styles.separator} />

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>
            ₹
            {cartItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0,
            )}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => handleBuy(cartItems)}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
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
    color: '#FFB300',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  cartButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  priceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 10,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    // marginBottom: 12,
    color: '#222',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },

  summaryText: {
    fontSize: 15,
    color: '#444',
  },

  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  totalText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },

  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },

  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
