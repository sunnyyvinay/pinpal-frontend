import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserToken } from './user.service';

// Navigation types for type safety
interface NotificationPayload {
  type: string;
  pinId?: string;
  userId?: string;
  friendRequestId?: string;
  [key: string]: any;
}

class NotificationService {
  // Reference to navigation - will be set from App.tsx
  private _navigationRef: any = null;

  // Set the navigation reference
  setNavigationRef(ref: any) {
    this._navigationRef = ref;
  }

  // Request notification permissions
  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Alert.alert('Permission required', 'Enable notifications for a better experience');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  }

  // Get the FCM token
  async getDeviceToken() {
    try {
      await messaging().registerDeviceForRemoteMessages();
      
      // Check if we have a token in storage
      const storedToken = await AsyncStorage.getItem('fcmToken');
      
      // If we have a token and it hasn't expired, use it
      if (storedToken) {
        // Verify the token is still valid with Firebase
        try {
          await messaging().onTokenRefresh(() => {});
          return storedToken;
        } catch (error) {
          console.log('Stored token invalid, getting new token');
        }
      }
      
      // Get a new token
      const token = await messaging().getToken();
      
      // Store the token for future use
      if (token) {
        await AsyncStorage.setItem('fcmToken', token);
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get device token:', error);
      return null;
    }
  }
  
  // Save the token to your backend
  async saveToken(userId: string) {
    try {
      const token = await this.getDeviceToken();
      if (token) {
        await saveUserToken(userId, token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving token:', error);
      return false;
    }
  }
  
  // Handle foreground notifications
  setupForegroundHandler() {
    return messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'New notification',
          remoteMessage.notification.body || '',
          [
            { 
              text: 'Dismiss', 
              style: 'cancel' 
            },
            { 
              text: 'View', 
              onPress: () => {
                // Navigate to appropriate screen based on notification type
                if (remoteMessage.data) {
                  this.handleNotificationNavigation(remoteMessage.data as NotificationPayload);
                }
              } 
            }
          ]
        );
      }
    });
  }
  
  // Configure background notification handling
  setupBackgroundHandler() {
    // This is called when a notification is received while the app is in the background
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message handled:', remoteMessage);
      return Promise.resolve();
    });
  }
  
  // Handle notification opening app from background
  setupNotificationOpenedApp() {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app from background:', remoteMessage);
      if (remoteMessage.data) {
        this.handleNotificationNavigation(remoteMessage.data as NotificationPayload);
      }
    });
  }
  
  // Check if app was opened from a notification (app was closed)
  async checkInitialNotification() {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log('App opened from notification:', remoteMessage);
      if (remoteMessage.data) {
        // Using setTimeout to ensure navigation is ready
        setTimeout(() => {
          this.handleNotificationNavigation(remoteMessage.data as NotificationPayload);
        }, 1000);
      }
    }
  }
  
  // Navigate based on notification type
  handleNotificationNavigation(data: NotificationPayload) {
    if (!this._navigationRef || !this._navigationRef.isReady() || !data.type) {
      console.log('Navigation not ready or missing notification type');
      return;
    }
    
    switch (data.type) {
      case 'PIN_TAG':
        if (data.pinId && data.senderId) {
          this._navigationRef.navigate('Pin detail', {pin_id: data.pinId, pin_user_id: data.senderId});
        }
        break;
      case 'FRIEND_REQUEST':
        this._navigationRef.navigate('Add Friends');
        break;
      case 'FRIEND_REQUEST_ACCEPTED':
        this._navigationRef.navigate('Profile', { user_id: data.targetId });
        break;
      case 'PIN_LIKE':
        if (data.pinId && data.userId) {
          this._navigationRef.navigate('Pin detail', { pin_id: data.pinId, pin_user_id: data.userId });
        }
        break;
      default:
        this._navigationRef.navigate('NavBar');
        console.log('Unknown notification type:', data.type);
        break;
    }
  }
  
  // Initialize all notification handlers
  initialize(navigationRef: any) {
    this.setNavigationRef(navigationRef);
    this.requestPermission();
    this.setupBackgroundHandler();
    
    const unsubscribeForeground = this.setupForegroundHandler();
    const unsubscribeOpenedApp = this.setupNotificationOpenedApp();
    
    this.checkInitialNotification();
    
    // Return cleanup function
    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
    };
  }
}

export default new NotificationService();