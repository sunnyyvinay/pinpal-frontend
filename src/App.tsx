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
import { ContextProvider } from './AppContext';
import PinPost from './screens/PinPost';
import AddFriends from './screens/AddFriends';
import Profile from './screens/Profile';
import UserList from './screens/UserList';
import { Appearance } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Colors from './constants/colors';

const Stack = createNativeStackNavigator();
function App(): React.JSX.Element {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const storeTheme = async () => {
      await AsyncStorage.setItem("theme", Appearance.getColorScheme() || "light");
      setTheme(Appearance.getColorScheme() || "light");
    }

    storeTheme();
  })

  return (
    <ContextProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName={"Welcome"} screenOptions={{ headerShown: false }} >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="NavBar" component={NavBar} options={{gestureEnabled: false}}/>
        <Stack.Screen name="Settings" component={Settings} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />, headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}, headerTitleStyle: {color: theme === "dark" ? Colors.white : Colors.black}})} />
        <Stack.Screen name="New pin" component={AddPin} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />, headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}, headerTitleStyle: {color: theme === "dark" ? Colors.white : Colors.black}})} />
        <Stack.Screen name="AddPinOptions" component={AddPinOptions} />
        <Stack.Screen name="Pin detail" component={PinPost} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />, headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}, headerTitleStyle: {color: theme === "dark" ? Colors.white : Colors.black}})} />
        <Stack.Screen name="Add Friends" component={AddFriends} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />, headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}, headerTitleStyle: {color: theme === "dark" ? Colors.white : Colors.black}})} />
        <Stack.Screen name="Profile" component={Profile} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />, headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}, headerTitleStyle: {color: theme === "dark" ? Colors.white : Colors.black}})} />
        <Stack.Screen name="UserList" component={UserList} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />, headerStyle: {backgroundColor: theme === "dark" ? Colors.darkBackground : Colors.white}, headerTitleStyle: {color: theme === "dark" ? Colors.white : Colors.black}})} />  
      </Stack.Navigator>
    </NavigationContainer>
    </ContextProvider>
  );
}

export default App;
