import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Text } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { Image } from '@rneui/base';
import Icon from 'react-native-vector-icons/Ionicons';
import PhoneInput, { ICountry } from 'react-native-international-phone-number';
import DatePicker from 'react-native-date-picker';
import { checkUsername, loginUser, signupUser } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';

const Signup = ({navigation}: {navigation: any}) => {
    const [step, setStep] = useState<number>(1);

    const [phoneNo, setPhoneNo] = useState<{number: string, country: ICountry | undefined}>({
        number: '',
        country: {
            name: {en: 'United States', ru: 'United States', pl: 'United States', ua: 'United States', cz: 'United States', by: 'United States', pt: 'United States', es: 'United States', ro: 'United States', bg: 'United States', de: 'United States', fr: 'United States', nl: 'United States', it: 'United States', cn: 'United States', ee: 'United States', jp: 'United States', he: 'United States', ar: 'United States'},
            cca2: 'US',
            callingCode: '+1',
            flag: '🇺🇸'
        }
    });
    const [birthday, setBirthday] = useState(new Date());
    const [fullName, setFullName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    
    const [hiddenPass, setHiddenPass] = useState<boolean>(true);
    const [hiddenConfirmPass, setHiddenConfirmPass] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    function isValidFullName(fullName: string) {
        return /^[a-zA-Z\s]*$/.test(fullName);
    }
    function isValidUsername(username: string) {
        return /^[a-zA-Z0-9._]*$/.test(username);
    }
    function isValidPass(pass: string) {
        return pass.length >= 7;
    }

    function renderStep(step: number) {
        switch (step) {
            case 1:
                return (
                    <View style={styles.inputViewContainer}>
                        <PhoneInput
                            placeholder='Enter phone number'
                            value={phoneNo.number} 
                            onChangePhoneNumber={(text: string) => {setPhoneNo({number: text, country: phoneNo.country}); setError("")}} 
                            selectedCountry={phoneNo.country}
                            onChangeSelectedCountry={(country: ICountry | undefined) => {setPhoneNo({number: phoneNo.number, country: country}); setError("")}}
                            defaultCountry='US'
                            popularCountries={['US']} />  
                        {error === "phone" && <Text style={styles.errorText}>Please enter a valid phone number</Text>}                  
                    </View>
                )
            case 2:
                return (
                    <View style={styles.inputViewContainer}>
                        <Text style={styles.birthdayInputText}>Enter your birthday</Text>
                        <DatePicker 
                            mode='date'
                            date={birthday}
                            onDateChange={(date: Date) => {setBirthday(date); setError("")}}
                            maximumDate={new Date()}
                            modal={false} />
                        {error === "birthday" && <Text style={styles.errorText}>You must be 13 years or older</Text>}                  
                    </View>
                )
            case 3:
                return (
                    <>
                    <View style={{...styles.inputContainer, borderColor: error !== "" ? Colors.errorRed : "gray"}}>
                        <TextInput
                            value={fullName}
                            style={styles.input}
                            placeholder="Enter your full name"
                            onChangeText={(text: string) => {setFullName(text); setError("")}} 
                            autoCapitalize='none' />
                    </View>
                    {error === "full_name" && <Text style={styles.errorText}>Please enter a full name</Text>}
                    {error === "full_name_long" && <Text style={styles.errorText}>Make sure your full name is less than 50 characters</Text>}
                    {error === "full_name_nonalpha" && <Text style={styles.errorText}>Make sure your full name only contains letters and whitespace</Text>}
                    </>
                )
            case 4:
                return (
                    <>
                    <View style={{...styles.inputContainer, borderColor: error !== "" ? Colors.errorRed : "gray"}}>
                        <TextInput
                            value={username}
                            style={styles.input}
                            placeholder="Make a username"
                            onChangeText={(text: string) => {setUsername(text); setError("")}} 
                            autoCapitalize='none' />
                    </View>
                    {error === "username_long" && <Text style={styles.errorText}>Make sure your username is between 5 and 25 characters</Text>}
                    {error === "username_badchar" && <Text style={styles.errorText}>Make sure your username only contains letters, numbers, periods, and underscores</Text>}
                    {error === "username_exists" && <Text style={styles.errorText}>This username already exists</Text>}
                    </>
                )
            case 5:
                return (
                    <>
                    <View style={{...styles.inputContainer, borderColor: error !== "" ? Colors.errorRed : "gray"}}>
                        <TextInput
                            style={styles.input}
                            placeholder="Make a password"
                            secureTextEntry={hiddenPass}
                            onChangeText={(text: string) => {setPassword(text); setError("")}}
                            value={password}
                        />
                        <Ionicon
                            name={hiddenPass ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="gray"
                            onPress={() => setHiddenPass(!hiddenPass)}
                        />
                    </View>
                    <View style={{...styles.inputContainer, borderColor: error !== "" ? Colors.errorRed : "gray"}}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            secureTextEntry={hiddenConfirmPass}
                            onChangeText={(text: string) => {setConfirmPassword(text); setError("")}}
                            value={confirmPassword}
                        />
                        <Ionicon
                            name={hiddenConfirmPass ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="gray"
                            onPress={() => setHiddenConfirmPass(!hiddenConfirmPass)}
                        />
                    </View>
                    {error === "password" && <Text style={styles.errorText}>Please enter a password with 7+ characters</Text>}
                    {error === "confirm_password" && <Text style={styles.errorText}>Make sure your passwords match</Text>}
                    </>
                )
        }
    }

    return (
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={[Colors.yellow, Colors.darkOrange]} style={styles.gradientContainer}>
            <Button
                icon={<Icon name="arrow-back" size={20} color={Colors.black} />}
                color={Colors.black}
                buttonStyle={styles.backButton}
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
                    icon={<FontAwesome6Icon name="arrow-right-long" size={20} color={Colors.white} style={{ paddingLeft: wp('1%'), textAlign: 'center' }}/>}
                    color={Colors.black}
                    iconRight
                    titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'ChunkFive' }}
                    buttonStyle={styles.nextButton}
                    containerStyle={styles.buttonContainerStyle} 
                    onPress={ async () => {
                        if (step === 1) {
                            if (!phoneNo.number) {
                                setError("phone");
                            } else {
                                setError("");
                                setStep(step + 1);
                            }
                        } else if (step === 2) {
                            const now = new Date();
                            const thirteenYearsAgo = new Date();
                            thirteenYearsAgo.setFullYear(now.getFullYear() - 13);
                            if (birthday > thirteenYearsAgo) {
                                setError("birthday");
                            } else {
                                setError("");
                                setStep(step + 1);
                            }
                        } else if (step === 3) {
                            if (!fullName) {
                                setError("full_name");
                            } else if (fullName.length > 50) {
                                setError("full_name_long");

                            } else if (!isValidFullName(fullName)) {
                                setError("full_name_nonalpha");
                            } else {
                                setError("");
                                setStep(step + 1);
                            }
                        } else if (step === 4) {
                            try {
                                const result = await checkUsername(username);
                                if (!username || username.length < 5 || username.length > 25) {
                                    setError("username_long");
                                } else if (!result.success) {
                                    setError("username_exists");
                                } else if (!isValidUsername(username)) {
                                    setError("username_badchar");
                                } else {
                                    setError("");
                                    setStep(step + 1);
                                }
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }} /> 
                :
                <Button 
                    title="Sign Up"
                    color={Colors.black}
                    titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'ChunkFive' }}
                    buttonStyle={styles.nextButton}
                    containerStyle={styles.buttonContainerStyle} 
                    onPress={async () => {
                        if (!password || !isValidPass(password)) {
                            setError("password");
                        } else if (password !== confirmPassword) {
                            setError("confirm_password");
                        } else {
                            const signupData = {
                                username: username,
                                full_name: fullName,
                                pass: password,
                                birthday: birthday,
                                phone_no: phoneNo.country?.callingCode + phoneNo.number.replace(/\s/g, ""),
                                profile_pic: null                            
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
        width: wp('50%'),
        height: hp('25%'),
        resizeMode: 'contain',
        marginTop: hp('5%'),
    },
    nextButton: {
        backgroundColor: Colors.darkOrange,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: wp('10%'),
    },
    buttonContainerStyle: {
        width: wp('90%'),
        marginHorizontal: wp('12%'),
        marginTop: hp('10%'),
    },
    backButtonContainer: {
        position: 'absolute',
        marginLeft: wp('5%'),
        marginTop: hp('5%'),
        alignSelf: 'flex-start',
    },
    backButton: {
        backgroundColor: Colors.white,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: wp('10%'),
    },
    inputViewContainer: {
        width: wp('90%'),
        alignItems: 'center',
    },
    textInputContainer: {
        width: wp('75%'),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: "gray",
        borderRadius: 4,
        paddingHorizontal: hp('1%'),
        marginVertical: hp('1%'),
        width: wp('90%'),
        backgroundColor: Colors.white,
        height: hp('6%'),
    },
    input: {
        flex: 1,
        height: hp('6%'),
        paddingHorizontal: wp('2%'),
    },
    birthdayInputText: {
        color: Colors.black,
        fontFamily: 'ChunkFive',
        fontWeight: '400',
        fontSize: hp('3%'),
        marginBottom: hp('1%'),
    },
    errorText: {
        color: Colors.errorRed,
        marginTop: hp('1%'),
        textAlign: 'center',
        justifyContent: 'center',
    },
});

export default Signup;