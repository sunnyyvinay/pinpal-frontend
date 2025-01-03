import { Button } from '@rneui/themed';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { StyleSheet } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../AppContext';

function BackButton({ navigation }: any): React.JSX.Element {
    const {theme, setTheme} = useAppContext();

    return (
        <Button
            icon={<Icon name="arrow-back" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} />}
            
            buttonStyle={{backgroundColor: theme === 'dark' ? Colors.darkBackground : Colors.white}}
            onPress={() => navigation.goBack()} />
    )
};

export default BackButton;