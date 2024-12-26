import React, { useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import * as Colors from '../constants/colors';
import { Image, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Welcome = ({navigation}: {navigation: any}) => {
  useEffect(() => {
    const checkUser = async () => {
      const user_id = await AsyncStorage.getItem('user_id');
      if (user_id) {
        navigation.navigate("NavBar");
      }
    }

    checkUser();
  })

  return (
    <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.yellow, Colors.darkOrange]} style={styles.gradientContainer}>
        <Image source={require('../../assets/images/full-logo.png')} style={styles.logo} />
        <Button 
            title="Log In" 
            color={Colors.black}
            titleStyle={{ color: '#cf4300', fontWeight: '900', fontFamily: 'ChunkFive' }}
            buttonStyle={styles.button}
            containerStyle={styles.loginButtonContainer} 
            onPress={() => navigation.navigate("Login")} />
        <Button 
            title="Sign Up" 
            color={Colors.black}
            titleStyle={{ color: '#cf4300', fontWeight: '900', fontFamily: 'ChunkFive' }}
            buttonStyle={styles.button}
            containerStyle={styles.signupButtonContainer} 
            onPress={() => navigation.navigate("Signup")} />
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
    width: wp('50%'),
    height: hp('25%'),
    resizeMode: 'contain',
    marginTop: hp('5%'),
  },
  button: {
    // backgroundColor: '#ffa938',
    backgroundColor: '#e2e5de',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: wp('10%'),
  },
  loginButtonContainer: {
    width: wp('75%'),
    marginTop: hp('50%'),
  },
  signupButtonContainer: {
    width: wp('75%'),
    marginTop: hp('3%'),
  },
});

export default Welcome;