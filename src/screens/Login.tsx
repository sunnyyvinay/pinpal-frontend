import React, { useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import * as Colors from '../constants/colors';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { loginUser } from '../services/user.service';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from 'react-native-gesture-handler';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const Login = ({navigation}: {navigation: any}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [hiddenPass, setHiddenPass] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<boolean>(false);
  
  return (
    <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.yellow, Colors.darkOrange]} style={styles.gradientContainer}>
        <Button
            icon={<Ionicon name="arrow-back" size={20} color={Colors.black} />}
            color={Colors.black}
            buttonStyle={styles.backButton}
            containerStyle={styles.backButtonContainer} 
            onPress={() => navigation.navigate("Welcome")} />
        <Image source={require('../../assets/images/full-logo.png')} style={styles.logo} />

        <View style={styles.inputContainer}>
          <TextInput
            style={{...styles.input, borderColor: loginError ? Colors.errorRed : "gray"}}
            placeholder="Enter username"
            onChangeText={(text: string) => {setUsername(text); setLoginError(false)}}
            value={username}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={{...styles.input, borderColor: loginError ? Colors.errorRed : "gray"}}
            placeholder="Enter your password"
            secureTextEntry={hiddenPass}
            onChangeText={(text: string) => {setPassword(text); setLoginError(false)}}
            value={password}
            autoCapitalize="none"
          />
          <Ionicon
            name={hiddenPass ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="gray"
            onPress={() => setHiddenPass(!hiddenPass)}
          />
        </View>

        {loginError && (
            <View style={styles.errorContainer}>
                <Ionicon name="alert-circle-outline" size={24} color={Colors.errorRed} />
                <Text style={styles.errorText}>Invalid username or password</Text>
            </View>
        )}

        <Button 
            title="LOG IN" 
            color={Colors.black}
            titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
            buttonStyle={styles.button}
            containerStyle={styles.loginButtonContainer} 
            onPress={async () => {
                const loginData = {
                    username: username,
                    pass: password
                };

                try {
                  const loginResult = await loginUser(loginData);
                  await AsyncStorage.setItem("user_id", loginResult.user.user_id);
                  navigation.navigate("NavBar");
                } catch (error) {
                  setLoginError(true);
                  console.log("LOGIN ERROR: ", error);
                }
            }} 
        />
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
    backgroundColor: Colors.darkOrange,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: wp('10%'),
    marginTop: hp('3%'),
  },
  backButton: {
    backgroundColor: Colors.white,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: wp('10%'),
    marginTop: hp('3%'),
  },
  backButtonContainer: {
    position: 'absolute',
    marginLeft: wp('5%'),
    marginTop: hp('3%'),
    alignSelf: 'flex-start',
  },
  loginButtonContainer: {
    width: wp('75%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    paddingHorizontal: wp('2%'),
    marginVertical: hp('2%'),
    width: wp('90%'),
    backgroundColor: Colors.white,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('0.5%'),
    width: wp('90%'),
  },
  errorText: {
    color: Colors.errorRed,
    marginLeft: wp('2%'),
  },
  input: {
    flex: 1,
    height: hp('6%'),
    paddingHorizontal: wp('2%'),
  },
  icon: {
    padding: 4,
  },
});

export default Login;