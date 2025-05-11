import messaging from '@react-native-firebase/messaging';
import { saveUserToken } from './user.service';

class NotificationService {
  // Get the FCM token
  async getDeviceToken() {
    try {
      const result = await messaging().registerDeviceForRemoteMessages();
      console.log('Device registered for remote messages:', result);
      const token = await messaging().getToken();
      console.log('Device token:', token);
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
}

export default new NotificationService();