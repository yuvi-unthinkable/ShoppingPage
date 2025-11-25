import React from 'react';
import { View, Text } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { BottomTabs } from '../components/BottomTabs';

export function AppDrawer() {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={BottomTabs} />
    </Drawer.Navigator>
  );
}
