import { Button, SearchBar } from '@rneui/themed';
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import * as Colors from '../constants/colors';
import { ImagePickerResponse, launchImageLibrary, MediaType } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addPin, getSearchUsers, getUser } from '../services/user.service';
import Modal from "react-native-modal";
import { locationTags, getLocationTagIcon } from '../constants/locationtags';
import userSearchStyles from '../styles/usersearch';
import userTagsStyles from '../styles/usertags';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';

const AddPin = ({ route, navigation }: any) => {
    const [theme, setTheme] = React.useState('light');
    const [step, setStep] = useState<number>(1);
    const lat_long = [route.params.latitude, route.params.longitude];
    const [pinData, setPinData] = useState<any>({
        title: "",
        caption: "",
        create_date: undefined,
        edit_date: undefined,
        photo: null,
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
        taggedUsers: any[];
    }
    const [userTagState, setUserTagState] = useState<UserTag>({
        modalVisible: false,
        search: "",
        queryUsers: [],
        taggedUsers: [],
    });
    let searchedUserCount: number = 0;

    const [error, setError] = useState<any>({title: "", caption: "", photo: ""});
   
    // USE EFFECT: SEARCH USERS
    useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await getSearchUsers(userTagState.search);
                searchedUserCount = users.users.length + 1;
                setUserTagState({...userTagState, queryUsers: users.users});
            } catch (error) {
                console.error(error);
            }
        };

        if (userTagState.search.length > 0) {
            // Debounce the API call to avoid too many requests
            const timeoutId = setTimeout(() => {
                fetchData();
            }, 300);
            
            return () => clearTimeout(timeoutId);
        } else {
            setUserTagState({...userTagState, queryUsers: []});
        }
      }, [userTagState.search]);

      // USE EFFECT: LOAD TAGGED USERS
      useEffect(() => {
        const fetchData = async () => {
            try {
              var tagged_users = [];
              for (var i = 0; i < pinData.user_tags.length; i++) {
                const user = await getUser(pinData.user_tags[i]);
                tagged_users.push(user.user);
              }
              setUserTagState({...userTagState, taggedUsers: tagged_users});
            } catch (error) {
              console.error(error);
            }
        };

        fetchData();
      }, [JSON.stringify(pinData.user_tags)]);

      useEffect(() => {
        AsyncStorage.getItem("theme").then((value) => {
            if (value) {
                setTheme(value);
            }
        });
      }, []);

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
                setError({...error, photo: "An error occurred. Please try again."});
                console.log('Image picker error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                if (response.assets[0].fileSize && response.assets[0].fileSize > 7340032) { // 7 MB
                    setError({...error, photo: "File too large. Please upload a smaller file"});
                } else if (user_id && response.assets) {
                    setError({...error, photo: ""});
                    setPinData({...pinData, photo: response.assets[0].uri});
                } else {
                    navigation.navigate("Welcome");
                }
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
        if (!tag) {
            return (
            <TouchableOpacity key={searchedUserCount} onPress={() => {
                setUserTagState({...userTagState, search: ""})
                if (!pinData.user_tags.includes(user.user_id)) 
                    setPinData((prevData: any) => ({...prevData, user_tags: [...prevData.user_tags, user.user_id]}));
            }}>
                <View style={userSearchStyles.searchUserView}>
                    <Image 
                        source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                        style={{...userSearchStyles.searchUserPfp}} />
                    <View style={{...userSearchStyles.searchUserTextView}}>
                        <Text style={{...userSearchStyles.searchUserFullName, color: theme === 'dark' ? Colors.white : Colors.black}}>{user.full_name}</Text>
                        <Text style={{...userSearchStyles.searchUserUsernameText, color: theme === 'dark' ? Colors.mediumGray : Colors.black}}>{user.username}</Text>
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
                        {pinData.photo ? 
                        <TouchableOpacity onPress={openImagePicker} style={{width: wp('90%'), height: hp('50%')}}>
                            <Image source={{ uri: pinData.photo }} style={styles.pickPhoto} /> 
                        </TouchableOpacity>
                        : 
                        <TouchableOpacity onPress={openImagePicker} style={{...styles.pickPhotoContainer, backgroundColor: theme === 'dark' ? Colors.mediumGray : Colors.whiteGray}} >
                            <MaterialIcon name="add-a-photo" size={hp('5%')} />
                        </TouchableOpacity>
                        }
                        <Button 
                            title="NEXT" 
                            icon={<FontAwesome6Icon name="arrow-right-long" size={20} color={Colors.white} style={{ paddingLeft: wp('1%'), textAlign: 'center' }}/>}
                            color={Colors.white}
                            iconRight
                            iconContainerStyle={{ marginLeft: wp('2%') }}
                            titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'ChunkFive' }}
                            buttonStyle={{...styles.buttonStyle, backgroundColor: theme === 'dark' ? Colors.mediumOrange : Colors.darkOrange}}
                            containerStyle={styles.buttonContainerStyle} 
                            onPress={() => setStep(step + 1)} 
                            disabled={!pinData.photo}/>
                        {error.photo != "" && <Text style={styles.errorText}>{error.photo}</Text>} 
                    </View>
                )
            case 2:
                return (
                    <View style={styles.inputViewContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={{...styles.label, color: theme === 'dark' ? Colors.white : Colors.black}}>Title</Text>
                            <TextInput
                                value={pinData.title}
                                placeholder="Give a pin title"
                                style={{...styles.input, color: theme === 'dark' ? Colors.white : Colors.black}}
                                onChangeText={(text: string) => {setPinData({ ...pinData, title: text }); setError({...error, title: ""})}}
                                autoCapitalize="none"
                            />
                            {error.title != "" && <Text style={styles.errorText}>{error.title}</Text>}
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={{...styles.label, color: theme === 'dark' ? Colors.white : Colors.black}}>Caption</Text>
                            <TextInput
                                value={pinData.caption}
                                placeholder="Write a caption..."
                                style={{...styles.input, height: hp('12.5%'), color: theme === 'dark' ? Colors.white : Colors.black}}
                                onChangeText={(text: string) => {setPinData({ ...pinData, caption: text }); setError({...error, caption: ""})}}
                                autoCapitalize="none"
                                multiline={true}
                                textAlignVertical="top"
                            />
                            {error.caption != "" && <Text style={styles.errorText}>{error.caption}</Text>}
                        </View>

                        <TouchableOpacity onPress={() => {setVisibilityModal(true)}} style={{...styles.visibilityInputView}}>
                            <Text style={{...styles.visibilityTitleText, fontWeight: '700'}}>Visibility</Text>
                            <Text style={styles.visibilityText}>{getVisibilityString(pinData.visibility)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {setUserTagState({...userTagState,modalVisible: true, search: "", queryUsers: []})}} style={{...styles.userTagsInputView}}>
                            <Text style={{...styles.visibilityTitleText, fontWeight: '700'}}>Tagged Users</Text>
                            <Text style={styles.userTagsText}>{userTagDisplayText()}</Text>
                        </TouchableOpacity>  

                        <View style={styles.locationTagsView}>
                            <Text style={{...styles.locationTagsText, color: theme === 'dark' ? Colors.white : Colors.black}}>Location Tags</Text>
                            <View style={styles.locationTagsButtonView}>
                                <Button 
                                    title="Edit"
                                    icon={<MaterialIcon name="edit" size={hp('2%')} color={Colors.black} style={{ marginRight: 2 }}/>}
                                    color={Colors.black}
                                    iconContainerStyle={{ marginRight: 2 }}
                                    titleStyle={{ color: Colors.black, fontFamily: 'Futura', fontSize: 15 }}
                                    buttonStyle={{...styles.locationTagsAddButton, backgroundColor: theme === 'dark' ? Colors.mediumGray : Colors.whiteGray}}
                                    containerStyle={styles.locationTagsAddButtonContainer} 
                                    onPress={() => setlocationTagsModal(true)}/>
                                {pinData.location_tags.map((tag:string, index:number) => {
                                    return (
                                        <Button 
                                            title={tag} 
                                            key={index}
                                            buttonStyle={styles.locationTagButton} 
                                            titleStyle={{ color: Colors.darkGray, fontFamily: 'Futura', fontSize: 15 }}/>
                                    )
                                })}
                            </View>
                        </View>
                        
                        <Button 
                            title="Add Pin" 
                            icon={<MaterialIcon name="person-pin-circle" size={hp('3%')} color={Colors.white} style={{ marginLeft: wp('1%') }} />}
                            color={Colors.white}
                            iconRight
                            iconContainerStyle={{ marginLeft: wp('1%') }}
                            titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'ChunkFive' }}
                            buttonStyle={{...styles.buttonStyle, backgroundColor: theme === 'dark' ? Colors.mediumOrange : Colors.darkOrange}}
                            containerStyle={styles.buttonContainerStyle} 
                            onPress={
                                async () => {
                                    try {
                                        if (pinData.title.length == 0 || pinData.title.length > 30) {
                                            setError({...error, title: "Title must be between 1 and 30 characters"});
                                        } else if (pinData.caption.length > 250) {
                                            setError({...error, caption: "Caption must be less than 250 characters"});
                                        } else {
                                            const user_id = await AsyncStorage.getItem("user_id");
                                            if (user_id) {
                                                const pinInput = {...pinData, latitude: lat_long[0], longitude: lat_long[1]};
                                                const formData = new FormData();
                                                formData.append('photo', {
                                                    uri: pinData.photo,
                                                    type: 'image/jpeg',
                                                    name: user_id + '.jpg',
                                                });
                                                
                                                await addPin(user_id, pinInput, formData);
                                                navigation.navigate("NavBar", { screen: 'Map' });
                                            } else {
                                                navigation.navigate("Welcome");
                                            }
                                        }
                                    } catch (error) {
                                        console.log(error);
                                    }
                                }
                            } /> 
                    </View>
                )
        }
    }
    return (
        <ScrollView contentContainerStyle={{flex: 1, backgroundColor: theme === 'dark' ? Colors.darkBackground : Colors.white}}>
            {renderStep(step)}
            <Modal 
                isVisible={userTagState.modalVisible} 
                onBackdropPress={() => setUserTagState({...userTagState, modalVisible: false})}
                style={userTagsStyles.userTagsModal} >
                <View style={{...userTagsStyles.userTagsModalView, backgroundColor: theme === 'dark' ? Colors.darkBackground : Colors.white}}>
                    <View style={userTagsStyles.userTagsModalHeader}>
                        <Text style={{...userTagsStyles.userTagsModalTitle, color: theme === 'dark' ? Colors.white : Colors.black}}>Tag Users</Text>
                        <Entypo name="cross" size={hp('2.5%')} color={Colors.mediumGray} onPress={() => setUserTagState({...userTagState, modalVisible: false})} style={{position: 'absolute', left: wp('45%')}}/>
                    </View>
                    <SearchBar 
                        placeholder='Search...'
                        value={userTagState.search}
                        round={true}
                        autoCapitalize="none"
                        autoCorrect={false}
                        lightTheme={theme === 'light'}
                        containerStyle={{...userSearchStyles.searchBarContainer, width: wp('80%')}}
                        onChangeText={(text) => setUserTagState({...userTagState, search: text})}/>
                    {userTagState.search.length === 0 && pinData.user_tags.length > 0 && <Text style={{...userTagsStyles.userTagsModalText, color: theme === 'dark' ? Colors.white : Colors.black}}>Tagged</Text>}
                    <ScrollView style={{width: '100%', flex: 1}}>
                        { userTagState.search.length > 0 ?
                            <View style={{flex: 0.8}}>
                                { userTagState.queryUsers && userTagState.queryUsers.length > 0 && userTagState.queryUsers.map((user: any) => (
                                    userView(user, false)
                                ))}
                            </View> 
                            : 
                            <View style={{flex: 0.8}}>
                                {userTagState.taggedUsers && userTagState.taggedUsers.length > 0 && userTagState.taggedUsers.map((user: any, index: number) => (
                                <View style={userSearchStyles.searchUserView} key={index}>
                                    <Image 
                                        source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                                        style={{...userSearchStyles.searchUserPfp}} />
                                    <View style={{...userSearchStyles.searchUserTextView, flex: 0.85}}>
                                        <Text style={{...userSearchStyles.searchUserFullName, color: theme === 'dark' ? Colors.white : Colors.black}}>{user.full_name}</Text>
                                        <Text style={{...userSearchStyles.searchUserUsernameText, color: theme === 'dark' ? Colors.mediumGray : Colors.black}}>{user.username}</Text>
                                    </View>
                                    <TouchableOpacity style={{flex: 0.1, marginRight: 3}} onPress={() => {
                                        setPinData((prevData: any) => ({...prevData, user_tags: prevData.user_tags.filter((tag_id: string) => 
                                            tag_id !== user.user_id
                                        )}))
                                    }}>
                                        <Entypo name="cross" size={hp('3%')} color={Colors.mediumGray} />
                                    </TouchableOpacity>
                                </View> 
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
                <View style={{...styles.visibilityModalView, backgroundColor: theme === 'dark' ? Colors.darkBackground : Colors.white}}>
                    <Text style={{...styles.visibilityModalTitle, color: theme === 'dark' ? Colors.white : Colors.black}}>Select visibility</Text>
                    <TouchableOpacity style={styles.visibilityModalSubview} 
                        onPress={() => {
                            setPinData({ ...pinData, visibility: 0});
                            setVisibilityModal(false);
                        }}>
                        <MaterialIcon name="lock" size={hp('3%')} style={{ flex: 0.25}} color={theme === 'dark' ? Colors.white : Colors.black}/>
                        <Text style={{...styles.visibilityModalSubviewText, color: theme === 'dark' ? Colors.white : Colors.black}}>Private</Text>
                        <Icon name="checkmark-sharp" size={hp('3%')} color={Colors.mediumOrange} style={pinData.visibility === 0 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                    </TouchableOpacity>
                    <View style={styles.horizontalLine} />
                    
                    <TouchableOpacity style={styles.visibilityModalSubview} 
                        onPress={() => {
                            setPinData({ ...pinData, visibility: 1});
                            setVisibilityModal(false);
                        }}>
                        <MaterialIcon name="people-alt" size={hp('3%')} style={{ flex: 0.25}} color={theme === 'dark' ? Colors.white : Colors.black}/>
                        <Text style={{...styles.visibilityModalSubviewText, color: theme === 'dark' ? Colors.white : Colors.black}}>Friends</Text>
                        <Icon name="checkmark-sharp" size={hp('3%')} color={Colors.mediumOrange} style={pinData.visibility === 1 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                    </TouchableOpacity>
                    <View style={styles.horizontalLine} />
                    
                    <TouchableOpacity style={styles.visibilityModalSubview} 
                        onPress={() => {
                            setPinData({ ...pinData, visibility: 2});
                            setVisibilityModal(false);
                        }}>
                        <MaterialIcon name="public" size={hp('3%')} style={{ flex: 0.25}} color={theme === 'dark' ? Colors.white : Colors.black}/>
                        <Text style={{...styles.visibilityModalSubviewText, color: theme === 'dark' ? Colors.white : Colors.black}}>Public</Text>
                        <Icon name="checkmark-sharp" size={hp('3%')} color={Colors.mediumOrange} style={pinData.visibility === 2 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal 
                isVisible={locationTagsModal} 
                onBackdropPress={() => setlocationTagsModal(false)}
                style={styles.locationTagsModal} >
                <View style={{...styles.locationTagsModalView, backgroundColor: theme === 'dark' ? Colors.darkBackground : Colors.white}}>
                    <Text style={{...styles.locationTagsModalTitle, color: theme === 'dark' ? Colors.white : Colors.black}}>Select location tags</Text>
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
                                        <Text style={{...styles.locationTagsModalText, color: theme === 'dark' ? Colors.white : Colors.black}}>{tag}</Text>
                                        <Icon name="checkmark-sharp" size={hp('3%')} color={Colors.mediumOrange} style={pinData.location_tags.includes(tag) ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
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
        padding: hp('1%'),
    },
    inputContainer: {
        marginVertical: hp('2%'),
        width: wp('90%'),
    },
    label: {
        color: Colors.darkGray,
        fontFamily: 'Futura',
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4,
    },
    input: {
        height: hp('4%'),
        borderColor: "gray",
        borderWidth: hp('0.2%'),
        borderRadius: hp('0.4%'),
        paddingHorizontal: wp('1.5%'),
    },
    buttonStyle: {
        backgroundColor: Colors.darkOrange,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: hp('3%'),
    },
    buttonContainerStyle: {
        width: wp('75%'),
        marginHorizontal: wp('10%'),
        marginTop: hp('4%'),
    },
    pickPhotoContainer: {
        width: wp('90%'),
        height: wp('90%'),
        borderWidth: 2,
        borderColor: Colors.mediumOrange,
        backgroundColor: Colors.whiteGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp('3%'),
        marginTop: hp('3%'),
    },
    pickPhoto: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        justifyContent: 'center',
        alignItems: 'center',
    },
    visibilityInputView: {
        width: wp('90%'),
        padding: hp('1.5%'),
        borderRadius: hp('1%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('2%'),
        backgroundColor: Colors.whiteOrange,
    },
    visibilityTitleText: {
        fontSize: 13,
        color: Colors.black,
        fontFamily: 'Futura',
        marginLeft: wp('1%')
    },
    visibilityText: {
        color: Colors.darkGray,
        fontFamily: 'Futura',
        marginRight: wp('1%')
    },
    visibilityModal: {
        justifyContent: 'center',
    },
    visibilityModalView: {
        backgroundColor: 'white',
        padding: hp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp('1%'),
        flex: 0.5,
    },
    visibilityModalTitle: {
        fontSize: 20,
        marginTop: hp('1%'),
        marginBottom: hp('2%'),
        fontFamily: 'Futura',
    },
    visibilityModalSubview: {
        flex: 1,
        flexDirection: 'row',
        padding: hp('1%'),
        alignItems: 'center',
    },
    visibilityModalSubviewText: {
        flex: 0.65,
        marginLeft: wp('2%'),
        fontSize: 18,
        fontFamily: 'Futura',
    },
    horizontalLine: {
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignSelf: 'center',
        width: '100%',
    },
    locationTagsView: {
        marginTop: hp('3%'),
        marginLeft: wp('2%'),
        alignSelf: 'flex-start',
    },
    locationTagsText: {
        fontSize: 14,
        fontFamily: 'Futura',
        fontWeight: '700',
        color: Colors.black,
        marginBottom: hp('1.5%'),
    },
    locationTagsAddButton: {
        backgroundColor: Colors.whiteGray,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: hp('2%'),
    },
    locationTagsAddButtonContainer: {
        width: wp('17.5%'),
    },
    locationTagsButtonView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: hp('0.5%'),
        rowGap: hp('0.5%'),
    },
    locationTagsModal: {
        justifyContent: 'center',
    },
    locationTagsModalView: {
        backgroundColor: 'white',
        padding: hp('2%'),
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: hp('1%'),
        flex: 0.6,
    },
    locationTagsModalTitle: {
        fontSize: 20,
        fontFamily: 'Futura'
    },
    locationTagsModalOpacity: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: hp('2%'),
    },
    locationTagsModalText: {
        fontSize: 20,
        flex: 0.5
    },
    locationTagButton: {
        backgroundColor: Colors.whiteOrange,
        borderWidth: 0,
        borderRadius: hp('2%'),
    }, 
    userTagsInputView: {
        width: wp('90%'),
        padding: hp('1.5%'),
        borderRadius: hp('1%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('3%'),
        backgroundColor: Colors.whiteOrange,
    },
    userTagsTitleText: {
        color: Colors.black,
        fontFamily: 'Futura',
        marginLeft: wp('1%')
    },
    userTagsText: {
        color: Colors.darkGray,
        fontFamily: 'Futura',
        marginRight: wp('1%')
    },
    errorText: {
        color: Colors.errorRed,
        marginTop: hp('1%'),
        textAlign: 'center',
        justifyContent: 'center',
    },
})