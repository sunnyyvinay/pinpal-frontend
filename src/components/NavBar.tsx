import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import MapScreen from '../screens/MapScreen';
import JournalScreen from '../screens/JournalScreen';
import AddPinModal from '../screens/AddPinScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';

const Tab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Map';
const AddPinComponent = () => {
  // A null component is needed because bottom tab screen requires a component as a prop
  return null;
};

function NavBar(): React.JSX.Element {
  return (
    <NavigationContainer>
    <Tab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      screenOptions={{tabBarActiveTintColor: Colors.lightOrange, tabBarInactiveTintColor: Colors.lightGray}}>
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Icon name="compass" color={color} size={size} />
          ),
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
        component={JournalScreen}
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <Icon name="journal" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
    </NavigationContainer>
  );
}

export default NavBar;
