import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getPin, getUser } from '../services/user.service';
import { useRoute } from '@react-navigation/native';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Colors from '../constants/colors';
import { Button, Input } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Carousel from 'react-native-reanimated-carousel';
import Modal from "react-native-modal";
import { deletePin, updatePin } from '../services/user.service';
import { locationTags, getLocationTagIcon } from '../constants/locationtags';

const PinPost = (props:any) => {
    const { pin_id, pin_user_id } = props.route.params;  
    const [pinData, setPinData] = useState<any>({
      title: "",
      caption: "",
      create_date: undefined,
      edit_date: undefined,
      photos: [],
      location_tags: [],
      visibility: 1
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
      photos: [],
      location_tags: [],
      visibility: 1
    });

    const [editPinVisibility, setEditPinVisibility] = useState<boolean>(false);
    const [editPinLocationTags, setEditPinLocationTags] = useState<boolean>(false);

    const [liked, setLiked] = useState<boolean>(false);

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
      }

      getInfo();
    }, []);

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
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 0});
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
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 1});
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
                  await updatePin(pin_user_id, pin_id, {...pinData, visibility: 2});
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
                onPress={() => {
                  deletePin(pin_user_id, pin_id); 
                  setPinActionModalVisible(false); 
                  props.navigation.goBack(); 
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

  return (
    <ScrollView>
      <View style={styles.topView}>
        <View style={styles.userView}>
          <Image source={pinUserData.profile_pic ? {uri: pinUserData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
          <Text style={styles.usernameText}>{pinUserData.username}</Text>
        </View>

        {personal && !editMode ? 
        <TouchableOpacity onPress={() => setPinActionModalVisible(true)}>
          <MaterialIcon name="more-vert" size={20} color={Colors.black} />
        </TouchableOpacity>
        : null}
      </View>

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
            <Carousel
              width={screenWidth}
              height={200}
              data={tempPhotos}
              onSnapToItem={(index) => setActivePhotoSlide(index)}
              renderItem={renderItem}
            />
            {renderPagination()}
        </View>
        
        {editMode ?
          <Input
            value={editedPinData.caption}
            placeholder='Enter new pin caption'
            autoCapitalize='none'
            onChangeText={text => setEditedPinData({...editedPinData, caption: text})}
            style={styles.editCaptionInput}
          />
        :
          <View style={styles.captionView}>
            <Text style={{textAlign: 'center'}}>
              <Text style={styles.createDateText}>{formatTimestamp(pinData.create_date)}</Text>
              <Text style={styles.captionText}>{pinData.caption ? " - \"" + pinData.caption + "\"" : null}</Text>
            </Text>
          </View>
        }
      
        <View style={styles.locationTagsButtonView}>
          {editMode ? 
          <View>
            <Button 
              title="Edit"
              icon={<MaterialIcon name="edit" size={15} color={Colors.black} style={{ marginRight: 2 }}/>}
              color={Colors.black}
              iconContainerStyle={{ marginRight: 2 }}
              titleStyle={{ color: Colors.black, fontWeight: '300', fontFamily: 'Sansation', fontSize: 15 }}
              buttonStyle={styles.locationTagsAddButton}
              containerStyle={styles.locationTagsAddButtonContainer} 
              onPress={() => {setEditPinLocationTags(true)}} />  
              {editedPinData.location_tags.map((tag:string, index:number) => {
                return (
                  <Button 
                    title={tag} 
                    key={index}
                    buttonStyle={styles.locationTagButton}
                    titleStyle={{ color: Colors.mediumGray, fontWeight: '300', fontFamily: 'Sansation', fontSize: 15 }} />
                )
            })}
          </View>
          : 
          <View>
          {pinData.location_tags.map((tag:string, index:number) => {
              return (
                <Button 
                  title={tag} 
                  key={index}
                  buttonStyle={styles.locationTagButton}
                  titleStyle={{ color: Colors.mediumGray, fontWeight: '300', fontFamily: 'Sansation', fontSize: 15 }} />
              )
          })}
          </View>
          }
        </View>
        
        {editMode ? null : 
        <View style={styles.likesView}>
          <TouchableOpacity onPress={() => setLiked(!liked)}>
            {liked ? <Icon name="heart" size={30} color={Colors.mediumOrange} /> : <Icon name="heart-outline" size={30} color={Colors.black} />}
          </TouchableOpacity>
          <Text style={{...styles.likesText, color: liked ? Colors.mediumOrange : Colors.black}}>124</Text>
        </View>
        }
      </View>

      {editMode ? 
      <View style={styles.editButtonsView}>
        <Button 
          title="Cancel"
          color={Colors.black}
          titleStyle={{ color: Colors.black, fontWeight: '700', fontFamily: 'Sansation', fontSize: 14 }}
          buttonStyle={styles.cancelEditButton}
          containerStyle={styles.cancelEditButtonContainer} 
          onPress={ () => {
            setEditedPinData(pinData);
            setEditMode(false);
          }} />
        <Button 
          title="Save" 
          color={Colors.white}
          titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation', fontSize: 14 }}
          buttonStyle={styles.saveEditButton}
          containerStyle={styles.saveEditButtonContainer} 
          onPress={
              async () => {
                  await updatePin(pin_user_id, pin_id, editedPinData);
                  setPinData(editedPinData);
                  setEditMode(false);
              }
          }/>
      </View>
      : null
      }

      {pinActionModal()}
      {editLocationTagsModal()}
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
    fontFamily: 'Sansation',
    marginLeft: 5,
  },
  postView: {
    backgroundColor: Colors.white,
  },
  pinTitleText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Sansation',
    color: Colors.black,
    marginVertical: 5,
    marginTop: 20,
  },
  likesView: {
    alignItems: 'center',
    marginVertical: 10,
  },
  likesText: {
    marginHorizontal: 5,
    fontSize: 16,
    fontFamily: 'Sansation',
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
    fontSize: 15,
    fontFamily: 'Sansation',
    color: Colors.black,
  },
  createDateText: {
    color: Colors.mediumGray,
    fontSize: 15,
    fontFamily: 'Sansation',
  },
  locationTagsButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 5,
    rowGap: 5,
    marginVertical: 5,
  },
  locationTagButton: {
    backgroundColor: Colors.whiteOrange,
    borderWidth: 0,
    borderRadius: 20,
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
    fontFamily: 'Sansation',
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
    fontFamily: 'Sansation',
    marginVertical: 5,
    marginTop: 20,
  },
  editCaptionInput: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 15,
    fontFamily: 'Sansation',
    color: Colors.black,
    marginVertical: 5,
    marginTop: 20,
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