import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { ComponentType } from 'react';
import WishlistList from '../screens/Wishlist';

import {
  ShoppingBasket,
  ShoppingBag,
  Heart,
  Book,
  Speaker,
  Megaphone
} from 'lucide-react-native';
import ShopTabs from '../screens/ProductScreen';
import Form from '../screens/Form';
import Upcoming from '../screens/Upcoming';

export const BottomTabs = () => {
  const Bottom = createBottomTabNavigator();

  return (
    <Bottom.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,

        tabBarIcon: ({ focused, color }) => {
          let IconComponent: ComponentType<{ size?: number; color?: string }>;

          if (route.name === 'Product') {
            IconComponent = focused ? ShoppingBasket : ShoppingBag;
          } else if (route.name === 'Records') {
            IconComponent = Book; 
          } else if (route.name === 'Upcoming') {
            IconComponent =  Megaphone;
          } else {
            IconComponent = ShoppingBag; 
          }

          return <IconComponent size={22} color={color} />;
        },

        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Bottom.Screen name="Product" component={ShopTabs} />
      <Bottom.Screen name="Records" component={Form} />
      <Bottom.Screen name="Upcoming" component={Upcoming} />
    </Bottom.Navigator>
  );
};
