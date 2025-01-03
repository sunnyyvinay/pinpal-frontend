import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import Map from '../screens/Map';
import Journal from '../screens/Journal';
import AddPinModal from '../screens/AddPinOptions';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextProvider, useAppContext } from '../AppContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Map';
const AddPinComponent = () => {
  // A null component is needed because bottom tab screen requires a component as a prop
  return null;
};

function NavBar({ route, navigation }: any): React.JSX.Element {
  const user_id  = AsyncStorage.getItem("user_id");
  if (!user_id) navigation.navigate("Welcome");

  const {theme, setTheme} = useAppContext();

  return (
    <ContextProvider>
    <Tab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      screenOptions={{tabBarLabelStyle: {paddingBottom: hp('0.5%')}, tabBarActiveTintColor: theme === "dark" ? Colors.mediumOrange : Colors.darkOrange, tabBarInactiveTintColor: Colors.mediumGray, tabBarStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}}}>
      <Tab.Screen
        name="Map"
        component={Map}
        options={{
            tabBarIcon: ({ color, size }) => (
                <Icon name="compass" color={color} size={size} />
            ),
            headerLeft: () => <Icon name="people-outline" size={wp('8%')} style={styles.addFriendsButton} onPress={() => navigation.navigate("Add Friends")} color={theme === "dark" ? Colors.white : Colors.black}/>,
            headerTitle: () => <Image source={require('../../assets/images/full-logo.png')} style={styles.headerTitle}/>,
            headerRight: () => <Icon name="settings-outline" size={wp('8%')} style={styles.settingsButton} onPress={() => navigation.navigate("Settings")} color={theme === "dark" ? Colors.white : Colors.black}/>,
            headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}
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
            headerLeft: () => <Icon name="people-outline" size={wp('8%')} style={styles.addFriendsButton} onPress={() => navigation.navigate("Add Friends")} color={theme === "dark" ? Colors.white : Colors.black}/>,
            headerTitle: "My Journal",
            headerTitleStyle: {color: theme === "dark" ? Colors.darkOrange : Colors.black},
            headerRight: () => <Icon name="settings-outline" size={wp('8%')} style={styles.settingsButton} onPress={() => navigation.navigate("Settings")} color={theme === "dark" ? Colors.white : Colors.black}/>,
            headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}
        }}
      />
    </Tab.Navigator>
    </ContextProvider>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flex: 1,
    width: wp('25%'),
    height: wp('25%'),
    resizeMode: 'contain',
  },
  addFriendsButton: {
    marginLeft: wp('4%')
  },
  settingsButton: {
    marginRight: wp('4%')
  }
});

export default NavBar;
