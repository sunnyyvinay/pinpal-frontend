import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import Map from '../screens/Map';
import Journal from '../screens/Journal';
import AddPinModal from '../screens/AddPinOptions';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Map';
const AddPinComponent = () => {
  // A null component is needed because bottom tab screen requires a component as a prop
  return null;
};

function NavBar({ route, navigation }: any): React.JSX.Element {
  const user_id  = AsyncStorage.getItem("user_id");

  return (
    <Tab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      screenOptions={{tabBarLabelStyle: {paddingBottom: 5}, tabBarActiveTintColor: Colors.darkOrange, tabBarInactiveTintColor: Colors.lightGray}}>
      <Tab.Screen
        name="Map"
        component={Map}
        options={{
            tabBarIcon: ({ color, size }) => (
                <Icon name="compass" color={color} size={size} />
            ),
            headerLeft: () => <Image source={require('../../assets/images/add-friends-icon.png')} style={styles.addFriendsButton}/>,
            headerTitle: () => <Image source={require('../../assets/images/full-logo.png')} style={styles.headerTitle}/>,
            headerRight: () => <Icon name="settings-outline" size={30} style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}/>
        }}
      />
      <Tab.Screen
        name="AddPin"
        component={AddPinComponent}
        options={{
          tabBarButton: () => <AddPinModal />,
        }}
      />
      <Tab.Screen
        name="Journal"
        component={Journal}
        options={{
            tabBarIcon: ({ color, size }) => (
                <Icon name="journal" color={color} size={size} />
            ),
            headerLeft: () => <Image source={require('../../assets/images/add-friends-icon.png')} style={styles.addFriendsButton}/>,
            headerTitle: "My Journal",
            headerRight: () => <Icon name="settings-outline" size={30} style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}/>
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  addFriendsButton: {
    flex: 1,
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginLeft: 10
  },
  headerTitle: {
    flex: 1,
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  settingsButton: {
    marginRight: 10
  }
});

export default NavBar;
