import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDB } from './src/database/db';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import ProductListScreen from './src/screens/ProductListScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartList from './src/screens/CartList';
import { UserProvider } from './src/context/UserContext';
import WishlistList from './src/screens/Wishlist';
import { ListChecks, LogOut, PlusSquareIcon, User } from 'lucide-react-native';
import Profile from './src/screens/Profile';
import UserRecords from './src/screens/UserRecords';
import ProfileForm from './src/screens/ProfileForm';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState({});
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Products'>(
    'Login',
  );

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        setDbReady(true);

        const user = await AsyncStorage.getItem('loggedInUser');
        if (user) {
          setUserDetail(user);
          setInitialRoute('Products');
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        console.error(' Failed to init DB:', e);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Initializing database...</Text>
      </View>
    );
  }

  if (loading || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading app...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={Login} />
          <Stack.Screen name="SignUp" component={Signup} />
          <Stack.Screen
            name="Products"
            component={ProductListScreen}
            options={({ navigation }) => ({
              headerRight: () => (
                <>
                  <PlusSquareIcon
                    size={24}
                    color="red"
                    onPress={() =>
                      navigation.navigate('Profile', { refresh: true } as never)
                    }
                    style={{ marginRight: 12 }}
                  />
                  <ListChecks
                    size={24}
                    color="red"
                    onPress={() => navigation.navigate('ProfileRecords')}
                    style={{ marginRight: 12 }}
                  />
                  <LogOut
                    size={24}
                    color="red"
                    onPress={() => navigation.replace('Login')}
                    style={{ marginRight: 12 }}
                  />
                </>
              ),
            })}
          />
          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Cart" component={CartList} />
          <Stack.Screen name="Wishlist" component={WishlistList} />
          <Stack.Screen name="Profile" component={ProfileForm} />
          <Stack.Screen name="ProfileRecords" component={UserRecords} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
