import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import Modal from "react-native-modal";
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkUsername, getUser, updateUser } from '../services/user.service';
import DatePicker from 'react-native-date-picker';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {ImagePickerResponse, launchImageLibrary, MediaType} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
const bcrypt = require("bcryptjs");

const Settings = ({ route, navigation }: any) => {
    const [userData, setUserData] = useState<any>({});
    
    const [modal, setModal] = useState<number>(0);
    const [newUserData, setNewUserData] = useState<any>({});
    const [oldPass, setOldPass] = useState<string>("");
    const [hiddenOldPass, setHiddenOldPass] = useState<boolean>(true);
    const [hiddenNewPass, setHiddenNewPass] = useState<boolean>(true);

    const [error, setError] = useState<any>({
        full_name: "",
        username: "",
        birthday: "",
        phone_no: "",
        password: "",
        old_password: ""
    });

    function formatBirthday(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    function isValidFullName(fullName: string) {
        return /^[a-zA-Z\s]*$/.test(fullName);
    }
    function isValidUsername(username: string) {
        return /^[a-zA-Z0-9._]*$/.test(username);
    }
    function isValidPass(pass: string) {
        return pass.length >= 7;
    }

    const openImagePicker = () => {
        const options = {
          mediaType: 'photo' as MediaType,
          includeBase64: true,
          maxHeight: 2000,
          maxWidth: 2000,
        };
    
        launchImageLibrary(options, async (response: ImagePickerResponse) => {
          const user_id = await AsyncStorage.getItem("user_id");
          if (response.errorCode) {
            console.log('Image picker error: ', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            if (response.assets[0].fileSize && response.assets[0].fileSize > 7340032) { // 7 MB
                console.log("File too large. Please upload a smaller file");
            } else if (user_id && response.assets) {
                const imageUri = response.assets[0].uri;
                const formData = new FormData();
                formData.append('profile_pic', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: user_id + '.jpg',
                });
                formData.append('username', userData.username);
                formData.append('full_name', userData.full_name);
                formData.append('birthday', userData.birthday);
                formData.append('phone_no', userData.phone_no);
                formData.append('pass', userData.pass);
                await updateUser(user_id, formData);
                setUserData({...userData, profile_pic: imageUri});
                } else {
                    navigation.navigate("Welcome");
                }
            } 
          }
        );
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user_id  = await AsyncStorage.getItem("user_id");
                if (user_id) {
                    const userData = await getUser(user_id);
                    setUserData(userData.user);
                    setNewUserData({...userData.user, pass: ""});
                } else {
                    navigation.navigate("Welcome");
                }
            } catch (error) {
                console.log("Error fetching Settings data: ", error);
            } 
        }
        fetchUserData();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.sectionTitle}>Account Information</Text>          
            
            <TouchableOpacity onPress={openImagePicker}>
                <Image source={userData.profile_pic && userData.profile_pic != "" ? {uri: userData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
            </TouchableOpacity>
            <View style={styles.pfpOptionsView}>
                <TouchableOpacity style={styles.pfpEditIcon} onPress={openImagePicker}>
                        <MaterialIcon name="add-a-photo" size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.pfpDeleteIcon} onPress={async () => {
                    setUserData({...userData, profile_pic: null});
                    await updateUser(userData.user_id, userData);
                }}>
                    <Ionicons name="trash" size={20} color={Colors.lightRed} />
                </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
                style={styles.fieldView} 
                onPress={() => {
                    setModal(1);
                }}>
                <View style={styles.textView}>
                    <Text style={{...styles.fieldText}}>
                        Username
                    </Text>
                    <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.mediumGray}}>
                        {userData.username}
                    </Text>
                </View>
                <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.fieldView}
                onPress={() => {
                    setModal(2);
                }}>
                <View style={styles.textView}>
                    <Text style={{...styles.fieldText}}>
                        Full Name
                    </Text>
                    <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.mediumGray}}>
                        {userData.full_name}
                    </Text>
                </View>
                <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.fieldView}
                onPress={() => {
                    setModal(3);
                }}>
                <View style={styles.textView}>
                    <Text style={{...styles.fieldText}}>
                        Birthday
                    </Text>
                    <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.mediumGray}}>
                        {formatBirthday(userData.birthday)}
                    </Text>
                </View>
                <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.fieldView}>
                <View style={styles.textView}>
                    <Text style={{...styles.fieldText}}>
                        Phone Number
                    </Text>
                    <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.mediumGray}}>
                        {userData.phone_no && userData.phone_no.substring(0, 2) + " " + userData.phone_no.substring(2, userData.phone_no.length)}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.fieldView}
                onPress={() => {
                    setModal(6);
                }}>
                <View style={styles.textView}>
                    <Text style={{...styles.fieldText}}>
                        Change Your Password
                    </Text>
                </View>
                <MaterialIcon name="password" size={15} style={styles.fieldIcon} />
            </TouchableOpacity>

            <Button 
                title="LOG OUT" 
                color={Colors.white}
                buttonStyle={styles.logOutButton}
                titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                containerStyle={styles.logOutButtonContainer}
                onPress={async () => {
                    await AsyncStorage.removeItem("user_id");
                    navigation.navigate("Welcome");
                }}
            />

            <Modal 
                isVisible={modal === 1 ? true : false}
                style={{marginVertical: hp('35%'), marginHorizontal: wp('10%')}}
                onBackdropPress={() => {
                    setError({...error, username: ""});
                    setNewUserData({...newUserData, username: userData.username});
                    setModal(0);
                }}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Username</Text>
                    <Input
                        value={newUserData.username}
                        placeholder='Enter new username'
                        autoCapitalize='none'
                        errorMessage={error.username}
                        errorStyle={styles.errorTextStyle}
                        onChangeText={text => setNewUserData({...newUserData, username: text})}
                        style={styles.modalInput}
                    />
                    <Button 
                        title="SAVE"
                        color={Colors.white}
                        buttonStyle={styles.logOutButton}
                        titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                        containerStyle={styles.modalButton}
                        onPress={async () => {
                            try {
                                const result = await checkUsername(newUserData.username);
                                if (!newUserData.username || newUserData.username.length < 5 || newUserData.username.length > 25) {
                                    setError({...error, username: "Make sure your username is between 5 and 25 characters"});
                                } else if (!isValidUsername(newUserData.username)) {
                                    setError({...error, username: "Make sure your username contains only letters, numbers, periods, and underscores"});
                                } else if (!result.success) {
                                    setError({...error, username: "This username already exists"}); 
                                } else {
                                    setError({...error, username: ""});
                                    const user_id = await AsyncStorage.getItem("user_id");
                                    if (user_id) {
                                        await updateUser(user_id, newUserData);
                                        setUserData({...userData, username: newUserData.username});
                                    } else {
                                        navigation.navigate("Welcome");
                                    }
                                    setModal(0);
                                }
                            } catch (error) {
                                console.log("Error updating username: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 2 ? true : false}
                style={{marginVertical: hp('35%'), marginHorizontal: wp('10%')}}
                onBackdropPress={() => {
                    setError({...error, full_name: ""});
                    setNewUserData({...newUserData, full_name: userData.full_name});
                    setModal(0);
                }}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Full Name</Text>
                    <Input
                        value={newUserData.full_name}
                        placeholder='Enter new full name'
                        errorMessage={error.full_name}
                        errorStyle={styles.errorTextStyle}
                        autoCapitalize='none'
                        onChangeText={text => setNewUserData({...newUserData, full_name: text})}
                        style={styles.modalInput}
                    />
                    <Button 
                        title="SAVE"
                        color={Colors.white}
                        buttonStyle={styles.logOutButton}
                        titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                        containerStyle={styles.modalButton}
                        onPress={async () => {
                            try {
                                if (!newUserData.full_name) {
                                    setError({...error, full_name: "Please enter a full name"});
                                } else if (newUserData.full_name.length > 50) {
                                    setError({...error, full_name: "Make sure your full name is less than 50 characters"});
                                } else if (!isValidFullName(newUserData.full_name)) {
                                    setError({...error, full_name: "Make sure your full name only contains letters and whitespace"});
                                } else {
                                    setError({...error, full_name: ""});
                                    const user_id = await AsyncStorage.getItem("user_id");
                                    if (user_id) {
                                        await updateUser(user_id, newUserData);
                                        setUserData({...userData, full_name: newUserData.full_name});
                                    } else {
                                        navigation.navigate("Welcome");
                                    }
                                    setModal(0);
                                }
                            } catch (error) {
                                console.log("Error updating full name: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 3 ? true : false}
                style={{marginVertical: hp('25%'), marginHorizontal: wp('10%')}}
                onBackdropPress={() => {
                    setError({...error, birthday: ""});
                    setNewUserData({...newUserData, birthday: userData.birthday});
                    setModal(0);
                }}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Birthday</Text>
                    <DatePicker 
                        mode='date'
                        date={new Date(newUserData.birthday)}
                        onDateChange={date => setNewUserData({...newUserData, birthday: date})}
                        maximumDate={new Date()}
                        modal={false}
                    />
                    <Text style={{...styles.errorTextStyle, marginTop: hp('2%'), textAlign: 'center', justifyContent: 'center'}}>{error.birthday}</Text>
                    <Button 
                        title="SAVE"
                        color={Colors.white}
                        buttonStyle={styles.logOutButton}
                        titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                        containerStyle={styles.modalButton}
                        onPress={async () => {
                            try {
                                const now = new Date();
                                const thirteenYearsAgo = new Date();
                                thirteenYearsAgo.setFullYear(now.getFullYear() - 13);
                                if (newUserData.birthday > thirteenYearsAgo) {
                                    setError({...error, birthday: "You must be 13 years or older"});
                                } else {
                                    setError({...error, birthday: ""});
                                    const user_id = await AsyncStorage.getItem("user_id");
                                    if (user_id) {
                                        await updateUser(user_id, newUserData);
                                        setUserData({...userData, birthday: newUserData.birthday});
                                    } else {
                                        navigation.navigate("Welcome");
                                    }
                                    setModal(0);
                                }
                            } catch (error) {
                                console.log("Error updating birthday: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 6 ? true : false}
                style={{marginVertical: hp('30%'), marginHorizontal: wp('10%')}}
                onBackdropPress={() => {
                    setError({...error, pass: "", old_password: ""});
                    setNewUserData({...newUserData, pass: ""});
                    setOldPass("");
                    setModal(0);
                }}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Password</Text>
                    <Input
                        value={oldPass}
                        placeholder='Enter old password'
                        errorMessage={error.old_password}
                        errorStyle={styles.errorTextStyle}
                        autoCapitalize='none'
                        onChangeText={text => setOldPass(text)}
                        rightIcon={<Ionicons name={hiddenOldPass ? 'eye-outline' : 'eye-off-outline'} size={24} color="gray" onPress={() => setHiddenOldPass(!hiddenOldPass)} />}
                        style={styles.modalInput}
                    />
                    <Input
                        value={newUserData.pass}
                        placeholder='Enter new password'
                        errorMessage={error.pass}
                        errorStyle={styles.errorTextStyle}
                        autoCapitalize='none'
                        onChangeText={text => setNewUserData({...newUserData, pass: text})}
                        rightIcon={<Ionicons name={hiddenNewPass ? 'eye-outline' : 'eye-off-outline'} size={24} color="gray" onPress={() => setHiddenNewPass(!hiddenNewPass)} />}
                        style={styles.modalInput}
                    />
                    <Button 
                        title="SAVE"
                        color={Colors.white}
                        buttonStyle={styles.logOutButton}
                        titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                        containerStyle={styles.modalButton}
                        onPress={async () => {
                            try {
                                const validPassword = await bcrypt.compare(oldPass, userData.pass);
                                if (!validPassword) {
                                    setError({...error, old_password: "Incorrect old password"});
                                } else if (!newUserData.pass || !isValidPass(newUserData.pass)) {
                                    setError({...error, pass: "Password must be at least 7 characters long"});
                                } else {
                                    setError({...error, old_password: "", pass: ""});
                                    const user_id = await AsyncStorage.getItem("user_id");
                                    if (user_id) {
                                        await updateUser(user_id, newUserData);
                                        setUserData({...userData, pass: newUserData.pass});
                                    } else {
                                        navigation.navigate("Welcome");
                                    }
                                    setModal(0);
                                    setNewUserData({...newUserData, pass: ""});
                                    setOldPass("");
                                }

                                
                            } catch (error) {
                                console.log("Error updating password: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white
    },
    sectionTitle: {
        alignSelf: 'flex-start',
        marginLeft: wp('5%'),
        fontFamily: 'GentiumBookPlus',
        fontWeight: 'bold',
        marginBottom: hp('1%'),
        marginTop: hp('2%'),
    },
    fieldView: {
        width: wp('95%'),
        backgroundColor: Colors.lightGray,
        flex: 1,
        flexDirection: 'row',
        borderRadius: hp('1%'),
        marginBottom: hp('1%'),
    },
    textView: {
        flex: 0.95,
        flexDirection: 'column',
        marginTop: hp('1%'),
        marginBottom: hp('1%'),
        marginLeft: wp('2%'),
    },
    fieldText: {
        fontFamily: 'GentiumBookPlus',
        flex: 0.5,
        color: Colors.darkGray
    },
    fieldIcon: {
        flex: 0.05,
        alignSelf: 'center',
        marginRight: wp('2%'),
    },
    pfpImage: {
        width: 100,
        height: 100,
        borderRadius: hp('15%'),
        borderWidth: 2,
        borderColor: Colors.mediumOrange,
        alignSelf: 'center',
        marginBottom: hp('1%'),
    },
    pfpOptionsView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: hp('1%'),
    },
    pfpEditIcon: {
        width: wp('15%'),
        height: hp('6%'),
        borderRadius: hp('5%'),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.whiteGray,
        marginRight: wp('1%'),
    },
    pfpDeleteIcon: {
        width: wp('15%'),
        height: hp('6%'),
        borderRadius: hp('5%'),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.darkRed,
        marginLeft: wp('1%'),
    },
    logOutButton: {
        backgroundColor: Colors.darkOrange
    },
    logOutButtonContainer: {
        width: wp('50%'),
        marginVertical: hp('2%'),
    },
    modalView: {
        backgroundColor: 'white',
        padding: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp('1%'),
        flex: 3,
        flexDirection: 'column',
    },
    modalText: {
        fontSize: 20,
        flex: 0.5,
        fontFamily: 'GentiumBookPlus',
    },
    modalInput: {
        flex: 2
    },
    modalButton: {
        flex: 0.5,
        width: wp('50%'),
        marginTop: hp('1%'),
    },
    errorTextStyle: {
        color: Colors.errorRed
    }
});

export default Settings;