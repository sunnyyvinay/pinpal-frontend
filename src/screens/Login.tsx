import React, { useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import * as Colors from '../constants/colors';
import { Image, StyleSheet } from 'react-native';
import { Button, Input } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';

const Login = ({navigation}: {navigation: any}) => {
  const [username, setUsername] = useState<string | undefined>("");
  const [password, setPassword] = useState<string | undefined>("");
  
  return (
    <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.darkOrange, Colors.darkYellow]} style={styles.gradientContainer}>
        <Button
            icon={<Icon name="arrow-back" size={20} color={Colors.black} />}
            color={Colors.black}
            buttonStyle={styles.button}
            containerStyle={styles.backButtonContainer} 
            onPress={() => navigation.navigate("Welcome")} />
        <Image source={require('../../assets/images/full-logo.png')} style={styles.logo} />
        <Input
            value={username}
            label="Username"
            placeholder="Enter username"
            onChangeText={setUsername}
            containerStyle={styles.inputContainer}
        />
        <Input
            value={password}
            label="Password"
            placeholder="Enter password"
            onChangeText={setPassword}
            containerStyle={styles.inputContainer}
        />
        <Button 
            title="LOG IN" 
            color={Colors.black}
            titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
            buttonStyle={styles.button}
            containerStyle={styles.loginButtonContainer} 
            onPress={() => {}} />
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
  },
  inputContainer: {
    width: '90%',
    tintColor: Colors.black
  }
});

export default Login;