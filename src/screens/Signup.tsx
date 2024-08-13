import React, {useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { Image } from '@rneui/base';
import PhoneInput from "react-native-phone-number-input";
import Icon from 'react-native-vector-icons/Ionicons';

const Signup = ({navigation}: {navigation: any}) => {
    const [phoneNo, setPhoneNo] = useState<string | undefined>();
    const [formattedPhoneNo, setFormattedPhoneNo] = useState<string | undefined>();
    const [location, setLocation] = useState<string | undefined>();
    const [fullName, setFullName] = useState<string | undefined>();
    const [username, setUsername] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();

    return (
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.darkOrange, Colors.darkYellow]} style={styles.gradientContainer}>
            <Button
                icon={<Icon name="arrow-back" size={20} color={Colors.black} />}
                color={Colors.black}
                buttonStyle={styles.nextButton}
                containerStyle={styles.backButtonContainer} 
                onPress={() => navigation.navigate("Welcome")} />
            <Image source={require('../../assets/images/full-logo.png')} style={styles.logo} />
            <PhoneInput 
                layout="second" 
                defaultCode={'US'} 
                defaultValue={phoneNo} 
                onChangeText={(text: string | undefined) => {setPhoneNo(text)}} 
                onChangeFormattedText={(text: string | undefined) => {setFormattedPhoneNo(text)}}
                withShadow={true}
                autoFocus={true} />
            <Button 
                title="NEXT" 
                icon={<Icon name="arrow-forward-circle-outline" size={20} color={Colors.black} />}
                color={Colors.black}
                iconRight
                iconContainerStyle={{ marginLeft: 10 }}
                titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
                buttonStyle={styles.nextButton}
                containerStyle={styles.buttonContainerStyle} />
        </LinearGradient>
  )
}

const styles = StyleSheet.create({
    gradientContainer: {
        alignContent: 'center',
        flex: 1,
        flexDirection: 'column',
        textAlign: 'center',
        alignItems: 'center',
    },
    logo: {
        tintColor: Colors.white,
        width: 200,
        height: 150,
        resizeMode: 'contain',
        marginTop: '10%',
    },
    nextButton: {
        backgroundColor: Colors.white,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 30,
    },
    buttonContainerStyle: {
        width: '75%',
        marginHorizontal: 50,
        marginTop: '30%',
    },
    backButtonContainer: {
        position: 'absolute',
        marginLeft: 15,
        marginTop: 30,
        alignSelf: 'flex-start',
    }
});

export default Signup;