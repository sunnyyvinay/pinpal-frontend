import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Input , Text } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { Image } from '@rneui/base';
import Icon from 'react-native-vector-icons/Ionicons';
import PhoneInput, { ICountry } from 'react-native-international-phone-number';
import DatePicker from 'react-native-date-picker';
import { loginUser, signupUser } from '../services/user.service';
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
    
    const [hiddenPass, setHiddenPass] = useState<boolean>(true);
    const [error, setError] = useState<string>(""); // phone, birthday, full_name, username, password

    function renderStep(step: number) {
        switch (step) {
            case 1:
                return (
                    <View style={styles.inputViewContainer}>
                        <PhoneInput
                            placeholder='Enter phone number'
                            value={phoneNo.number} 
                            onChangePhoneNumber={(text: string) => {setPhoneNo({number: text, country: phoneNo.country})}} 
                            selectedCountry={phoneNo.country}
                            onChangeSelectedCountry={(country: ICountry | undefined) => {setPhoneNo({number: phoneNo.number, country: country})}}
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
                            onDateChange={setBirthday}
                            maximumDate={new Date()}
                            modal={false}
                        />
                        {error === "birthday" && <Text style={styles.errorText}>You must be 13 years or older</Text>}                  
                    </View>
                )
            case 3:
                return (
                    <>
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={fullName}
                            style={styles.input}
                            placeholder="Enter your full name"
                            onChangeText={(text: string) => setFullName(text)} 
                            autoCapitalize='none' />
                    </View>
                    {error === "full_name" && <Text style={styles.errorText}>Please enter a full name</Text>}
                    </>
                )
            case 4:
                return (
                    <>
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={username}
                            style={styles.input}
                            placeholder="Make a username"
                            onChangeText={(text: string) => setUsername(text)} 
                            autoCapitalize='none' />
                    </View>
                    {error === "username" && <Text style={styles.errorText}>Please enter a username</Text>}
                    </>
                    
                )
            case 5:
                return (
                    <>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Make a password"
                            secureTextEntry={hiddenPass}
                            onChangeText={(text: string) => setPassword(text)}
                            value={password}
                        />
                        <Ionicon
                            name={hiddenPass ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="gray"
                            onPress={() => setHiddenPass(!hiddenPass)}
                        />
                    </View>
                    {error === "password" && <Text style={styles.errorText}>Please enter a valid password</Text>}
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
                    icon={<FontAwesome6Icon name="arrow-right-long" size={20} color={Colors.white} style={{ paddingLeft: 5, textAlign: 'center' }}/>}
                    color={Colors.black}
                    iconRight
                    titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                    buttonStyle={styles.nextButton}
                    containerStyle={styles.buttonContainerStyle} 
                    onPress={() => {
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
                            } else {
                                setError("");
                                setStep(step + 1);
                            }
                        } else if (step === 4) {
                            if (!username) {
                                setError("username");
                            } else {
                                setError("");
                                setStep(step + 1);
                            }
                        } else if (step === 5) {
                            if (!password) {
                                setError("password");
                            } else {
                                setError("");
                                setStep(step + 1);
                            }
                        }
                    }} /> 
                :
                <Button 
                    title="SIGN UP"
                    color={Colors.black}
                    titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                    buttonStyle={styles.nextButton}
                    containerStyle={styles.buttonContainerStyle} 
                    onPress={async () => {
                        if (!password) {
                            setError("password");
                        } else {
                            const signupData = {
                                username: username,
                                full_name: fullName,
                                pass: password,
                                birthday: birthday,
                                email: "",
                                phone_no: phoneNo.country?.callingCode + phoneNo.number,
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
        borderWidth: 1,
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
        fontFamily: 'GentiumBookPlus',
        fontSize: hp('3%'),
        marginBottom: hp('1%'),
    },
    errorText: {
        color: Colors.errorRed,
        marginTop: hp('1%'),
    },
});

export default Signup;