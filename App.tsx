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
import UserRecords from './src/screens/UserRecords';
import ProfileForm from './src/screens/ProfileForm';
import FormScreen from './src/screens/FormScreen';
import { BottomTabs } from './src/components/BottomTabs';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AppDrawer } from './src/screens/AppDrawer';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState({});
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        setDbReady(true);

        const user = await AsyncStorage.getItem('loggedInUser');
        if (user) {
          setUserDetail(user);
          setInitialRoute('Home');
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
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={'AppDrawer'}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={Signup} />
            <Stack.Screen
              name="Products"
              component={ProductListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
            />
            <Stack.Screen name="Cart" component={CartList} />
            <Stack.Screen name="Wishlist" component={WishlistList} />
            <Stack.Screen name="ProfileForm" component={ProfileForm} />
            <Stack.Screen name="ProfileRecords" component={UserRecords} />
            <Stack.Screen name="FormScreen" component={FormScreen} />
            <Stack.Screen name="AppDrawer" component={AppDrawer} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
