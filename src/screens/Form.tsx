import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import UserRecords from './UserRecords';
import ProfileForm from './ProfileForm';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Form() {
  const Tab = createMaterialTopTabNavigator();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator>
        <Tab.Screen name="Records" component={UserRecords} />
        <Tab.Screen name="ProfileForm" component={ProfileForm} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
