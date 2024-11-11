import React, { useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import * as Colors from '../constants/colors';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { loginUser } from '../services/user.service';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from 'react-native-gesture-handler';

const Login = ({navigation}: {navigation: any}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [hiddenPass, setHiddenPass] = useState<boolean>(true);
  
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
            style={styles.input}
            placeholder="Enter username"
            onChangeText={(text: string) => setUsername(text)}
            value={username}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={hiddenPass}
            onChangeText={(text: string) => setPassword(text)}
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

        <Button 
            title="LOG IN" 
            color={Colors.black}
            titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
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
    marginTop: 20
  },
  backButton: {
    backgroundColor: Colors.white,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 30,
    marginTop: 20
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginVertical: 10,
    width: '90%',
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
  },
  icon: {
    padding: 4,
  },
});

export default Login;