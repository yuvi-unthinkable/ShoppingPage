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
import { useNavigation } from '@react-navigation/native';
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
        if (list) {
          setProducts(list);
        }

        if (!user?.id) {
          console.log(' Cannot load products, user undefined');
          return;
        }
      }
    },
    [debouncedQuery, priceRange, rating, user?.id],
  );

  useEffect(() => {
    loadProducts();
  }, []);

  // const onRefresh = useCallback(async () => {
  //   setRefreshing(true);
  //   setQuery('');
  //   setPriceRange([0, 1000]);
  //   setRating(0);
  //   await loadProducts(1);
  //   setRefreshing(false);
  // }, [loadProducts]);

  // const handleDelete = (id: number, name: string) => {
  //   Alert.alert('Delete Product', `Delete "${name}"?`, [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Delete',
  //       style: 'destructive',
  //       onPress: async () => {
  //         await deleteProduct(id);
  //         await loadProducts(page);
  //       },
  //     },
  //   ]);
  // };

  // const toggleSection = (
  //   setter: React.Dispatch<React.SetStateAction<boolean>>,
  // ) => {
  //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  //   setter(prev => !prev);
  // };

  // const PaginationControls = () => (
  //   <View style={styles.paginationContainer}>
  //     <TouchableOpacity
  //       style={[styles.pageButton, page === 1 && styles.disabledButton]}
  //       disabled={page === 1}
  //       onPress={() => loadProducts(page - 1)}
  //     >
  //       <Text style={styles.pageButtonText}>Prev</Text>
  //     </TouchableOpacity>

  //     {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
  //       <TouchableOpacity
  //         key={num}
  //         onPress={() => loadProducts(num)}
  //         style={[styles.pageNumber, num === page && styles.activePage]}
  //       >
  //         <Text
  //           style={num === page ? styles.activePageText : styles.pageNumberText}
  //         >
  //           {num}
  //         </Text>
  //       </TouchableOpacity>
  //     ))}

  //     <TouchableOpacity
  //       style={[
  //         styles.pageButton,
  //         page === totalPages && styles.disabledButton,
  //       ]}
  //       disabled={page === totalPages}
  //       onPress={() => loadProducts(page + 1)}
  //     >
  //       <Text style={styles.pageButtonText}>Next</Text>
  //     </TouchableOpacity>
  //   </View>
  // );

  const UserCard = ({ user }) => {
    const userData = user.userData ? JSON.parse(user.userData) : {};
    console.log('userData:', userData);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => navigation.navigate('FormScreen', { id: user.id })}
        >
          {/* DYNAMIC FIELDS */}
          {Object.entries(userData).map(([key, value]) => {
            return (
              <View key={key} style={styles.row}>
                <Text style={styles.label}>{key}:</Text>

                {/* Array case — Interests */}
                {Array.isArray(value) ? (
                  <Text style={[styles.value]}>{value.join(', ')}</Text>
                ) : // Date case
                key.toLowerCase() === 'dob' ? (
                  <Text style={styles.value}>
                    {new Date(value).toDateString()}
                  </Text>
                ) : (
                  <Text style={styles.value}>{value || '-'}</Text>
                )}
              </View>
            );
          })}
        </TouchableOpacity>
      </View>
    );
  };

  // console.log('products>>>>>>>>>>', products);
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
