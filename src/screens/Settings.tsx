import React from 'react'
import { Text, View } from 'react-native';
import { Button, Input, Header} from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import BackButton from '../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = ({ route, navigation }: any) => {
    const user_id  = AsyncStorage.getItem("user_id");

  return (
    <View>
        
    </View>
  )
}

export default Settings;