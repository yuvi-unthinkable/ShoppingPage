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
import { UserContext } from '../context/UserContext';
import { Profiletable } from '../database/Logtables';
import { getProfileRecord } from '../database/profileService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Products'>;

const PAGE_SIZE = 7;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UserRecords() {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState<any[]>([]);
  const [extra, setExtra] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const loadProducts = useCallback(
    async (pageNumber = 1) => {
      const offset = (pageNumber - 1) * PAGE_SIZE;

      if (user) {
        const list = await getProfileRecord(user.id);
        console.log('🚀 ~ UserRecords ~ list:', list);

        const allItems = await getProducts(
          debouncedQuery,
          priceRange[0],
          priceRange[1],
          rating,
          0,
          999999,
        );

        if (!user?.id) {
          console.log(' Cannot load products, user undefined');
          return;
        }

        const total = Math.ceil(allItems.length / PAGE_SIZE);
        setProducts(list);
        setTotalPages(total);
        setPage(pageNumber);
      }
    },
    [debouncedQuery, priceRange, rating, user?.id],
  );

  useEffect(() => {
    loadProducts();
  }, []);

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

  const UserCard = ({ user }: { user: any }) => {
    const extra = user.extra ? JSON.parse(user.extra) : {};
    console.log('🚀 ~ UserCard ~ extra:', extra);
    console.log('🚀 ~ UserCard ~ user:', user);

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{user.label || 'User Profile'}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.name || '-'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email || '-'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{user.phone || '-'}</Text>
        </View>

        {extra.address ? (
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{extra.address}</Text>
          </View>
        ) : null}

        {extra.additionalText ? (
          <View style={styles.row}>
            <Text style={styles.label}>About:</Text>
            <Text style={styles.value}>{extra.additionalText}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>Height:</Text>
          <Text style={styles.value}>
            {user.height ? `${user.height} FT` : '-'}
          </Text>
        </View>

        {extra.gender ? (
          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{extra.gender}</Text>
          </View>
        ) : null}

        <View style={styles.rowVertical}>
          <Text style={styles.label}>Interests:</Text>
          <View style={styles.chipContainer}>
            {extra.intrests?.length > 0 ? (
              extra.intrests.map((item, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.value}>None</Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Birth Date:</Text>
          <Text style={styles.value}>
            {extra.dob ? new Date(extra.dob).toDateString() : '-'}
          </Text>
        </View>
      </View>
    );
  };

  console.log('products>>>>>>>>>>', products);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    marginTop: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1A1A1A',
  },

  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  rowVertical: {
    marginBottom: 12,
  },

  label: {
    width: 110,
    fontWeight: '600',
    color: '#444',
  },

  value: {
    flex: 1,
    color: '#222',
    fontWeight: '500',
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },

  chip: {
    backgroundColor: '#E6F0FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  chipText: {
    color: '#1A73E8',
    fontWeight: '600',
    fontSize: 13,
  },
});
