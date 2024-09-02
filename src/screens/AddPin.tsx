import { Button, Input } from '@rneui/themed';
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        if (route.params?.latitide && route.params?.longitude) {
          setPinData({...pinData, latitude: route.params?.latitide, longitude: route.params?.longitude});
        }
      }, [route.params]);

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

    const getVisibilityString = (visibilityNum: number) => {
        switch(visibilityNum) {
            case 0:
                return "Private";
            case 1:
                return "Friends";
            case 2:
                return "Public";
            default:
                return "Friends";
        }
    }
        
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
                        <TouchableOpacity onPress={openImagePicker} style={styles.inputView}>
                            <Text style={styles.inputTitleText}>Visibility</Text>
                            <Text style={styles.visibilityText}>{getVisibilityString(pinData.visibility)}</Text>
                        </TouchableOpacity> 
                             
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
                                        navigation.navigate("NavBar", {params : { draggedPin: false }});
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
        backgroundColor: Colors.whiteGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputView: {
        width: '90%',
        height: '20%',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: Colors.white,
    },
    inputTitleText: {
        color: Colors.black,
        fontFamily: 'Sansation',
        fontWeight: '700',
        marginLeft: 10
    },
    visibilityText: {
        color: Colors.darkGray,
        fontFamily: 'Sansation',
        fontWeight: '700',
        marginRight: 10
    }
})