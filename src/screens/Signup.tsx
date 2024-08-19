import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input , Text } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { Image } from '@rneui/base';
import Icon from 'react-native-vector-icons/Ionicons';
import PhoneInput from "react-native-phone-number-input";
import DatePicker from 'react-native-date-picker';
import { loginUser, signupUser } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = ({navigation}: {navigation: any}) => {
    const [step, setStep] = useState<number>(1);

    const [phoneNo, setPhoneNo] = useState<string | undefined>("");
    const [formattedPhoneNo, setFormattedPhoneNo] = useState<string | undefined>("");
    const [email, setEmail] = useState<string | undefined>("");
    const [birthday, setBirthday] = useState(new Date());
    const [fullName, setFullName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    function renderStep(step: number) {
        switch (step) {
            case 1:
                return (
                    <View style={styles.inputViewContainer}>
                        <PhoneInput 
                            layout="second" 
                            defaultCode={'US'} 
                            defaultValue={phoneNo} 
                            onChangeText={(text: string | undefined) => {setPhoneNo(text)}} 
                            onChangeFormattedText={(text: string | undefined) => {setFormattedPhoneNo(text)}}
                            withShadow={true}
                            autoFocus={true} />
                    </View>
                )
            case 2:
                return (
                    <View style={styles.inputViewContainer}>
                        <Text style={{fontSize: 20, textAlign: 'center', fontWeight: 'bold'}}>{birthday.toDateString()}</Text>
                        <DatePicker 
                            mode='date'
                            date={birthday}
                            onDateChange={setBirthday}
                            maximumDate={new Date()}
                            modal={false}
                        />
                    </View>
                )
            case 3:
                return (
                    <View style={styles.inputViewContainer}>
                        <Input
                            value={fullName}
                            label="Full Name"
                            placeholder="Enter full name"
                            onChangeText={setFullName}
                            containerStyle={styles.textInputContainer}
                            autoCapitalize='none'
                        />
                    </View>
                )
            case 4:
                return (
                    <View style={styles.inputViewContainer}>
                        <Input
                            value={username}
                            label="Username"
                            placeholder="Enter username"
                            onChangeText={setUsername}
                            containerStyle={styles.textInputContainer}
                            autoCapitalize='none'
                        />
                    </View>
                )
            case 5:
                return (
                    <View style={styles.inputViewContainer}>
                        <Input
                            value={password}
                            label="Password"
                            placeholder="Enter password"
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            containerStyle={styles.textInputContainer}
                            autoCapitalize='none'
                        />
                    </View>
                )
        }
    }

    return (
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.darkOrange, Colors.darkYellow]} style={styles.gradientContainer}>
            <Button
                icon={<Icon name="arrow-back" size={20} color={Colors.black} />}
                color={Colors.black}
                buttonStyle={styles.nextButton}
                containerStyle={styles.backButtonContainer} 
                onPress={() => {
                    step == 1 ? navigation.navigate("Welcome") : setStep(step - 1)
                }} />
            <Image source={require('../../assets/images/full-logo.png')} style={styles.logo} />

            {renderStep(step)}
            
            {
                step < 5 ? 
                <Button 
                    title="NEXT" 
                    icon={<Icon name="arrow-forward-circle-outline" size={20} color={Colors.black} />}
                    color={Colors.black}
                    iconRight
                    iconContainerStyle={{ marginLeft: 10 }}
                    titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
                    buttonStyle={styles.nextButton}
                    containerStyle={styles.buttonContainerStyle} 
                    onPress={() => setStep(step + 1)}/> 
                :
                <Button 
                    title="SIGN UP"
                    color={Colors.black}
                    titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
                    buttonStyle={styles.nextButton}
                    containerStyle={styles.buttonContainerStyle} 
                    onPress={async () => {
                        const signupData = {
                            username: username,
                            full_name: fullName,
                            pass: password,
                            birthday: birthday,
                            email: email,
                            phone_no: formattedPhoneNo                            
                        };
                        const loginData = {
                            username: username,
                            pass: password
                        };

                        try {
                            const signupResult = await signupUser(signupData);
                            const loginResult = await loginUser(loginData);
                            await AsyncStorage.setItem("user_id", loginResult.user.user_id);
                            navigation.navigate("NavBar");
                        } catch (error) {
                            console.log("SIGNUP ERROR: ", error);
                        }
                    }}
                />
            }
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
    },
    inputViewContainer: {
        width: '100%',
        alignItems: 'center',
    },
    textInputContainer: {
        width: '90%',
    }
});

export default Signup;