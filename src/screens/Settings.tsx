import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import Modal from "react-native-modal";
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, updateUser } from '../services/user.service';
import DatePicker from 'react-native-date-picker';
import PhoneInput from 'react-native-phone-number-input';
import {ImagePickerResponse, launchImageLibrary, MediaType} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
const bcrypt = require("bcryptjs");

const Settings = ({ route, navigation }: any) => {
    const [userData, setUserData] = useState<any>({});
    
    const [modal, setModal] = useState<number>(0);
    const [newUserData, setNewUserData] = useState<any>({});
    const [unformattedPhone, setUnformattedPhone] = useState<string>("");
    const [oldPass, setOldPass] = useState<string>("");

    const [oldPassError, setOldPassError] = useState<string>("");

    function formatBirthday(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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
                formData.append('email', userData.email);
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
                    setUnformattedPhone(userData.user.phone_no);
                } else {
                    navigation.navigate("Welcome");
                }
            } catch (error) {
                console.log("Error fetching Settings data: ", error);
            } 
        }
        fetchUserData();
    }, []);

    // useEffect(() => {
    //     setNewUserData({...userData, phone_no: unformattedPhone});
    // }, [unformattedPhone]);

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

            <TouchableOpacity 
                style={styles.fieldView}
                onPress={() => {
                    setModal(4);
                }}>
                <View style={styles.textView}>
                    <Text style={{...styles.fieldText}}>
                        Phone Number
                    </Text>
                    <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.mediumGray}}>
                        {userData.phone_no}
                    </Text>
                </View>
                <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.fieldView}
                onPress={() => {
                    setModal(5);
                }}>
                <View style={styles.textView}>
                    <Text style={{...styles.fieldText}}>
                        Email
                    </Text>
                    <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.mediumGray}}>
                        {userData.email}
                    </Text>
                </View>
                <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
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
                style={{marginVertical: '40%', marginHorizontal: '10%'}}
                onBackdropPress={() => setModal(0)}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Username</Text>
                    <Input
                        value={newUserData.username}
                        placeholder='Enter new username'
                        autoCapitalize='none'
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
                                const user_id = await AsyncStorage.getItem("user_id");
                                if (user_id) {
                                    await updateUser(user_id, newUserData);
                                    setUserData({...userData, username: newUserData.username});
                                } else {
                                    navigation.navigate("Welcome");
                                }
                                setModal(0);
                            } catch (error) {
                                console.log("Error updating username: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 2 ? true : false}
                style={{marginVertical: '40%', marginHorizontal: '10%'}}
                onBackdropPress={() => setModal(0)}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Full Name</Text>
                    <Input
                        value={newUserData.full_name}
                        placeholder='Enter new full name'
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
                                const user_id = await AsyncStorage.getItem("user_id");
                                if (user_id) {
                                    await updateUser(user_id, newUserData);
                                    setUserData({...userData, full_name: newUserData.full_name});
                                } else {
                                    navigation.navigate("Welcome");
                                }
                                setModal(0);
                            } catch (error) {
                                console.log("Error updating full name: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 3 ? true : false}
                style={{marginVertical: '30%', marginHorizontal: '10%'}}
                onBackdropPress={() => setModal(0)}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Birthday</Text>
                    <DatePicker 
                            mode='date'
                            date={new Date(newUserData.birthday)}
                            onDateChange={date => setNewUserData({...newUserData, birthday: date})}
                            maximumDate={new Date()}
                            modal={false}
                        />
                    <Button 
                        title="SAVE"
                        color={Colors.white}
                        buttonStyle={styles.logOutButton}
                        titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                        containerStyle={styles.modalButton}
                        onPress={async () => {
                            try {
                                const user_id = await AsyncStorage.getItem("user_id");
                                if (user_id) {
                                    await updateUser(user_id, newUserData);
                                    setUserData({...userData, birthday: newUserData.birthday});
                                } else {
                                    navigation.navigate("Welcome");
                                }
                                setModal(0);
                            } catch (error) {
                                console.log("Error updating birthday: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 4 ? true : false}
                style={{marginVertical: '40%', marginHorizontal: '10%'}}
                onBackdropPress={() => setModal(0)}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Phone Number</Text>
                    <PhoneInput 
                            layout="second" 
                            defaultCode={'US'} 
                            defaultValue={unformattedPhone} 
                            onChangeText={setUnformattedPhone} 
                            onChangeFormattedText={(text: string | undefined) => {newUserData.phone_no = text}}
                            withShadow={true}
                            autoFocus={true} />
                    <Button 
                        title="SAVE"
                        color={Colors.white}
                        buttonStyle={styles.logOutButton}
                        titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'GentiumBookPlus' }}
                        containerStyle={styles.modalButton}
                        onPress={async () => {
                            try {
                                const user_id = await AsyncStorage.getItem("user_id");
                                if (user_id) {
                                    await updateUser(user_id, newUserData);
                                    setUserData({...userData, phone_no: newUserData.phone_no});
                                } else {
                                    navigation.navigate("Welcome");
                                }
                                setModal(0);
                            } catch (error) {
                                console.log("Error updating phone number: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 5 ? true : false}
                style={{marginVertical: '40%', marginHorizontal: '10%'}}
                onBackdropPress={() => setModal(0)}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Email</Text>
                    <Input
                        value={newUserData.email}
                        placeholder='Enter new email'
                        autoCapitalize='none'
                        onChangeText={text => setNewUserData({...newUserData, email: text})}
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
                                const user_id = await AsyncStorage.getItem("user_id");
                                if (user_id) {
                                    await updateUser(user_id, newUserData);
                                    setUserData({...userData, email: newUserData.email});
                                } else {
                                    navigation.navigate("Welcome");
                                }
                                setModal(0);
                            } catch (error) {
                                console.log("Error updating email: ", error);
                            }
                        }}
                    />
                </View>
            </Modal>

            <Modal 
                isVisible={modal === 6 ? true : false}
                style={{marginVertical: '40%', marginHorizontal: '10%'}}
                onBackdropPress={() => setModal(0)}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Edit Password</Text>
                    <Input
                        value={oldPass}
                        placeholder='Enter old password'
                        errorMessage={oldPassError}
                        errorStyle={styles.errorTextStyle}
                        autoCapitalize='none'
                        onChangeText={text => setOldPass(text)}
                        style={styles.modalInput}
                    />
                    <Input
                        value={newUserData.pass}
                        placeholder='Enter new password'
                        autoCapitalize='none'
                        onChangeText={text => setNewUserData({...newUserData, pass: text})}
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
                                    setOldPassError("Incorrect old password");
                                } else setOldPassError("");

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
        marginLeft: 15,
        fontFamily: 'GentiumBookPlus',
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
    fieldView: {
        width: '90%',
        backgroundColor: Colors.whiteGray,
        flex: 1,
        flexDirection: 'row',
        borderRadius: 10,
        marginBottom: 10,
    },
    textView: {
        flex: 0.95,
        flexDirection: 'column',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
    },
    fieldText: {
        fontFamily: 'GentiumBookPlus',
        flex: 0.5,
    },
    fieldIcon: {
        flex: 0.05,
        alignSelf: 'center',
        marginRight: 5,
    },
    pfpImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.mediumOrange,
        alignSelf: 'center',
        marginBottom: 10,
    },
    pfpOptionsView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 10,
    },
    pfpEditIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        marginRight: 10
    },
    pfpDeleteIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.darkRed,
        marginLeft: 10
    },
    logOutButton: {
        backgroundColor: Colors.darkOrange
    },
    logOutButtonContainer: {
        width: '50%',
        marginVertical: 20,
    },
    modalView: {
        height: 50,
        backgroundColor: 'white',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flex: 1,
        flexDirection: 'column',
    },
    modalText: {
        fontSize: 20,
        flex: 0.25,
        fontFamily: 'GentiumBookPlus',
    },
    modalInput: {
        flex: 1
    },
    modalButton: {
        flex: 0.25,
        width: '50%',
        marginTop: 20,
    },
    errorTextStyle: {
        color: Colors.errorRed
    }
});

export default Settings;