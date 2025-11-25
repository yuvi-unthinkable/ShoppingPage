import React, { useCallback, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { getProducts, deleteProduct } from '../database/productService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigators/type';
import { Heart } from 'lucide-react-native';
import {
  getCartDataForUser,
  insertOrUpdateCart,
} from '../database/cartServices';
import { UserContext } from '../context/UserContext';
import { Profiletable } from '../database/Logtables';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Products'>;

const PAGE_SIZE = 7;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProductListScreen() {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  console.log('🚀 ~ ProductListScreen ~ user:', user);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 2000);
    return () => clearTimeout(handler);
  }, [query]);

  const loadProducts = useCallback(
    async (pageNumber = 1) => {
      const offset = (pageNumber - 1) * PAGE_SIZE;

      const list = await getProducts(
        debouncedQuery,
        priceRange[0],
        priceRange[1],
        rating,
        PAGE_SIZE,
        offset,
      );

      const allItems = await getProducts(
        debouncedQuery,
        priceRange[0],
        priceRange[1],
        rating,
        0,
        999999,
      );

      if (!user?.id) {
        console.log('⛔ Cannot load products, user undefined');
        return;
      }

      const cartData = await getCartDataForUser(user.id);

      const mergedList = list.map((p: any) => {
        const match = cartData.find((c: any) => c.productId === p.id);
        return {
          ...p,
          wishlist: match?.wishlist === 1,
          cart: match?.cart === 1,
        };
      });

      const total = Math.ceil(allItems.length / PAGE_SIZE);
      setProducts(mergedList);
      setTotalPages(total);
      setPage(pageNumber);
    },
    [debouncedQuery, priceRange, rating, user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      loadProducts(1);
    }, [loadProducts]),
  );

  useEffect(() => {
    loadProducts(1);
  }, [debouncedQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setQuery('');
    setPriceRange([0, 1000]);
    setRating(0);
    await loadProducts(1);
    setRefreshing(false);
  }, [loadProducts]);

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProduct(id);
          await loadProducts(page);
        },
      },
    ]);
  };

  // ❤️ Wishlist button
  const handleWishlist = async (productId: number) => {
    console.log('hi wishlist');
    const p = products.find(pr => pr.id === productId);
    const newWishlistValue = p.wishlist ? 0 : 1;

    if (!user || !user.id) return;

    await insertOrUpdateCart({
      productId,
      userId: user.id,
      wishlist: newWishlistValue,
    });

    await loadProducts(page);
  };

  // 🛒 Cart button
  const handleAddToCart = async (productId: number) => {
    const p = products.find(pr => pr.id === productId);
    const newCartValue = p.cart ? 0 : 1;

    if (!user || !user.id) return;

    await insertOrUpdateCart({
      productId,
      userId: user.id,
      cart: newCartValue,
    });

    await loadProducts(); // this reloads updated global qty
  };

  const toggleSection = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(prev => !prev);
  };

  const PaginationControls = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.pageButton, page === 1 && styles.disabledButton]}
        disabled={page === 1}
        onPress={() => loadProducts(page - 1)}
      >
        <Text style={styles.pageButtonText}>Prev</Text>
      </TouchableOpacity>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
        <TouchableOpacity
          key={num}
          onPress={() => loadProducts(num)}
          style={[styles.pageNumber, num === page && styles.activePage]}
        >
          <Text
            style={num === page ? styles.activePageText : styles.pageNumberText}
          >
            {num}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.pageButton,
          page === totalPages && styles.disabledButton,
        ]}
        disabled={page === totalPages}
        onPress={() => loadProducts(page + 1)}
      >
        <Text style={styles.pageButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  console.log('products>>>>>>>>>>', products);

  return (
    <View style={styles.container}>
      

      <TextInput
        placeholder="Search products (name, description, price)..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        style={styles.searchBox}
      />

      <TouchableOpacity
        style={styles.filterHeader}
        onPress={() => toggleSection(setShowPriceSlider)}
        activeOpacity={0.8}
      >
        <Text style={styles.filterHeaderText}>🔍 Filters</Text>
        <Text style={styles.dropdownIcon}>{showPriceSlider ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showPriceSlider && (
        <View style={styles.filterCard}>
          {/* Price Filter */}
          <Text style={styles.filterTitle}>💰 Price Range</Text>
          <Text style={styles.filterSubText}>
            ₹{priceRange[0]} – ₹{priceRange[1]}
          </Text>
          <MultiSlider
            values={priceRange}
            min={0}
            max={1000}
            step={10}
            onValuesChange={vals => setPriceRange(vals as [number, number])}
            sliderLength={280}
            selectedStyle={{ backgroundColor: '#007AFF' }}
            unselectedStyle={{ backgroundColor: '#ddd' }}
            markerStyle={{
              height: 24,
              width: 24,
              backgroundColor: '#007AFF',
            }}
            pressedMarkerStyle={{ backgroundColor: '#005BBB' }}
          />

          {/* Rating Filter */}
          <Text style={[styles.filterTitle, { marginTop: 20 }]}>
            ⭐ Minimum Rating
          </Text>
          <Text style={styles.filterSubText}>{rating} ★ & above</Text>
          <MultiSlider
            values={[rating]}
            min={0}
            max={5}
            step={1}
            onValuesChange={([val]) => setRating(val)}
            sliderLength={280}
            selectedStyle={{ backgroundColor: '#007AFF' }}
            unselectedStyle={{ backgroundColor: '#ddd' }}
            markerStyle={{
              height: 24,
              width: 24,
              backgroundColor: '#007AFF',
            }}
            pressedMarkerStyle={{ backgroundColor: '#005BBB' }}
          />

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setShowPriceSlider(false);
              loadProducts(1);
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.applyFilterText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={products}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          if (item.availableQty <= 0) return null;

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ProductDetail', { product: item })
              }
              onLongPress={() => handleDelete(item.id, item.name)}
              activeOpacity={0.9}
              style={styles.cardContainer}
            >
              <View style={styles.card}>
                {/* 🔹 Product Image with Heart Button */}
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

                  <TouchableOpacity
                    onPress={() => handleWishlist(item.id)}
                    style={styles.likeButton}
                    activeOpacity={0.7}
                  >
                    <Heart
                      size={22}
                      color={item.wishlist ? '#E63946' : '#555'}
                      fill={item.wishlist ? '#E63946' : 'none'}
                    />
                  </TouchableOpacity>
                </View>

                <View>
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
                        <Text style={styles.price}>
                          Qty : {item.availableQty}
                        </Text>
                        <View style={styles.ratingBadge}>
                          <Text style={styles.star}>Rating </Text>
                          <Text style={styles.rating}>{item.rating}⭐</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* 🔹 Add to Cart Button */}
                  <TouchableOpacity
                    onPress={() => handleAddToCart(item.id)}
                    style={[
                      styles.cartButton,
                      { backgroundColor: item.cart ? '#4CAF50' : '#007AFF' }, // green when added
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cartButtonText}>
                      {item.cart ? 'Added to Cart' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#888', fontSize: 16 }}>
              No products found.
            </Text>
          </View>
        }
        ListFooterComponent={<PaginationControls />}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddProduct' as never)}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 4,
  },
  dropdownLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  dropdownIcon: { fontSize: 18, color: '#007AFF' },
  sliderContainer: { alignItems: 'center', marginVertical: 10 },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  filterHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  filterCard: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  filterSubText: {
    color: '#666',
    fontSize: 13,
    marginBottom: 10,
  },
  applyFilterButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  applyFilterText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  filterLabel: { fontWeight: '600', marginBottom: 6 },
  filterButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButtonText: { color: '#fff', fontWeight: '600' },
  pageNumber: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  pageNumberText: { color: '#007AFF', fontWeight: '500' },

  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#f2f2f2',
  },
  // Top Buttons
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: 4,
  },

  topButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,

    // Shadow (iOS + Android)
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  topButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  searchBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },

  cardContainer: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 6,
    gap: 20,
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
    marginLeft: 10,
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

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 32, fontWeight: '600' },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 14,
    flexWrap: 'wrap',
  },
  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  pageButtonText: { color: '#007AFF', fontWeight: '600' },
  activePage: { backgroundColor: '#007AFF', borderRadius: 6 },
  activePageText: { color: '#fff', fontWeight: '700' },
  disabledButton: { opacity: 0.4 },
});
