import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ProductListScreen from './ProductListScreen';
import CartList from './CartList';
import WishlistList from './Wishlist';
import AddProductScreen from './AddProductScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

export default function ShopTabs() {
  return (
    <SafeAreaView style={{flex:1}}>

    <Tab.Navigator screenOptions={{swipeEnabled:false}}>
      <Tab.Screen name="Home" component={ProductListScreen} />
      <Tab.Screen name="Cart" component={CartList} />
      <Tab.Screen name="WishList" component={WishlistList} />
      <Tab.Screen name="Add" component={AddProductScreen} />
    </Tab.Navigator>
    </SafeAreaView>
  );
}
