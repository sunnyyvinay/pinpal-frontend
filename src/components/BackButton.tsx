import { Button } from '@rneui/themed';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { StyleSheet } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

function BackButton({ navigation }: any): React.JSX.Element {
    const [theme, setTheme] = React.useState('light');
    useEffect(() => {
        const getTheme = async () => {
            setTheme(await AsyncStorage.getItem('theme') || 'light');
        }
        getTheme();
    })

    return (
        <Button
            icon={<Icon name="arrow-back" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} />}
            color={theme === 'dark' ? Colors.white : Colors.black}
            buttonStyle={styles.button}
            onPress={() => navigation.goBack()} />
    )
};

const styles = StyleSheet.create({
    button: {
      backgroundColor: Colors.darkBackground
    },
});

export default BackButton;