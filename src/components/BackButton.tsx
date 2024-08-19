import { Button } from '@rneui/themed';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import { StyleSheet } from 'react-native';

function BackButton({ navigation }: any): React.JSX.Element {
    return (
        <Button
            icon={<Icon name="arrow-back" size={20} color={Colors.black} />}
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