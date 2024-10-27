import { Button, Input, SearchBar } from '@rneui/themed';
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
import { addPin, getSearchUsers, getUser } from '../services/user.service';
import Modal from "react-native-modal";
import { locationTags, getLocationTagIcon } from '../constants/locationtags';
import userSearchStyles from '../styles/usersearch';

const AddPin = ({ route, navigation }: any) => {
    const [step, setStep] = useState<number>(1);
    const lat_long = [route.params.latitude, route.params.longitude];
    const [pinData, setPinData] = useState<any>({
        title: "",
        caption: "",
        create_date: undefined,
        edit_date: undefined,
        photos: [],
        location_tags: [],
        visibility: 1,
        user_tags: []
    });
    const [visibilityModal, setVisibilityModal] = useState<boolean>(false);
    const [locationTagsModal, setlocationTagsModal] = useState<boolean>(false);
    type UserTag = {
        modalVisible: boolean;
        search: string;
        queryUsers: any[];
    }
    const [userTagState, setUserTagState] = useState<UserTag>({
        modalVisible: false,
        search: "",
        queryUsers: []
    });
    let searchedUserCount: number = 0;
    useEffect(() => {
        const fetchData = async () => {
          if (userTagState.search.length > 0) {
            try {
              const users = await getSearchUsers(userTagState.search);
              searchedUserCount = users.users.length + 1;
              setUserTagState({...userTagState, queryUsers: users.users});
            } catch (error) {
              console.error(error);
            }
          } else {
            setUserTagState({...userTagState, search: "", queryUsers: []});
          }
        };
    
        // Debounce the API call to avoid too many requests
        const timeoutId = setTimeout(() => {
          fetchData();
        }, 300);
    
        return () => clearTimeout(timeoutId);
      }, [userTagState.search]);

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

    const userTagDisplayText = () => {
        if (pinData.user_tags.length == 0) {
            return "None";
        } else if (pinData.user_tags.length > 0) {
            return `${pinData.user_tags.length} Users`;
        }
        return "None";
    }
    const userView = (user: any, tag: boolean) => {
        searchedUserCount--;
        if (tag) {
            return (
            <View style={userSearchStyles.searchUserView} key={searchedUserCount}>
                <Image 
                    source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                    style={{...userSearchStyles.searchUserPfp, flex: 0.1}} />
                <View style={{...userSearchStyles.searchUserTextView, flex: 0.6}}>
                    <Text style={userSearchStyles.searchUserFullName}>{user.full_name}</Text>
                    <Text style={userSearchStyles.searchUserUsernameText}>{user.username}</Text>
                </View>
                <TouchableOpacity style={{flex: 0.1, marginRight: 3}} onPress={async () => { 
                    setPinData({...pinData, user_tags: pinData.user_tags.filter((tag_id: any) => tag_id !== user.user_id)})
                }}>
                    <MaterialIcon name="cancel" size={25} color={Colors.errorRed} />
                </TouchableOpacity>
            </View> 
            )
        } else {
            return (
            <TouchableOpacity key={searchedUserCount} onPress={() => 
                pinData.user_tags.push(user.user_id)
            }>
                <View style={userSearchStyles.searchUserView}>
                    <Image 
                        source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                        style={{...userSearchStyles.searchUserPfp, flex: 0.1}} />
                    <View style={{...userSearchStyles.searchUserTextView, flex: 0.9}}>
                        <Text style={userSearchStyles.searchUserFullName}>{user.full_name}</Text>
                        <Text style={userSearchStyles.searchUserUsernameText}>{user.username}</Text>
                    </View>
                </View>
            </TouchableOpacity>
            )
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

                        <TouchableOpacity onPress={() => {setUserTagState({modalVisible: true, search: "", queryUsers: []})}} style={styles.userTagsInputView}>
                            <Text style={styles.userTagsTitleText}>Tagged Users</Text>
                            <Text style={styles.userTagsText}>{userTagDisplayText()}</Text>
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
                                            titleStyle={{ color: Colors.mediumGray, fontWeight: '300', fontFamily: 'Sansation', fontSize: 15 }}/>
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
                isVisible={userTagState.modalVisible} 
                onBackdropPress={() => setUserTagState({...userTagState, modalVisible: false})}
                style={styles.userTagsModal} >
                <View style={styles.userTagsModalView}>
                    <Text style={styles.userTagsModalTitle}>Tag Users</Text>
                    <SearchBar 
                        placeholder='Search...'
                        value={userTagState.search}
                        round={true}
                        autoCapitalize="none"
                        lightTheme={true}
                        containerStyle={userSearchStyles.searchBarContainer}
                        onChangeText={(text) => setUserTagState({...userTagState, search: text})}/>
                    {userTagState.search.length === 0 && pinData.user_tags.length > 0 && <Text style={styles.userTagsModalText}>Tagged</Text>}
                    <ScrollView>
                        { userTagState.search.length > 0 ?
                            <View style={{flex: 0.5}}>
                                { userTagState.queryUsers && userTagState.queryUsers.length > 0 && userTagState.queryUsers.map((user: any) => (
                                    userView(user, false)
                                ))}
                            </View> 
                            : 
                            <View style={{flex: 0.5}}>
                                { pinData.user_tags.length > 0 && pinData.user_tags.map((user: any) => (
                                    userView(user, true)
                                ))}
                            </View> 
                        }
                    </ScrollView>
                </View>
            </Modal>

            <Modal 
                isVisible={visibilityModal} 
                onBackdropPress={() => setVisibilityModal(false)}
                style={styles.visibilityModal} >
                <View style={styles.visibilityModalView}>
                    <Text style={styles.visibilityModalTitle}>Select visibility</Text>
                    <TouchableOpacity style={styles.visibilityModalSubview} 
                        onPress={() => {
                            setPinData({ ...pinData, visibility: 0});
                            setVisibilityModal(false);
                        }}>
                        <MaterialIcon name="lock" size={25} style={{ flex: 0.25}}/>
                        <Text style={styles.visibilityModalSubviewText}>Private</Text>
                        <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 0 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                    </TouchableOpacity>
                    <View style={styles.horizontalLine} />
                    
                    <TouchableOpacity style={styles.visibilityModalSubview} 
                        onPress={() => {
                            setPinData({ ...pinData, visibility: 1});
                            setVisibilityModal(false);
                        }}>
                        <MaterialIcon name="people-alt" size={25} style={{ flex: 0.25}}/>
                        <Text style={styles.visibilityModalSubviewText}>Friends</Text>
                        <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 1 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                    </TouchableOpacity>
                    <View style={styles.horizontalLine} />
                    
                    <TouchableOpacity style={styles.visibilityModalSubview} 
                        onPress={() => {
                            setPinData({ ...pinData, visibility: 2});
                            setVisibilityModal(false);
                        }}>
                        <MaterialIcon name="public" size={25} style={{ flex: 0.25}}/>
                        <Text style={styles.visibilityModalSubviewText}>Public</Text>
                        <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 2 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                    </TouchableOpacity>
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
    visibilityModalSubview: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
    },
    visibilityModalSubviewText: {
        flex: 0.65,
        marginLeft: 10,
        fontSize: 18,
        fontFamily: 'Sansation',
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
    userTagsInputView: {
        width: '90%',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: Colors.whiteGray,
    },
    userTagsTitleText: {
        color: Colors.black,
        fontFamily: 'Sansation',
        fontWeight: '700',
        marginLeft: 5
    },
    userTagsText: {
        color: Colors.darkGray,
        fontFamily: 'Sansation',
        fontWeight: '700',
        marginRight: 5
    },
    userTagsModal: {
        justifyContent: 'center',
    },
    userTagsModalView: {
        backgroundColor: 'white',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flex: 0.9,
    },
    userTagsModalTitle: {
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    userTagsModalText: {
        marginLeft: 10,
        fontSize: 18,
        fontFamily: 'Sansation',
        marginBottom: 5,
        marginTop: 15
    },
})