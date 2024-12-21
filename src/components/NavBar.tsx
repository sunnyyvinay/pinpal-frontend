import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import Map from '../screens/Map';
import Journal from '../screens/Journal';
import AddPinModal from '../screens/AddPinOptions';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextProvider } from '../AppContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const Tab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Map';
const AddPinComponent = () => {
  // A null component is needed because bottom tab screen requires a component as a prop
  return null;
};

function NavBar({ route, navigation }: any): React.JSX.Element {
  const user_id  = AsyncStorage.getItem("user_id");
  if (!user_id) navigation.navigate("Welcome");

  const addFriendsIcon = () => {
    return (
      <TouchableOpacity onPress={() => navigation.navigate("Add Friends")}> 
        <Image source={require('../../assets/images/add-friends-icon.png')} style={styles.addFriendsButton}/> 
      </TouchableOpacity>
    )
  }

  return (
    <ContextProvider>
    <Tab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      screenOptions={{tabBarLabelStyle: {paddingBottom: hp('0.5%')}, tabBarActiveTintColor: Colors.darkOrange, tabBarInactiveTintColor: Colors.mediumGray}}>
      <Tab.Screen
        name="Map"
        component={Map}
        options={{
            tabBarIcon: ({ color, size }) => (
                <Icon name="compass" color={color} size={size} />
            ),
            headerLeft: () => (addFriendsIcon()),
            headerTitle: () => <Image source={require('../../assets/images/full-logo.png')} style={styles.headerTitle}/>,
            headerRight: () => <Icon name="settings-outline" size={wp('8%')} style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}/>
        }}
      />
      <Tab.Screen
        name="AddPin"
        component={AddPinComponent}
        options={{
          tabBarButton: () => <AddPinModal navigation={navigation} route={route}/>,
        }}
      />
      <Tab.Screen
        name="Journal"
        component={Journal}
        options={{
            tabBarIcon: ({ color, size }) => (
                <Icon name="journal" color={color} size={size} />
            ),
            headerLeft: () => (addFriendsIcon()),
            headerTitle: "My Journal",
            headerRight: () => <Icon name="settings-outline" size={wp('8%')} style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}/>
        }}
      />
    </Tab.Navigator>
    </ContextProvider>
  );
}

const styles = StyleSheet.create({
  addFriendsButton: {
    flex: 1,
    width: wp('8%'),
    height: wp('8%'),
    resizeMode: 'contain',
    marginLeft: wp('4%')
  },
  headerTitle: {
    flex: 1,
    width: wp('25%'),
    height: wp('25%'),
    resizeMode: 'contain',
  },
  settingsButton: {
    marginRight: wp('4%')
  }
});

export default NavBar;
