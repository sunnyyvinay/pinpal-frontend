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
import Carousel from 'react-native-reanimated-carousel';
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

    interface PhotoItem {
      url: string;
    }
    const tempPhotos: PhotoItem[] = [
      {url: "https://images.unsplash.com/photo-1720802616209-c174c23f6565?q=80&w=2971&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
      {url: "https://images.unsplash.com/photo-1725733802754-c2a87bda47b2?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
    ];
    const [activePhotoSlide, setActivePhotoSlide] = useState<number>(0);
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

    const renderItem = ({ item }: { item: PhotoItem }) => {
      return (
        <View style={styles.slide}>
          <Image source={{ uri: item.url }} style={styles.image} />
        </View>
      );
    };
    const renderPagination = () => {
      return (
        <View style={styles.paginationContainer}>
          {tempPhotos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activePhotoSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      );
    };

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
                  setEditPinVisibility(false);
                  setPinActionModalVisible(false);
                }}>
                  <MaterialIcon name="lock" size={25} style={{ flex: 0.25}}/>
                  <Text style={{...styles.pinActionModelSubviewText, flex: 0.65}}>Private</Text>
                  <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 0 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
              </TouchableOpacity>
              <View style={styles.horizontalLine} />

              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={async () => {
                  setPinData({...pinData, visibility: 1});
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 1}, null);
                  setEditPinVisibility(false);
                  setPinActionModalVisible(false);
                }}>
                  <MaterialIcon name="people-alt" size={25} style={{ flex: 0.25}}/>
                  <Text style={{...styles.pinActionModelSubviewText, flex: 0.65}}>Friends</Text>
                  <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 1 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
              </TouchableOpacity>
              <View style={styles.horizontalLine} />

              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={async () => {
                  setPinData({...pinData, visibility: 2});
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 2}, null);
                  setEditPinVisibility(false);
                  setPinActionModalVisible(false);
                }}>
                  <MaterialIcon name="public" size={25} style={{ flex: 0.25}}/>
                  <Text style={{...styles.pinActionModelSubviewText, flex: 0.65}}>Public</Text>
                  <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={pinData.visibility === 2 ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
              </TouchableOpacity>
          </View>) 
          :
          (<View style={styles.pinActionModalView}>
              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={() => {
                  setPinActionModalVisible(false);
                  setEditMode(true);
                }}>
                  <MaterialIcon name="edit" size={20} color={Colors.black} />
                  <Text style={styles.pinActionModelSubviewText}>Edit pin</Text>
              </TouchableOpacity>
              <View style={styles.horizontalLine} />

              <TouchableOpacity style={styles.pinActionModelSubview}
                onPress={() => {
                  setEditPinVisibility(true);
                }}>
                  <MaterialIcon name="visibility" size={20} color={Colors.black} />
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
                                <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={editedPinData.location_tags.includes(tag) ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
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
                <Entypo name="cross" size={25} color={Colors.mediumGray} onPress={() => setUserTagState({...userTagState, modalVisible: false})} style={{position: 'absolute', left: '55%'}}/>
            </View>
            <SearchBar 
                placeholder='Search...'
                value={userTagState.search}
                round={true}
                autoCapitalize="none"
                lightTheme={true}
                containerStyle={userSearchStyles.searchBarContainer}
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
                            <TouchableOpacity style={{flex: 0.1, marginRight: 3}} onPress={() => {
                                setEditedPinData((prevData: any) => 
                                  ({...prevData, user_tags: prevData.user_tags.filter((tag_id: string) => tag_id !== user.user_id)}))
                            }}>
                                <Entypo name="cross" size={25} color={Colors.mediumGray} />
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
          <MaterialIcon name="more-vert" size={20} color={Colors.black} />
        </TouchableOpacity>
        : null}
      </View>

      {/* <Divider color={Colors.mediumGray} style={{width: '95%', alignSelf: 'center'}} /> */}

      <View style={styles.postView}>
        {editMode ? 
           <Input
              value={editedPinData.title}
              placeholder='Enter new pin title'
              autoCapitalize='none'
              onChangeText={text => setEditedPinData({...editedPinData, title: text})}
              style={styles.editTitleInput}
            />
          : 
           <Text style={styles.pinTitleText}>{pinData.title}</Text>
        }

        <View style={styles.photosView}>
          {editMode ?
            <TouchableOpacity onPress={openImagePicker}>
              <Image source={editedPinData.photo && {uri: editedPinData.photo}} style={{width: screenWidth, height: 200}}/>
            </TouchableOpacity>
            :
            <Image source={pinData.photo && {uri: pinData.photo}} style={{width: screenWidth, height: 200}}/>
          }

            {/* <Carousel
              width={screenWidth}
              height={200}
              data={tempPhotos}
              onSnapToItem={(index) => setActivePhotoSlide(index)}
              renderItem={renderItem}
            />
            {renderPagination()} */}

        </View>
        
        {editMode ?
          // <Input
          //   value={editedPinData.caption}
          //   placeholder='Enter new pin caption'
          //   autoCapitalize='none'
          //   onChangeText={text => setEditedPinData({...editedPinData, caption: text})}
          //   style={styles.editCaptionInput}
          // />
            <TextInput
                value={editedPinData.caption}
                placeholder="Write a caption..."
                style={styles.editCaptionInput}
                onChangeText={text => setEditedPinData({...editedPinData, caption: text})}
                autoCapitalize="none"
                multiline={true}
                textAlignVertical="top"
            />
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
            icon={<MaterialIcon name="edit" size={15} color={Colors.black} style={{ marginRight: 2 }}/>}
            color={Colors.black}
            iconContainerStyle={{ marginRight: 2 }}
            titleStyle={{ color: Colors.black, fontWeight: '300', fontFamily: 'ChunkFive', fontSize: 15 }}
            buttonStyle={styles.locationTagsAddButton}
            containerStyle={{...styles.locationTagsAddButtonContainer}} 
            onPress={() => {setUserTagState({...userTagState, modalVisible: true})}} />  
            {userTagState.editedTaggedUsers && userTagState.editedTaggedUsers.length > 0 && userTagState.editedTaggedUsers.map((user:any, index:number) => {
              return (
                <Button 
                  title={'@' + user.username} 
                  key={index}
                  buttonStyle={styles.userTagButton}
                  titleStyle={{ color: Colors.mediumGray, fontWeight: '300', fontFamily: 'ChunkFive', fontSize: 15 }} />
              )
          })}
        </View>
        : 
        <View>
          {userTagState.taggedUsers && userTagState.taggedUsers.length > 0 &&
        <View style={styles.locationTagsButtonView}>
        {userTagState.taggedUsers && userTagState.taggedUsers.length > 0 && userTagState.taggedUsers.map((user:any, index:number) => {
            return (
              <Button 
                title={'@' + user.username} 
                key={index}
                buttonStyle={styles.userTagButton}
                titleStyle={{ color: Colors.white, fontWeight: '900', fontFamily: 'ChunkFive', fontSize: 15 }} 
                onPress={() => props.navigation.navigate('Profile', {user_id: user.user_id})}/>
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
            icon={<MaterialIcon name="edit" size={15} color={Colors.black} style={{ marginRight: 2 }}/>}
            color={Colors.black}
            iconContainerStyle={{ marginRight: 2 }}
            titleStyle={{ color: Colors.black, fontWeight: '300', fontFamily: 'ChunkFive', fontSize: 15 }}
            buttonStyle={styles.locationTagsAddButton}
            containerStyle={styles.locationTagsAddButtonContainer} 
            onPress={() => {setEditPinLocationTags(true)}} />  
            {editedPinData.location_tags.map((tag:string, index:number) => {
              return (
                <Button 
                  title={tag} 
                  key={index}
                  buttonStyle={styles.locationTagButton}
                  titleStyle={{ color: Colors.mediumGray, fontWeight: '300', fontFamily: 'ChunkFive', fontSize: 15 }} />
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
                titleStyle={{ color: Colors.darkGray, fontWeight: '300', fontFamily: 'ChunkFive', fontSize: 15 }} />
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
            {likes.liked ? <Icon name="heart" size={30} color={Colors.mediumOrange} /> : <Icon name="heart-outline" size={30} color={Colors.black} />}
          </TouchableOpacity>
          {likes.liked ? <Text style={{...styles.likesText, color: Colors.mediumOrange}}>{likes.count}</Text> : <Text style={{...styles.likesText, color: Colors.black}}>{likes.count === 0 ? "Like" : likes.count}</Text>}
        </View>
        }
      </View>

      {editMode ? 
      <View style={styles.editButtonsView}>
        <Button 
          title="Cancel"
          color={Colors.black}
          titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'ChunkFive', fontSize: 14 }}
          buttonStyle={styles.cancelEditButton}
          containerStyle={styles.cancelEditButtonContainer} 
          onPress={ () => {
            setEditedPinData(pinData);
            setEditMode(false);
          }} />
        <Button 
          title="Save" 
          color={Colors.white}
          titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'ChunkFive', fontSize: 14 }}
          buttonStyle={styles.saveEditButton}
          containerStyle={styles.saveEditButtonContainer} 
          onPress={
              async () => {
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
    marginHorizontal: 10,
    marginVertical: 10,
  },
  userView: {
    flex: 0.99,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfpImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.mediumOrange,
    alignSelf: 'center',
  },
  usernameText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'ChunkFive',
    marginLeft: 5,
  },
  postView: {
    backgroundColor: Colors.white,
  },
  pinTitleText: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'ChunkFive',
    color: Colors.mediumOrange,
    marginBottom: 5,
  },
  likesView: {
    alignItems: 'center',
    marginVertical: 10,
  },
  likesText: {
    marginHorizontal: 5,
    fontSize: 16,
    fontFamily: 'ChunkFive',
  },
  photosView: {
    marginTop: 5,
    marginBottom: 5,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '95%',
    height: 200,
    borderRadius: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.mediumOrange,
  },
  inactiveDot: {
    backgroundColor: 'gray',
  },
  captionView: {
    borderWidth: 0,
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionText: {
    fontSize: 18,
    fontFamily: 'ChunkFive',
    color: Colors.black,
  },
  createDateText: {
    color: Colors.darkGray,
    fontSize: 18,
    fontFamily: 'ChunkFive',
  },
  locationTagsButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 5,
    rowGap: 5,
    marginVertical: 10,
  },
  locationTagButton: {
    backgroundColor: Colors.whiteOrange,
    borderWidth: 0,
    borderRadius: 20,
  },
  userTagButton: {
    backgroundColor: Colors.mediumOrange,
  },
  pinActionModalStyle: {
    justifyContent: 'flex-end',
  },
  pinActionModalView: {
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flex: 0.3,
  },
  pinActionModelSubview: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  pinActionModelSubviewText: {
    flex: 0.99,
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'ChunkFive',
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: '100%',
  },
  editButtonsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 20,
    marginHorizontal: 40,
  },
  cancelEditButton: {
    backgroundColor: Colors.lightGray,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 10,
  },
  cancelEditButtonContainer: {
    width: 125,
  },
  saveEditButton: {
    backgroundColor: Colors.mediumOrange,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 10,
  },
  saveEditButtonContainer: {
    width: 125,
  },
  editTitleInput: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
    color: Colors.black,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'ChunkFive',
    marginVertical: 5,
    marginTop: 20,
  },
  editCaptionInput: {
      height: 70,
      borderColor: Colors.lightGray,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 8,
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: 15,
      fontFamily: 'ChunkFive',
      color: Colors.black,
      width: '90%',
      marginTop: 10,
      marginBottom: 5,
  },
  locationTagsAddButton: {
    backgroundColor: Colors.whiteGray,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 20,
  },
  locationTagsAddButtonContainer: {
    width: 175,
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
})

export default PinPost;