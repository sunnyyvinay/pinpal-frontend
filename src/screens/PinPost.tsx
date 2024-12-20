import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { addPinLike, deletePinLike, getPin, getPinLikes, getSearchUsers, getUser } from '../services/user.service';
import { useRoute } from '@react-navigation/native';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Colors from '../constants/colors';
import { Button, Divider, Input, SearchBar } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from "react-native-modal";
import { deletePin, updatePin } from '../services/user.service';
import { locationTags, getLocationTagIcon } from '../constants/locationtags';
import userSearchStyles from '../styles/usersearch';
import Entypo from 'react-native-vector-icons/Entypo';
import userTagsStyles from '../styles/usertags';
import { ImagePickerResponse, launchImageLibrary, MediaType } from 'react-native-image-picker';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const PinPost = (props:any) => {
    const { pin_id, pin_user_id } = props.route.params;
    const [pinData, setPinData] = useState<any>({
      title: "",
      caption: "",
      create_date: undefined,
      edit_date: undefined,
      photo: "",
      location_tags: [],
      visibility: 1,
      user_tags: []
    });
    const [pinUserData, setPinUserData] = useState<any>({
      username: "",
      profile_pic: ""
    });

    const [personal, setPersonal] = useState<boolean>(false);
    const [pinActionModalVisible, setPinActionModalVisible] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editedPinData, setEditedPinData] = useState<any>({
      title: "",
      caption: "",
      create_date: undefined,
      edit_date: undefined,
      photo: "",
      location_tags: [],
      visibility: 1,
      user_tags: []
    });

    const [editPinVisibility, setEditPinVisibility] = useState<boolean>(false);
    const [editPinLocationTags, setEditPinLocationTags] = useState<boolean>(false);
    type UserTag = {
      modalVisible: boolean;
      search: string;
      queryUsers: any[];
      taggedUsers: any[];
      editedTaggedUsers: any[];
    }
    const [userTagState, setUserTagState] = useState<UserTag>({
      modalVisible: false,
      search: "",
      queryUsers: [],
      taggedUsers: [],
      editedTaggedUsers: []
    });
    let searchedUserCount: number = 0;

    const [likes, setLikes] = useState<any>({
      liked: false,
      count: 0
    });

    const [error, setError] = useState<any>({title: "", caption: "", photo: ""});

    const { width: screenWidth } = Dimensions.get('window');

    useEffect(() => {
      const getInfo = async () => {
        const user_id = await AsyncStorage.getItem("user_id");
        if (user_id) {
            setPersonal(user_id === pin_user_id);
        } else {
            props.navigation.navigate("Welcome");
        }

        const pin_data = await getPin(pin_user_id, pin_id);
        const userData = await getUser(pin_user_id);
        setPinData(pin_data.pin);
        setEditedPinData(pin_data.pin);
        setPinUserData(userData.user);

        const pinLikesData = await getPinLikes(pin_id);
        var userLiked: boolean = false;
        if (pinLikesData && pinLikesData.likes) {
          for (let i = 0; i < pinLikesData.likes.length; i++) {
            if (pinLikesData.likes[i].user_id === user_id) {
              userLiked = true;
              break;
            }
          }
          setLikes({liked: userLiked, count: pinLikesData.likes.length});
        }
      }

      getInfo();
    }, []);

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

    useEffect(() => {
      const fetchTaggedUsers = async () => {
        try {
          var tagged_users = [];
          for (var i = 0; i < pinData.user_tags.length; i++) {
            const user = await getUser(pinData.user_tags[i]);
            tagged_users.push(user.user);
          }
          var edited_tagged_users = [];
          for (var i = 0; i < editedPinData.user_tags.length; i++) {
            const user = await getUser(editedPinData.user_tags[i]);
            edited_tagged_users.push(user.user);
          }
          setUserTagState({...userTagState, taggedUsers: tagged_users, editedTaggedUsers: edited_tagged_users});
        } catch (error) {
          console.error(error);
        }
        
      }
      fetchTaggedUsers();
      
    }, [JSON.stringify(pinData.user_tags), JSON.stringify(editedPinData.user_tags)]);

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
                setEditedPinData({...editedPinData, photo: response.assets[0].uri});
            } else {
                props.navigation.navigate("Welcome");
              }
          } 
      });
  };

    function formatTimestamp(timestamp: string): string {
      const date = new Date(timestamp);
  
      const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      };
  
      return date.toLocaleDateString('en-US', options);
  }

  const pinActionModal = () => {
    return (
      <Modal 
        isVisible={pinActionModalVisible}
        onBackdropPress={() => {setEditPinVisibility(false); setPinActionModalVisible(false);}} 
        style={styles.pinActionModalStyle}>
          {editPinVisibility ?
            (<View style={styles.pinActionModalView}>
              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={async () => {
                  setPinData({...pinData, visibility: 0});
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 0}, null);
                  setPinActionModalVisible(false);
                  setEditPinVisibility(false);
                }}>
                  <MaterialIcon name="lock" size={hp('2.5%')} style={{ flex: 0.25}}/>
                  <Text style={{...styles.pinActionModelSubviewText, flex: 0.65}}>Private</Text>
                  <Icon name="checkmark-sharp" size={hp('2.5%')} color={Colors.mediumOrange} style={pinData.visibility === 0 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
              </TouchableOpacity>
              <View style={styles.horizontalLine} />

              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={async () => {
                  setPinData({...pinData, visibility: 1});
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 1}, null);
                  setPinActionModalVisible(false);
                  setEditPinVisibility(false);
                }}>
                  <MaterialIcon name="people-alt" size={hp('2.5%')} style={{ flex: 0.25}}/>
                  <Text style={{...styles.pinActionModelSubviewText, flex: 0.65}}>Friends</Text>
                  <Icon name="checkmark-sharp" size={hp('2.5%')} color={Colors.mediumOrange} style={pinData.visibility === 1 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
              </TouchableOpacity>
              <View style={styles.horizontalLine} />

              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={async () => {
                  setPinData({...pinData, visibility: 2});
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 2}, null);
                  setPinActionModalVisible(false);
                  setEditPinVisibility(false);
                }}>
                  <MaterialIcon name="public" size={hp('2.5%')} style={{ flex: 0.25}}/>
                  <Text style={{...styles.pinActionModelSubviewText, flex: 0.65}}>Public</Text>
                  <Icon name="checkmark-sharp" size={hp('2.5%')} color={Colors.mediumOrange} style={pinData.visibility === 2 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
              </TouchableOpacity>
          </View>) 
          :
          (<View style={styles.pinActionModalView}>
              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={() => {
                  setPinActionModalVisible(false);
                  setEditMode(true);
                }}>
                  <MaterialIcon name="edit" size={hp('2%')} color={Colors.black} />
                  <Text style={styles.pinActionModelSubviewText}>Edit pin</Text>
              </TouchableOpacity>
              <View style={styles.horizontalLine} />

              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={() => {
                  setEditPinVisibility(true);
                }}>
                  <MaterialIcon name="visibility" size={hp('2%')} color={Colors.black} />
                  <Text style={styles.pinActionModelSubviewText}>Change visibility</Text>
              </TouchableOpacity>
              <View style={styles.horizontalLine} />

              <TouchableOpacity style={styles.pinActionModelSubview} 
                onPress={async () => {
                  await deletePin(pin_user_id, pin_id); 
                  setPinActionModalVisible(false); 
                  props.navigation.navigate("NavBar", { screen: 'Map' }); 
                }}>
                  <MaterialIcon name="delete-outline" size={20} color={Colors.errorRed} />
                  <Text style={{...styles.pinActionModelSubviewText, color: Colors.errorRed}}>Delete pin</Text>
              </TouchableOpacity>
          </View>)
          }
          
      </Modal>
    )
  }

  const editLocationTagsModal = () => {
    return (
      <Modal 
        isVisible={editPinLocationTags} 
        onBackdropPress={() => setEditPinLocationTags(false)}
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
                                    if (editedPinData.location_tags.includes(tag)) {
                                        setEditedPinData({...editedPinData, location_tags: editedPinData.location_tags.filter((item:string) => item !== tag)});
                                    } else {
                                        setEditedPinData({...editedPinData, location_tags: [...editedPinData.location_tags, tag]});
                                    }
                                }}>
                                {getLocationTagIcon(tag)}
                                <Text style={styles.locationTagsModalText}>{tag}</Text>
                                <Icon name="checkmark-sharp" size={hp('2.5%')} color={Colors.mediumOrange} style={editedPinData.location_tags.includes(tag) ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
                            </TouchableOpacity>
                            <View style={styles.horizontalLine} />
                        </View>
                    )
                })}
            </View>
        </View>
    </Modal>
    )
  }

  const userView = (user: any, tag: boolean) => {
    searchedUserCount--;
    if (!tag) {
        return (
        <TouchableOpacity key={searchedUserCount} onPress={() => {
            setUserTagState({...userTagState, search: ""})
            if (!editedPinData.user_tags.includes(user.user_id)) 
                setEditedPinData((prevData: any) => ({...prevData, user_tags: [...prevData.user_tags, user.user_id]}));
        }}>
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

  const editUserTagsModal = () => {
    return (
      <Modal 
        isVisible={userTagState.modalVisible} 
        onBackdropPress={() => setUserTagState({...userTagState, modalVisible: false})}
        style={userTagsStyles.userTagsModal} >
        <View style={userTagsStyles.userTagsModalView}>
            <View style={userTagsStyles.userTagsModalHeader}>
                <Text style={userTagsStyles.userTagsModalTitle}>Tag Users</Text>
                <Entypo name="cross" size={hp('2.5%')} color={Colors.mediumGray} onPress={() => setUserTagState({...userTagState, modalVisible: false})} style={{position: 'absolute', left: wp('45%')}}/>
            </View>
            <SearchBar 
                placeholder='Search...'
                value={userTagState.search}
                round={true}
                autoCapitalize="none"
                lightTheme={true}
                containerStyle={{...userSearchStyles.searchBarContainer, width: wp('80%')}}
                onChangeText={(text) => setUserTagState({...userTagState, search: text})}/>
            {userTagState.search.length === 0 && editedPinData.user_tags.length > 0 && <Text style={userTagsStyles.userTagsModalText}>Tagged</Text>}
            <ScrollView style={{width: '100%', flex: 1}}>
                { userTagState.search.length > 0 ?
                    <View style={{flex: 0.8}}>
                        { userTagState.queryUsers && userTagState.queryUsers.length > 0 && userTagState.queryUsers.map((user: any) => (
                            userView(user, false)
                        ))}
                    </View> 
                    : 
                    <View style={{flex: 0.8}}>
                        {userTagState.editedTaggedUsers && userTagState.editedTaggedUsers.length > 0 && userTagState.editedTaggedUsers.map((user: any, index: number) => (
                        <View style={userSearchStyles.searchUserView} key={index}>
                            <Image 
                                source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                                style={{...userSearchStyles.searchUserPfp, flex: 0.1}} />
                            <View style={{...userSearchStyles.searchUserTextView, flex: 0.8}}>
                                <Text style={userSearchStyles.searchUserFullName}>{user.full_name}</Text>
                                <Text style={userSearchStyles.searchUserUsernameText}>{user.username}</Text>
                            </View>
                            <TouchableOpacity style={{flex: 0.1, marginRight: wp('2%')}} onPress={() => {
                                setEditedPinData((prevData: any) => 
                                  ({...prevData, user_tags: prevData.user_tags.filter((tag_id: string) => tag_id !== user.user_id)}))
                            }}>
                                <Entypo name="cross" size={hp('2.5%')} color={Colors.mediumGray} />
                            </TouchableOpacity>
                        </View> 
                        ))}
                    </View>
                }
            </ScrollView>
        </View>
    </Modal>
    )
  }

  return (
    <ScrollView style={{backgroundColor: Colors.white}}>
      <View style={styles.topView}>
        <TouchableOpacity style={styles.userView} onPress={() =>props.navigation.navigate('Profile', {user_id: pinUserData.user_id})}>
          <Image source={pinUserData.profile_pic ? {uri: pinUserData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
          <Text style={styles.usernameText}>{pinUserData.username}</Text>
        </TouchableOpacity>

        {personal && !editMode ? 
        <TouchableOpacity onPress={() => setPinActionModalVisible(true)}>
          <MaterialCommunityIcons name="dots-vertical-circle" size={hp('3%')} color={Colors.mediumGray} />
        </TouchableOpacity>
        : null}
      </View>

      <View style={styles.postView}>
        {editMode ?
        <>
          <TextInput
              value={editedPinData.title}
              placeholder='Enter new pin title'
              autoCapitalize='none'
              onChangeText={text => {setEditedPinData({...editedPinData, title: text}); setError({...error, title: ""})}}
              style={styles.editTitleInput}
          />
          {error.title != "" && <Text style={styles.errorText}>{error.title}</Text>}
        </>
          : 
           <Text style={styles.pinTitleText}>{pinData.title}</Text>
        }

        <View style={styles.photosView}>
          {editMode ?
            <TouchableOpacity onPress={openImagePicker} style={{justifyContent: 'center'}}>
              <Image source={editedPinData.photo && {uri: editedPinData.photo}} style={{width: screenWidth, height: hp('20%'), opacity: 0.75}} />
              <MaterialIcon name="add-a-photo" size={hp('5%')} style={{position: 'absolute', alignSelf: 'center', opacity: 0.75}} />
              <Text style={styles.errorText}>{error.photo}</Text>
            </TouchableOpacity>
            :
            <Image source={pinData.photo && {uri: pinData.photo}} style={{width: screenWidth, height: hp('20%')}}/>
          }
        </View>
        
        {editMode ?
        <>
        <TextInput
          value={editedPinData.caption}
          placeholder="Write a caption..."
          style={styles.editCaptionInput}
          onChangeText={text => {setEditedPinData({...editedPinData, caption: text}); setError({...error, caption: ""})}}
          autoCapitalize="none"
          multiline={true}
          textAlignVertical="top" />
        {error.caption != "" && <Text style={styles.errorText}>{error.caption}</Text>}
        </>
            
        :
          <View style={styles.captionView}>
            <Text style={{textAlign: 'center'}}>
              <Text style={styles.createDateText}>{formatTimestamp(pinData.create_date)}</Text>
              <Text style={styles.captionText}>{pinData.caption ? " - \"" + pinData.caption + "\"" : null}</Text>
            </Text>
          </View>
        }

        {/* User Tags */}
        {editMode ? 
        <View style={styles.locationTagsButtonView}>
          <Button 
            title={editedPinData.user_tags.length > 0 ? "Edit user tags" : "Add user tags"}
            icon={<MaterialIcon name="edit" size={hp('1.5%')} color={Colors.black} style={{ marginRight: wp('0.5%') }}/>}
            color={Colors.black}
            iconContainerStyle={{ marginRight: wp('0.5%') }}
            titleStyle={{ color: Colors.black, fontFamily: 'Futura', fontSize: 15 }}
            buttonStyle={styles.locationTagsAddButton}
            containerStyle={{...styles.locationTagsAddButtonContainer}} 
            onPress={() => {setUserTagState({...userTagState, modalVisible: true})}} />  
            {userTagState.editedTaggedUsers && userTagState.editedTaggedUsers.length > 0 && userTagState.editedTaggedUsers.map((user:any, index:number) => {
              return (
                <TouchableOpacity style={styles.taggedUserIndivView} key={index} onPress={() => props.navigation.navigate('Profile', {user_id: user.user_id})}>
                  <Image source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.taggedUserPfp} />
                  <Text style={styles.taggedUserText}>{user.username}</Text>
                </TouchableOpacity>
              )
          })}
        </View>
        : 
        <View>
          {userTagState.taggedUsers && userTagState.taggedUsers.length > 0 &&
        <View style={styles.locationTagsButtonView}>
        {userTagState.taggedUsers && userTagState.taggedUsers.length > 0 && userTagState.taggedUsers.map((user:any, index:number) => {
            return (
              <TouchableOpacity style={styles.taggedUserIndivView} key={index} onPress={() => props.navigation.navigate('Profile', {user_id: user.user_id})}>
                <Image source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.taggedUserPfp} />
                <Text style={styles.taggedUserText}>{user.username}</Text>
              </TouchableOpacity>
            )
        })}
        </View>
        }
        </View>
        }
      
        {/* Location Tags */}
        {editMode ? 
        <View style={styles.locationTagsButtonView}>
          <Button 
            title={editedPinData.location_tags.length > 0 ? "Edit location tags" : "Add location tags"}
            icon={<MaterialIcon name="edit" size={hp('1.5%')} color={Colors.black} style={{ marginRight: wp('0.5%') }}/>}
            color={Colors.black}
            iconContainerStyle={{ marginRight: wp('0.5%') }}
            titleStyle={{ color: Colors.black, fontFamily: 'Futura', fontSize: 15 }}
            buttonStyle={styles.locationTagsAddButton}
            containerStyle={styles.locationTagsAddButtonContainer} 
            onPress={() => {setEditPinLocationTags(true)}} />  
            {editedPinData.location_tags.map((tag:string, index:number) => {
              return (
                <Button 
                  title={tag} 
                  key={index}
                  buttonStyle={styles.locationTagButton}
                  titleStyle={{ color: Colors.darkGray, fontFamily: 'Futura', fontSize: 15 }} />
              )
          })}
        </View>
        :
        <View>
        {pinData.location_tags.length > 0 &&
        <View style={styles.locationTagsButtonView}>
        {pinData.location_tags.length > 0 && pinData.location_tags.map((tag:string, index:number) => {
            return (
              <Button 
                title={tag} 
                key={index}
                buttonStyle={styles.locationTagButton}
                titleStyle={{ color: Colors.darkGray, fontFamily: 'Futura', fontSize: 15 }} />
            )
        })}
        </View>
        }
        </View>
        }
        
        {editMode ? null : 
        <View style={styles.likesView}>
          <TouchableOpacity onPress={async () => {
            const user_id = await AsyncStorage.getItem("user_id");
            if (likes.liked) {
              setLikes({liked: false, count: likes.count - 1});
              await deletePinLike(user_id, pin_id);
            } else {
              setLikes({liked: true, count: likes.count + 1});
              await addPinLike(user_id, pin_id);
            }
          }}>
            {likes.liked ? <Icon name="heart" size={hp('3%')} color={Colors.mediumOrange} /> : <Icon name="heart-outline" size={hp('3%')} color={Colors.black} />}
          </TouchableOpacity>
          {likes.liked ? 
            <Text style={{...styles.likesText, color: Colors.mediumOrange}} onPress={() => {props.navigation.navigate('UserList', {id: pin_id, type: "Likes"})}}>{likes.count === 1 ? (likes.count + " like") : (likes.count + " likes")}</Text> 
            : 
            <Text style={{...styles.likesText, color: Colors.black}} onPress={() => {props.navigation.navigate('UserList', {id: pin_id, type: "Likes"})}}>{likes.count === 0 ? "Like" : likes.count}</Text>}
        </View>
        }
      </View>

      {editMode ? 
      <View style={styles.editButtonsView}>
        <Button 
          title="Cancel"
          color={Colors.black}
          titleStyle={{ color: Colors.white, fontWeight: '500', fontFamily: 'ChunkFive', fontSize: 14 }}
          buttonStyle={styles.cancelEditButton}
          containerStyle={styles.cancelEditButtonContainer} 
          onPress={ () => {
            setEditedPinData(pinData);
            setEditMode(false);
          }} />
        <Button 
          title="Save" 
          color={Colors.white}
          titleStyle={{ color: Colors.white, fontWeight: '500', fontFamily: 'ChunkFive', fontSize: 14 }}
          buttonStyle={styles.saveEditButton}
          containerStyle={styles.saveEditButtonContainer} 
          onPress={
              async () => {
                  if (editedPinData.title.length === 0 || editedPinData.title.length > 50) {
                      setError({...error, title: "Title must be between 1 and 50 characters"});
                  } else if (editedPinData.caption.length > 100) {
                      setError({...error, caption: "Caption must be less than 100 characters"});
                  } else {
                    const user_id = await AsyncStorage.getItem("user_id");
                    const formData = new FormData();
                    formData.append('photo', {
                        uri: editedPinData.photo,
                        type: 'image/jpeg',
                        name: user_id + '.jpg',
                    });
                    await updatePin(pin_user_id, pin_id, editedPinData, formData);
                    setPinData(editedPinData);
                    setEditMode(false);
                  }
              }
          }/>
      </View>
      : null
      }

      {pinActionModal()}
      {editLocationTagsModal()}
      {editUserTagsModal()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  topView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: wp('2%'),
    marginVertical: hp('1.5%'),
  },
  userView: {
    flex: 0.99,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfpImage: {
    width: hp('4%'),
    height: hp('4%'),
    borderRadius: hp('5%'),
    borderWidth: hp('0.2%'),
    borderColor: Colors.mediumOrange,
    alignSelf: 'center',
  },
  usernameText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Futura',
    marginLeft: wp('1%'),
  },
  postView: {
    backgroundColor: Colors.white,
  },
  pinTitleText: {
    textAlign: 'center',
    fontFamily: 'ChunkFive',
    fontSize: 24,
    color: Colors.mediumOrange,
    marginBottom: hp('0.5%'),
    flexWrap: 'wrap',
  },
  likesView: {
    alignItems: 'center',
    marginVertical: 10,
  },
  likesText: {
    marginTop: hp('0.5%'),
    marginHorizontal: wp('1%'),
    fontSize: 16,
    fontFamily: 'Futura',
  },
  photosView: {
    marginTop: hp('0.5%'),
    marginBottom: hp('0.5%'),
  },
  captionView: {
    borderWidth: 0,
    borderRadius: hp('2%'),
    marginVertical: hp('0.5%'),
    marginHorizontal: wp('4%'),
    padding: hp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionText: {
    fontSize: 18,
    fontFamily: 'Futura',
    color: Colors.black,
  },
  createDateText: {
    color: Colors.darkGray,
    fontSize: 18,
    fontFamily: 'Futura',
  },
  locationTagsButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: hp('0.5%'),
    rowGap: hp('0.5%'),
    marginVertical: hp('2%'),
  },
  locationTagButton: {
    backgroundColor: Colors.whiteOrange,
    borderWidth: 0,
    borderRadius: hp('2%'),
  },
  userTagButton: {
    backgroundColor: Colors.mediumOrange,
  },
  pinActionModalStyle: {
    justifyContent: 'flex-end',
  },
  pinActionModalView: {
    backgroundColor: 'white',
    padding: hp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: hp('1%'),
    flex: 0.3,
  },
  pinActionModelSubview: {
    flex: 1,
    flexDirection: 'row',
    padding: hp('1%'),
    alignItems: 'center',
  },
  pinActionModelSubviewText: {
    flex: 0.99,
    marginLeft: wp('4%'),
    fontSize: 18,
    fontFamily: 'Futura',
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: '100%',
  },
  editButtonsView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: wp('2%'),
    marginTop: hp('2%'),
  },
  cancelEditButton: {
    backgroundColor: Colors.darkGray,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: hp('1%'),
  },
  cancelEditButtonContainer: {
    width: wp('40%'),
  },
  saveEditButton: {
    backgroundColor: Colors.darkOrange,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: hp('1%'),
  },
  saveEditButtonContainer: {
    width: wp('40%'),
  },
  editTitleInput: {
    width: wp('90%'),
    borderColor: Colors.mediumGray,
    borderWidth: hp('0.2%'),
    borderRadius: hp('0.4%'),
    textAlign: 'center',
    alignSelf: 'center',
    color: Colors.black,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Futura',
    marginVertical: hp('0.5%'),
    marginTop: hp('2%'),
  },
  editCaptionInput: {
      height: hp('10%'),
      borderColor: Colors.mediumGray,
      borderWidth: hp('0.2%'),
      borderRadius: hp('0.4%'),
      paddingHorizontal: wp('1.5%'),
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: 15,
      fontFamily: 'Futura',
      color: Colors.black,
      width: wp('90%'),
      marginTop: hp('1%'),
      marginBottom: hp('0.5%'),
  },
  locationTagsAddButton: {
    backgroundColor: Colors.whiteGray,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: hp('2%'),
  },
  locationTagsAddButtonContainer: {
    width: wp('45%'),
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
      marginVertical: hp('3%'),
  },
  locationTagsModalText: {
      fontSize: 18,
      flex: 0.65
  },
  taggedUserIndivView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp('1.5%'),
  },
  taggedUserPfp: {
    width: hp('4%'),
    height: hp('4%'),
    borderRadius: hp('5%'),
    borderWidth: hp('0.2%'),
    borderColor: Colors.mediumOrange,
    alignSelf: 'center',
  },
  taggedUserText: {
    color: Colors.mediumOrange, 
    fontFamily: 'Futura', 
    fontSize: 15,
    marginLeft: hp('1%'),
  },
  errorText: {
    color: Colors.errorRed,
    marginTop: hp('1%'),
    textAlign: 'center',
    justifyContent: 'center',
  },
})

export default PinPost;