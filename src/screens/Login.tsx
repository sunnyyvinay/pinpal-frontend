import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import * as Colors from '../constants/colors';
import { Image, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';

const Login = ({navigation}: {navigation: any}) => {
  return (
    <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.darkOrange, Colors.darkYellow]} style={styles.gradientContainer}>
        <Button
            icon={<Icon name="arrow-back" size={20} color={Colors.black} />}
            color={Colors.black}
            buttonStyle={styles.button}
            containerStyle={styles.backButtonContainer} 
            onPress={() => navigation.navigate("Welcome")} />
        <Image source={require('../../assets/images/full-logo.png')} style={styles.logo} />
        <Button 
            title="LOG IN" 
            color={Colors.black}
            titleStyle={{ color: Colors.black, fontWeight: '700' }}
            buttonStyle={styles.button}
            containerStyle={styles.loginButtonContainer} 
            onPress={() => navigation.navigate("Login")} />
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
    backgroundColor: Colors.white,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 30,
  },
  backButtonContainer: {
    position: 'absolute',
    marginLeft: 15,
    marginTop: 30,
    alignSelf: 'flex-start',
},
  loginButtonContainer: {
      width: '75%',
      marginTop: '90%',
  },
});

export default Login;