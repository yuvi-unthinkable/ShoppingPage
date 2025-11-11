import React, { useCallback, useState, useEffect } from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Products'>;

const PAGE_SIZE = 7;

// Enable animation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProductListScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const [showRatingSlider, setShowRatingSlider] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  // 🕓 Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 800);
    return () => clearTimeout(handler);
  }, [query]);

  // 🔁 Load products (filters + pagination)
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
        9999999,
        0,
      );

      const total = Math.ceil(allItems.length / PAGE_SIZE);
      setProducts(list);
      setTotalPages(total);
      setPage(pageNumber);
    },
    [debouncedQuery, priceRange, rating],
  );

  // 🧭 Reload when focused or filters change
  useFocusEffect(
    useCallback(() => {
      loadProducts(1);
    }, [loadProducts]),
  );

  useEffect(() => {
    loadProducts(1);
  }, [debouncedQuery]);

  // 🔄 Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setQuery('');
    setPriceRange([0, 1000]);
    setRating(0);
    await loadProducts(1);
    setRefreshing(false);
  }, [loadProducts]);

  // 🗑️ Delete product
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

  // 🔽 Toggle section animation
  const toggleSection = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(prev => !prev);
  };

  // 🔢 Pagination controls
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

  return (
    <View style={styles.container}>
      {/* 🔍 Search Bar */}
      <TextInput
        placeholder="Search products (name, description, price)..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        style={styles.searchBox}
      />

      {/* 🔽 Filter Dropdown (Combined) */}
      <TouchableOpacity
        style={styles.filterHeader}
        onPress={() => toggleSection(setShowPriceSlider)} // we'll reuse one toggle
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

          {/* Apply Filter Button */}
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

      {/* Apply Filters */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => {
          // Close both sliders first with animation
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShowPriceSlider(false);
          setShowRatingSlider(false);

          // Then apply filters
          loadProducts(1);
        }}
      >
        <Text style={styles.filterButtonText}>Apply Filters</Text>
      </TouchableOpacity>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        numColumns={2} // ✅ two-column grid
        columnWrapperStyle={{ justifyContent: 'space-between' }}
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
            onLongPress={() => handleDelete(item.id, item.name)}
            activeOpacity={0.9}
            style={styles.cardContainer}
          >
            <View style={styles.card}>
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require('../assets/images/placeholder.png')
                }
                style={styles.image}
                resizeMode="cover"
              />

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
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#888', fontSize: 16 }}>
              No products found.
            </Text>
          </View>
        }
        ListFooterComponent={<PaginationControls />}
      />

      {/* ➕ Floating Add Button */}
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
  // ✅ Combined Filter Dropdown Styles
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
    backgroundColor: '#f2f2f2', // ✅ light app background
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

  // ✅ Grid item container
  cardContainer: {
    flex: 1,
    marginBottom: 14,
    marginHorizontal: 4,
  },

  // ✅ Product card style
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E3',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  star: { color: '#FFB300', fontSize: 14, marginRight: 2 },
  rating: { fontSize: 13, color: '#333', fontWeight: '500' },

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
