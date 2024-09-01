import { Button, Input } from '@rneui/themed';
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import GetLocation, { isLocationError } from 'react-native-get-location';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as Colors from '../constants/colors';
import { ImagePickerResponse, launchImageLibrary, MediaType } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addPin } from '../services/user.service';

const AddPin = ({ route, navigation }: any) => {
    const [step, setStep] = useState<number>(1);
    const [pinData, setPinData] = useState<any>({
        latitude: 0,
        longitude: 0,
        title: "",
        caption: "",
        create_date: undefined,
        edit_date: undefined,
        photos: [],
        location_tags: [],
        visibility: 1
    });

    useEffect(() => {
        GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 30000,
          rationale: {
            title: 'Location permission',
            message: 'PinPal needs the permission to request your location.',
            buttonPositive: 'Ok',
          },
        })
        .then(newLocation => {
          setPinData({ ...pinData, latitude: Number(newLocation.latitude), longitude: Number(newLocation.longitude) });
        })
        .catch(ex => {
          if (isLocationError(ex)) {
            const {code, message} = ex;
            console.warn(code, message);
          } else {
            console.warn(ex);
          }
        })}, []);

    const openImagePicker = () => {
        const options = {
            mediaType: 'photo' as MediaType,
            includeBase64: true,
            maxHeight: 2000,
            maxWidth: 2000,
        };
    
        launchImageLibrary(options, async (response: ImagePickerResponse) => {
            if (response.didCancel) {
            console.log('User cancelled image picker');
            } else if (response.errorCode) {
            console.log('Image picker error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
            if (response.assets[0].fileSize && response.assets[0].fileSize > 7340032) { // 7 MB
                console.log("File too large. Please upload a smaller file");
            }
            // const base64image = response.assets[0].base64;
            // setNewUserData({...newUserData, profile_pic: base64image});
            // const user_id = await AsyncStorage.getItem("user_id");
            // if (user_id) {
            //     await updateUser(user_id, newUserData);
            //     setUserData({...userData, profile_pic: base64image});
            // } else {
            //     navigation.navigate("Welcome");
            // }
            }
        });
    };
        
    function renderStep(step: number) {
        switch (step) {
            case 1:
                return (
                    <View style={styles.inputViewContainer}>
                        <Input
                            value={pinData.title}
                            label="Title"
                            placeholder="Enter pin title"
                            onChangeText={(text) => setPinData({ ...pinData, title: text })}
                            containerStyle={styles.textInputContainer}
                            autoCapitalize='none'
                        />
                        <Button 
                            title="NEXT" 
                            icon={<Icon name="arrow-forward-circle-outline" size={20} color={Colors.white} />}
                            color={Colors.white}
                            iconRight
                            iconContainerStyle={{ marginLeft: 10 }}
                            titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation' }}
                            buttonStyle={styles.nextButton}
                            containerStyle={styles.buttonContainerStyle} 
                            onPress={() => setStep(step + 1)} /> 
                    </View>
                )
            case 2:
                return (
                    <View style={styles.inputViewContainer}>
                        <TouchableOpacity onPress={openImagePicker} style={styles.pickPhotoContainer} >
                            <MaterialIcon name="add-a-photo" size={50} />
                        </TouchableOpacity>
                        <Button 
                            title="NEXT" 
                            icon={<Icon name="arrow-forward-circle-outline" size={20} color={Colors.black} />}
                            color={Colors.black}
                            iconRight
                            iconContainerStyle={{ marginLeft: 10 }}
                            titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
                            buttonStyle={styles.nextButton}
                            containerStyle={styles.buttonContainerStyle} 
                            onPress={() => setStep(step + 1)} /> 
                    </View>
                )
            case 3:
                return (
                    <View style={styles.inputViewContainer}>
                        <Input
                            value={pinData.caption}
                            label="Caption"
                            placeholder="Enter pin caption"
                            onChangeText={(text) => setPinData({ ...pinData, caption: text })}
                            containerStyle={styles.textInputContainer}
                            autoCapitalize='none'
                        />
                        <Button 
                            title="ADD PIN" 
                            icon={<MaterialIcon name="person-pin-circle" size={20} color={Colors.black} />}
                            color={Colors.black}
                            iconRight
                            iconContainerStyle={{ marginLeft: 10 }}
                            titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation' }}
                            buttonStyle={styles.nextButton}
                            containerStyle={styles.buttonContainerStyle} 
                            onPress={
                                async () => {
                                    const user_id = await AsyncStorage.getItem("user_id");
                                    if (user_id) {
                                        await addPin(user_id, pinData);
                                        navigation.navigate("NavBar");
                                    } else {
                                        navigation.navigate("Welcome");
                                    }
                                }
                            } /> 
                    </View>
                )
        }
    }
    return (
        <ScrollView>
            {renderStep(step)}
        </ScrollView>
    )
}

export default AddPin;

const styles = StyleSheet.create({
    inputViewContainer: {
        width: '100%',
        height: '100%',
        alignContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        padding: 20,
    },
    textInputContainer: {
        width: '90%',
        marginTop: 20,
    },
    nextButton: {
        backgroundColor: Colors.lightOrange,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 30,
    },
    buttonContainerStyle: {
        width: '75%',
        marginHorizontal: 50,
        marginTop: '30%',
    },
    pickPhotoContainer: {
        width: 200,
        height: 200,
        borderWidth: 3,
        borderColor: Colors.darkOrange,
        backgroundColor: Colors.whiteOrange,
        justifyContent: 'center',
        alignItems: 'center',
    },
})