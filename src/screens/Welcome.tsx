import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import * as Colors from '../constants/colors';
import { Image, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';

const Welcome = ({navigation}: {navigation: any}) => {
  return (
    <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.yellow, Colors.darkOrange]} style={styles.gradientContainer}>
        <Image source={require('../../assets/images/full-logo.png')} style={styles.logo} />
        <Button 
            title="LOG IN" 
            color={Colors.black}
            titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
            buttonStyle={styles.button}
            containerStyle={styles.loginButtonContainer} 
            onPress={() => navigation.navigate("Login")} />
        <Button 
            title="SIGN UP" 
            color={Colors.black}
            titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
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
    width: 200,
    height: 150,
    resizeMode: 'contain',
    marginTop: '10%',
  },
  button: {
    backgroundColor: Colors.yellow,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 30,
  },
  loginButtonContainer: {
    width: '75%',
    marginTop: '90%',
  },
  signupButtonContainer: {
    width: '75%',
    marginTop: 20,
},
});

export default Welcome;