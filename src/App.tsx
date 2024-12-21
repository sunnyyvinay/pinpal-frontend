import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Welcome from './screens/Welcome';
import Signup from './screens/Signup';
import Login from './screens/Login';
import Settings from './screens/Settings';
import AddPin from './screens/AddPin';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BackButton from './components/BackButton';
import AddPinOptions from './screens/AddPinOptions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextProvider } from './AppContext';
import PinPost from './screens/PinPost';
import AddFriends from './screens/AddFriends';
import Profile from './screens/Profile';
import UserList from './screens/UserList';

const Stack = createNativeStackNavigator();
function App(): React.JSX.Element {
  return (
    <ContextProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName={"NavBar"} screenOptions={{ headerShown: false }} >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="NavBar" component={NavBar} />
        <Stack.Screen name="Settings" component={Settings} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />})} />
        <Stack.Screen name="New pin" component={AddPin} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />})} />
        <Stack.Screen name="AddPinOptions" component={AddPinOptions} />
        <Stack.Screen name="Pin detail" component={PinPost} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />})} />
        <Stack.Screen name="Add Friends" component={AddFriends} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />})} />
        <Stack.Screen name="Profile" component={Profile} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />})} />
        <Stack.Screen name="UserList" component={UserList} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />})} />  
      </Stack.Navigator>
    </NavigationContainer>
    </ContextProvider>
  );
}

export default App;
