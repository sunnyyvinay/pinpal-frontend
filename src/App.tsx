import React, { useEffect } from 'react';
import NavBar from './components/NavBar';
import Welcome from './screens/Welcome';
import Signup from './screens/Signup';
import Login from './screens/Login';
import Settings from './screens/Settings';
import AddPin from './screens/AddPin';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BackButton from './components/BackButton';
import AddPinOptions from './screens/AddPinOptions';
import { ContextProvider } from './AppContext';
import PinPost from './screens/PinPost';
import AddFriends from './screens/AddFriends';
import Profile from './screens/Profile';
import UserList from './screens/UserList';
import NotificationService from './services/NotificationService';

const Stack = createNativeStackNavigator();

const firebaseConfig = {
  apiKey: "AIzaSyDz2-8fHgFCiVQbnjMw6BcODWdmwElEW9I",
  authDomain: "pinpal-32a9b.firebaseapp.com",
  projectId: "pinpal-32a9b",
  storageBucket: "pinpal-32a9b.firebasestorage.app",
  messagingSenderId: "983925870336",
  appId: "1:983925870336:web:9bf5d5633a06f20993ade5",
  measurementId: "G-LZ4GL1JHT6"
};

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    // Initialize the notification service with the navigation reference
    const unsubscribeNotifications = NotificationService.initialize(navigationRef);
    
    // Clean up on unmount
    return () => {
      unsubscribeNotifications();
    };
  }, [navigationRef]);
  
  return (
    <ContextProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={"Welcome"} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="NavBar" component={NavBar} options={{gestureEnabled: false}}/>
          <Stack.Screen name="Settings" component={Settings} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} />})} />
          <Stack.Screen name="New pin" component={AddPin} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} /> })} />
          <Stack.Screen name="AddPinOptions" component={AddPinOptions} />
          <Stack.Screen name="Pin detail" component={PinPost} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} /> })} />
          <Stack.Screen name="Add Friends" component={AddFriends} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} /> })} />
          <Stack.Screen name="Profile" component={Profile} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} /> })} />
          <Stack.Screen name="UserList" component={UserList} options={({navigation}) => ({headerShown: true, headerLeft: () => <BackButton navigation={navigation} /> })} />  
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
}

export default App;
