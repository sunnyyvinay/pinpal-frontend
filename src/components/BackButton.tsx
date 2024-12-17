import { Button } from '@rneui/themed';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { StyleSheet } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

function BackButton({ navigation }: any): React.JSX.Element {
    return (
        <Button
            icon={<Icon name="arrow-back" size={hp('2%')} color={Colors.black} />}
            color={Colors.black}
            buttonStyle={styles.button}
            onPress={() => navigation.goBack()} />
    )
};

const styles = StyleSheet.create({
    button: {
      backgroundColor: Colors.white
    },
});

export default BackButton;