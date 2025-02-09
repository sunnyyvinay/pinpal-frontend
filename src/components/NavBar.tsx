import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Map from '../screens/Map';
import Journal from '../screens/Journal';
import AddPinModal from '../screens/AddPinOptions';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextProvider, useAppContext } from '../AppContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getUserRequests } from '../services/user.service';
import { useFocusEffect } from '@react-navigation/native';

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

  const [friendRequests, setFriendRequests] = useState<boolean>(false);
  useFocusEffect(
    useCallback(() => {
      const has_friend_requests = async () => {
        try {
          const user_id = await AsyncStorage.getItem("user_id");
          if (user_id) {
            const friendRequestData = await getUserRequests(user_id);
            setFriendRequests(friendRequestData.friend_requests.length > 0);
          }
        } catch (error) {
          console.error(error);
        }
      }
  
      has_friend_requests();
    }, [friendRequests])
  );

  const FriendRequestIcon = () => {
    return (
      <View style={styles.container}>
        <Icon name="people-outline" size={wp('8%')} style={styles.addFriendsButton} onPress={() => navigation.navigate("Add Friends")} color={theme === "dark" ? Colors.white : Colors.black}/>
        {friendRequests && (
          <View style={styles.badge}/>
        )}
      </View>
    );
  };

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
            headerLeft: () => FriendRequestIcon(),
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
            headerLeft: () => FriendRequestIcon(),
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
  },
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -wp('1.5%'),
    top: -wp('1%'),
    backgroundColor: Colors.pink,
    borderRadius: wp('3%'),
    width: wp('3%'),
    height: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NavBar;
