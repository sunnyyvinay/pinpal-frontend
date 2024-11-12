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
                    </View>
                )
            case 2:
                return (
                    <View style={styles.inputViewContainer}>
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
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={fullName}
                            style={styles.input}
                            placeholder="Enter full name"
                            onChangeText={(text: string) => setFullName(text)} 
                            autoCapitalize='none' />
                    </View>
                )
            case 4:
                return (
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={username}
                            style={styles.input}
                            placeholder="Enter username"
                            onChangeText={(text: string) => setUsername(text)} 
                            autoCapitalize='none' />
                    </View>
                )
            case 5:
                return (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
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
                    icon={<Icon name="arrow-forward-circle-outline" size={20} color={Colors.black} style={{ paddingLeft: 5 }}/>}
                    color={Colors.black}
                    iconRight
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
                            email: undefined,
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
        backgroundColor: Colors.yellow,
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
    backButton: {
        backgroundColor: Colors.white,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 30,
    },
    inputViewContainer: {
        width: '90%',
        alignItems: 'center',
    },
    textInputContainer: {
        width: '90%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginVertical: 10,
        width: '90%',
        backgroundColor: Colors.white,
        height: 50
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 8,
    },
});

export default Signup;