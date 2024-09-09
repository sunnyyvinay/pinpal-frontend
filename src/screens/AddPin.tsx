import { Button, Input } from '@rneui/themed';
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GetLocation, { isLocationError } from 'react-native-get-location';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import * as Colors from '../constants/colors';
import { ImagePickerResponse, launchImageLibrary, MediaType } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addPin } from '../services/user.service';
import Modal from "react-native-modal";

const AddPin = ({ route, navigation }: any) => {
    const [step, setStep] = useState<number>(1);
    const [visibilityModal, setVisibilityModal] = useState<boolean>(false);
    const [locationTagsModal, setlocationTagsModal] = useState<boolean>(false);
    const lat_long = [route.params.latitude, route.params.longitude];
    const [pinData, setPinData] = useState<any>({
        title: "",
        caption: "",
        create_date: undefined,
        edit_date: undefined,
        photos: [],
        location_tags: [],
        visibility: 1
    });
    const locationTags = ['Food', 'Viewpoint', 'Shopping', 'Beach', 'Club', 'Other'];

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

    const getLocationTagIcon = (locationTag: string) => {
        switch (locationTag) {
            case "Food":
                return <Icon name="restaurant" size={20} color={Colors.black} style={{ flex: 0.15}}/>;
            case "Viewpoint":
                return <FontAwesome6 name="mountain-sun" size={20} color={Colors.black} style={{ flex: 0.15}}/>;
            case "Shopping":
                return <MaterialIcon name="shopping-bag" size={20} color={Colors.black} style={{ flex: 0.15}}/>;
            case "Beach":
                return <FontAwesome6 name="umbrella-beach" size={20} color={Colors.black} style={{ flex: 0.15}}/>;
            case "Club":
                return <Entypo name="drink" size={20} color={Colors.black} style={{ flex: 0.15}}/>;
            default:
                return <FontAwesome6 name="location-arrow" size={20} color={Colors.black} style={{ flex: 0.15}}/>;;
        }
    }
        
    function renderStep(step: number) {
        switch (step) {
            case 1:
                return (
                    <View style={styles.inputViewContainer}>
                        <TouchableOpacity onPress={openImagePicker} style={styles.pickPhotoContainer} >
                            <MaterialIcon name="add-a-photo" size={50} />
                        </TouchableOpacity>
                        <Button 
                            title="NEXT" 
                            icon={<Icon name="arrow-forward-circle-outline" size={20} color={Colors.white} style={{ marginLeft: 5 }}/>}
                            color={Colors.white}
                            iconRight
                            iconContainerStyle={{ marginLeft: 10 }}
                            titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation' }}
                            buttonStyle={styles.buttonStyle}
                            containerStyle={styles.buttonContainerStyle} 
                            onPress={() => setStep(step + 1)} /> 
                    </View>
                )
            case 2:
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
                        <Input
                            value={pinData.caption}
                            label="Caption"
                            placeholder="Enter pin caption"
                            onChangeText={(text) => setPinData({ ...pinData, caption: text })}
                            containerStyle={styles.textInputContainer}
                            autoCapitalize='none'
                        />
                        <TouchableOpacity onPress={() => {setVisibilityModal(true)}} style={styles.visibilityInputView}>
                            <Text style={styles.visibilityTitleText}>Visibility</Text>
                            <Text style={styles.visibilityText}>{getVisibilityString(pinData.visibility)}</Text>
                        </TouchableOpacity> 

                        <View style={styles.locationTagsView}>
                            <Text style={styles.locationTagsText}>Location Tags</Text>
                            <View style={styles.locationTagsButtonView}>
                                <Button 
                                    title="Edit"
                                    icon={<MaterialIcon name="edit" size={15} color={Colors.black} style={{ marginRight: 2 }}/>}
                                    color={Colors.black}
                                    iconContainerStyle={{ marginRight: 2 }}
                                    titleStyle={{ color: Colors.black, fontWeight: '300', fontFamily: 'Sansation', fontSize: 15 }}
                                    buttonStyle={styles.locationTagsAddButton}
                                    containerStyle={styles.locationTagsAddButtonContainer} 
                                    onPress={() => setlocationTagsModal(true)}/>
                                {pinData.location_tags.map((tag:string, index:number) => {
                                    return (
                                        <Button 
                                            title={tag} 
                                            key={index}
                                            buttonStyle={styles.locationTagButton} 
                                            titleStyle={{ color: Colors.lightGray, fontWeight: '300', fontFamily: 'Sansation', fontSize: 15 }}/>
                                    )
                                })}
                            </View>
                        </View>
                        
                        <Button 
                            title="ADD PIN" 
                            icon={<MaterialIcon name="person-pin-circle" size={20} color={Colors.white} style={{ marginLeft: 5 }} />}
                            color={Colors.white}
                            iconRight
                            iconContainerStyle={{ marginLeft: 10 }}
                            titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation' }}
                            buttonStyle={styles.buttonStyle}
                            containerStyle={styles.buttonContainerStyle} 
                            onPress={
                                async () => {
                                    const user_id = await AsyncStorage.getItem("user_id");
                                    if (user_id) {
                                        const pinInput = {...pinData, latitude: lat_long[0], longitude: lat_long[1]};
                                        await addPin(user_id, pinInput);
                                        navigation.navigate("NavBar", { screen: 'Map' });
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
        <ScrollView contentContainerStyle={{flex: 1}}>
            {renderStep(step)}
            <Modal 
                isVisible={visibilityModal} 
                onBackdropPress={() => setVisibilityModal(false)}
                style={styles.visibilityModal} >
                <View style={styles.visibilityModalView}>
                    <Text style={styles.visibilityModalTitle}>Select visibility</Text>
                    <View>
                        <View style={styles.visibilityModalListView}>
                            <TouchableOpacity onPress={() => {setPinData({...pinData, visibility: 0}); setVisibilityModal(false)}} style={styles.visibilityModelOpacity}>
                                <MaterialIcon name="lock" size={25} style={{ flex: 0.25}}/>
                                <Text style={styles.visibilityModalText}>Private</Text>
                                <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 0 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                            </TouchableOpacity>
                            <View style={styles.horizontalLine} />
                        </View>
                        
                        <View style={styles.visibilityModalListView}>
                            <TouchableOpacity onPress={() => {setPinData({...pinData, visibility: 1}); setVisibilityModal(false)}} style={styles.visibilityModelOpacity}>
                                <MaterialIcon name="people-alt" size={25} style={{ flex: 0.25}}/>
                                <Text style={styles.visibilityModalText}>Friends</Text>
                                <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 1 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                            </TouchableOpacity>
                            <View style={styles.horizontalLine} />
                        </View>
                        
                        <View style={styles.visibilityModalListView}>
                        <TouchableOpacity onPress={() => {setPinData({...pinData, visibility: 2}); setVisibilityModal(false)}} style={styles.visibilityModelOpacity}>
                            <MaterialIcon name="public" size={25} style={{ flex: 0.25}}/>
                            <Text style={styles.visibilityModalText}>Public</Text>
                            <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 2 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                        </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal 
                isVisible={locationTagsModal} 
                onBackdropPress={() => setlocationTagsModal(false)}
                style={styles.locationTagsModal} >
                <View style={styles.locationTagsModalView}>
                    <Text style={styles.locationTagsModalTitle}>Select location tags</Text>
                    <View>
                        {locationTags.map((tag, index) => {
                            return (
                                <View key={index} >
                                    <TouchableOpacity 
                                        style={styles.locationTagsModalOpacity}
                                        onPress={() => {
                                            if (pinData.location_tags.includes(tag)) {
                                                setPinData({...pinData, location_tags: pinData.location_tags.filter((item:string) => item !== tag)});
                                            } else {
                                                setPinData({...pinData, location_tags: [...pinData.location_tags, tag]});
                                            }
                                        }}>
                                        {getLocationTagIcon(tag)}
                                        <Text style={styles.locationTagsModalText}>{tag}</Text>
                                        <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.location_tags.includes(tag) ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                                    </TouchableOpacity>
                                    <View style={styles.horizontalLine} />
                                </View>
                            )
                        })}
                    </View>
                </View>
            </Modal>
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
        padding: 10,
    },
    textInputContainer: {
        width: '90%',
        marginTop: 20,
    },
    buttonStyle: {
        backgroundColor: Colors.mediumOrange,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 30,
    },
    buttonContainerStyle: {
        width: '75%',
        marginHorizontal: 50,
        marginTop: 100,
    },
    pickPhotoContainer: {
        width: 200,
        height: 200,
        borderWidth: 3,
        borderColor: Colors.mediumOrange,
        backgroundColor: Colors.whiteGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visibilityInputView: {
        width: '90%',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: Colors.whiteGray,
    },
    visibilityTitleText: {
        color: Colors.black,
        fontFamily: 'Sansation',
        fontWeight: '700',
        marginLeft: 5
    },
    visibilityText: {
        color: Colors.darkGray,
        fontFamily: 'Sansation',
        fontWeight: '700',
        marginRight: 5
    },
    visibilityModal: {
        justifyContent: 'center',
    },
    visibilityModalView: {
        backgroundColor: 'white',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flex: 0.5,
    },
    visibilityModalTitle: {
        fontSize: 20,
        marginTop: 10,
        marginBottom: 20,
    },
    visibilityModalListView: {
        height: 75,
    },
    visibilityModelOpacity: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    visibilityModalText: {
        flex: 0.65,
        fontSize: 18,
    },
    horizontalLine: {
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignSelf: 'center',
        width: '100%',
    },
    locationTagsView: {
        marginTop: 20,
        marginLeft: 20,
        alignSelf: 'flex-start',
    },
    locationTagsText: {
        fontSize: 15,
        fontFamily: 'Sansation',
        fontWeight: '700',
        color: Colors.black,
        marginBottom: 15,
    },
    locationTagsAddButton: {
        backgroundColor: Colors.whiteGray,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 20,
    },
    locationTagsAddButtonContainer: {
        width: 65,
    },
    locationTagsButtonView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: 5,
        rowGap: 5,
    },
    locationTagsModal: {
        justifyContent: 'center',
    },
    locationTagsModalView: {
        backgroundColor: 'white',
        padding: 20,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: 10,
        flex: 0.75,
    },
    locationTagsModalTitle: {
        fontSize: 25,
    },
    locationTagsModalOpacity: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    locationTagsModalText: {
        fontSize: 18,
        flex: 0.65
    },
    locationTagButton: {
        backgroundColor: Colors.whiteOrange,
        borderWidth: 0,
        borderRadius: 20,
    }, 
})