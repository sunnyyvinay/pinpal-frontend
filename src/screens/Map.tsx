import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import GetLocation, { isLocationError, Location } from 'react-native-get-location';
import MapView, { Callout, CalloutSubview, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPins, getPublicPins, getSearchUsers, getUser, getUserFriends, updatePin, updatePinLocation } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../AppContext';
import { Button, SearchBar } from '@rneui/themed';
import Modal from "react-native-modal";
import { locationTags } from '../constants/locationtags';
import userTagsStyles from '../styles/usertags';
import Entypo from 'react-native-vector-icons/Entypo';
import userSearchStyles from '../styles/usersearch';

function Map({ route, navigation }: { route: any, navigation: any }): React.JSX.Element {
  const { region, setRegion, dragMode, setDragMode } = useAppContext();
  type Region = {latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number};
  const [changingRegion, setChangingRegion] = useState<Region>({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05});
  type Pin = {
    user_id: string,
    pin_id: string,
    latitude: number,
    longitude: number,
    title: string,
    caption: string | undefined,
    create_date: Date | undefined,
    edit_date: Date | undefined,
    photos: string[] | undefined,
    location_tags: string[] | undefined,
    visibility: number
  }
  const [pins, setPins] = useState<Pin[]>([]);
  type FriendPin = {
    user: {
      user_id: string,
      username: string,
      full_name: string,
      pass: string,
      birthday: Date,
      email: string | undefined,
      phone_no: string | undefined,
      profile_pic: string | null
    },
    pins: Pin[]
  }
  const [friendPins, setFriendPins] = useState<FriendPin[]>([]);
  const [publicPins, setPublicPins] = useState([]);

  const [pinFilterModalVisible, setPinFilterModalVisible] = useState(false);
  const [userFilterState, setUserFilterState] = useState({
    modalVisible: false,
    search: "",
    queryUsers: [],
    on: false,
    user: ""
  });
  let searchedUserCount: number = 0;
  type FilterState = {
    private: boolean,
    friends: boolean,
    public: boolean,
    location_tag: string,
  }
  const [tempFilterState, setTempFilterState] = useState<FilterState>({
    private: true,
    friends: true,
    public: true,
    location_tag: "",
  });
  const [filterState, setFilterState] = useState<FilterState>({
    private: true,
    friends: true,
    public: true,
    location_tag: "",
  });

  const tempImg = "https://images.unsplash.com/photo-1720802616209-c174c23f6565?q=80&w=2971&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const setCurrentLocation = async () => {
    await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      rationale: {
        title: 'Location permission', message: 'PinPal needs the permission to request your location.', buttonPositive: 'Ok',
      },
    })
    .then(newLocation => {
      //setRegion({latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05});
      setChangingRegion({latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05});
    })
    .catch(ex => {
      if (isLocationError(ex)) {
        const {code, message} = ex;
        console.warn(code, message);
        //setRegion({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05});
        setChangingRegion({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05});
      } else {
        console.warn(ex);
      }
    })
  }

  useEffect(() => {
    setCurrentLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const setPinState = async () => {
        const user_id = await AsyncStorage.getItem("user_id");
        if (user_id) {
          // PERSONAL PINS
          if (filterState.private) {
            const personalPins = await getPins(user_id);
            if (personalPins.pins) setPins(personalPins.pins.filter((pin: any) => filterState.location_tag == "" || pin.location_tags.includes(filterState.location_tag)));
          } else setPins([]);
          
          // FRIEND PINS
          if (filterState.friends) {
            var friendData = await getUserFriends(user_id);
            for (let i = 0; i < friendData.friends.length; i++) {
              var friend; var pin;
              if (friendData.friends[i].source_id != user_id) {
                  pin = await getPins(friendData.friends[i].source_id);
                  friend = await getUser(friendData.friends[i].source_id);
              } else {
                  pin = await getPins(friendData.friends[i].target_id);
                  friend = await getUser(friendData.friends[i].target_id);
              }
              if (pin.pins) {
                pin = pin.pins.filter((pin: any) => pin.visibility > 0 && (filterState.location_tag == "" || pin.location_tags.includes(filterState.location_tag)));
                friendData.friends[i] = {user: friend.user, pins: pin};
              }
            }
            setFriendPins([...friendData.friends]);
          } else setFriendPins([]);

          // PUBLIC PINS
          if (filterState.public) {
            var publicPins = await getPublicPins(user_id);
            
            if (publicPins.pins) {
              for (let i = 0; i < publicPins.pins.length; i++) {
                publicPins.pins[i] = {...publicPins.pins[i], user: await getUser(publicPins.pins[i].user_id)}
              }
              setPublicPins(publicPins.pins.filter((pin: any) => filterState.location_tag == "" || pin.location_tags.includes(filterState.location_tag)));
            }
          } else setPublicPins([]);

        } else {
          navigation.navigate("Welcome");
        }
      }

      setPinState();
    }, [filterState])
  );

  // USE EFFECT: SEARCH USERS
  useEffect(() => {
    const fetchData = async () => {
        try {
            const users = await getSearchUsers(userFilterState.search);
            searchedUserCount = users.users.length + 1;
            setUserFilterState({...userFilterState, queryUsers: users.users});
        } catch (error) {
            console.error(error);
        }
    };

    if (userFilterState.search.length > 0) {
        // Debounce the API call to avoid too many requests
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);
        
        return () => clearTimeout(timeoutId);
    } else {
        setUserFilterState({...userFilterState, queryUsers: []});
    }
  }, [userFilterState.search]);

  const userView = (user: any) => {
    searchedUserCount--;
        return (
        <TouchableOpacity key={searchedUserCount} onPress={() => {
            setUserFilterState({modalVisible: false, search: "", on: true, queryUsers: [], user: user.user_id})
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

  const handleDragMode = () => {
    switch (dragMode.mode) {
      case 0:
        return (
          <React.Fragment>
            {pins && !userFilterState.on && pins.map((personalPin: any, index: number) => (
            <Marker
              key={personalPin.pin_id}  
              coordinate={{latitude: personalPin.latitude, longitude: personalPin.longitude}}
              image={require('../../assets/images/personal-pin.png')}
              title={personalPin.title} >
                <Callout style={styles.pinCalloutStyle}>
                  <View style={styles.pinCalloutView}>
                    <Text style={styles.pinCalloutTitle}>{personalPin.title}</Text>
                    <Image source={{uri: personalPin.photo}} style={styles.pinCalloutImage}/>
                  </View>

                  <View style={{justifyContent: 'space-evenly', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { 
                          setChangingRegion({latitude: personalPin.latitude, longitude: personalPin.longitude, latitudeDelta: changingRegion.latitudeDelta, longitudeDelta: changingRegion.longitudeDelta});
                          //setRegion({latitude: personalPin.latitude, longitude: personalPin.longitude, latitudeDelta: changingRegion.latitudeDelta, longitudeDelta: changingRegion.longitudeDelta});
                          setDragMode({mode: 2, location: {latitude: personalPin.latitude, longitude: personalPin.longitude}, pin_index: index});
                        }}>
                      <Button 
                          title="Drag" 
                          buttonStyle={styles.pinCalloutViewButton}
                          color={Colors.white}
                          titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation', fontSize: 12 }} />
                    </CalloutSubview>
                    
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { navigation.navigate("Pin detail", { pin_id: personalPin.pin_id, pin_user_id: personalPin.user_id })}}>
                      <Button 
                          title="View" 
                          buttonStyle={styles.pinCalloutViewButton}
                          color={Colors.white}
                          titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation', fontSize: 12 }} />
                    </CalloutSubview>
                  </View>
                </Callout>
            </Marker>
          ))}
          
        {friendPins && friendPins.map((friend: any, index: number) => (
          friend && friend.pins && friend.pins.map((friendPin: any, index: number) => (
            friendPin.visibility > 0 && (!userFilterState.on || (userFilterState.on && friendPin.user_id == userFilterState.user)) &&
            <Marker
              key={friendPin.pin_id}  
              coordinate={{latitude: friendPin.latitude, longitude: friendPin.longitude}}
              image={require('../../assets/images/friend-pin.png')}
              title={friendPin.title} >
                <Callout style={styles.pinCalloutStyle}>
                  <View style={styles.pinCalloutView}>
                    <Text style={styles.pinCalloutTitle}>{friendPin.title}</Text>
                    <Text style={styles.pinCalloutPersonal}>@{friend.user.username}</Text>
                    <Image source={{uri: friendPin.photo}} style={styles.pinCalloutImage}/>
                  </View>

                  <View style={{justifyContent: 'space-evenly', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { navigation.navigate("Pin detail", { pin_id: friendPin.pin_id, pin_user_id: friendPin.user_id })}}>
                      <Button 
                          title="View" 
                          buttonStyle={styles.pinCalloutViewButton}
                          color={Colors.white}
                          titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation', fontSize: 12 }} />
                    </CalloutSubview>
                  </View>
                </Callout>
            </Marker>
          ))))}

        {publicPins && publicPins.map((publicPin: any, index: number) => (
          (!userFilterState.on || (userFilterState.on && publicPin.user_id == userFilterState.user)) &&
            <Marker
              key={publicPin.pin_id}  
              coordinate={{latitude: publicPin.latitude, longitude: publicPin.longitude}}
              image={require('../../assets/images/public-pin.png')}
              title={publicPin.title} >
                <Callout style={styles.pinCalloutStyle}>
                  <View style={styles.pinCalloutView}>
                    <Text style={styles.pinCalloutTitle}>{publicPin.title}</Text>
                    <Text style={styles.pinCalloutPersonal}>@{publicPin.user.username}</Text>
                    <Image source={{uri: publicPin.photo}} style={styles.pinCalloutImage}/>
                  </View>

                  <View style={{justifyContent: 'space-evenly', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { navigation.navigate("Pin detail", { pin_id: publicPin.pin_id, pin_user_id: publicPin.user_id })}}>
                      <Button 
                          title="View" 
                          buttonStyle={styles.pinCalloutViewButton}
                          color={Colors.white}
                          titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation', fontSize: 12 }} />
                    </CalloutSubview>
                  </View>
                </Callout>
            </Marker>
        ))}
          </React.Fragment>
        );

      case 1:
        return (
          <Marker 
            key={0}
            coordinate={{latitude: changingRegion.latitude, longitude: changingRegion.longitude}} 
            image={require('../../assets/images/personal-pin.png')}
            opacity={0.7} />
        );
      
      case 2:
        return (
          <Marker 
            key={0}
            coordinate={{latitude: changingRegion.latitude, longitude: changingRegion.longitude}} 
            image={require('../../assets/images/personal-pin.png')}
            opacity={0.7} />
        );   
    }
  }

  const handleDragOptions = () => {
    switch (dragMode.mode) {
      case 1:
        return (
        <SafeAreaView style={styles.draggableOptionsView}>
          <TouchableOpacity 
            onPress={() => {
              setDragMode({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
              navigation.navigate("New pin", { latitude: changingRegion.latitude, longitude: changingRegion.longitude })
            }}>
            <Icon name="checkmark-circle" size={40} color={Colors.green} style={styles.optionIcon} />
          </TouchableOpacity>
  
          <TouchableOpacity 
            onPress={() => {
              setDragMode({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
            }}>
            <MaterialIcon name="cancel" size={40} color={Colors.errorRed} style={styles.optionIcon}/>
          </TouchableOpacity>
        </SafeAreaView>
        );

      case 2:
        return (
        <SafeAreaView style={styles.draggableOptionsView}>
          <TouchableOpacity 
            onPress={async () => {
              setPins((prevArray) => {
                const newArray = [...prevArray];
                newArray[dragMode.pin_index] = {...newArray[dragMode.pin_index], latitude: changingRegion.latitude, longitude: changingRegion.longitude};
                return newArray;
              });
              await updatePinLocation(pins[dragMode.pin_index].user_id, pins[dragMode.pin_index].pin_id, {latitude: changingRegion.latitude, longitude: changingRegion.longitude});
              setDragMode({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
            }}>
            <Icon name="checkmark-circle" size={40} color={Colors.green} style={styles.optionIcon} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              setDragMode({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
            }}>
            <MaterialIcon name="cancel" size={40} color={Colors.errorRed} style={styles.optionIcon}/>
          </TouchableOpacity>
        </SafeAreaView>
        );
    }
  }

  return (
    <View style={{width: '100%', height: '100%'}}>
      <View style={styles.filterView}>
        <TouchableOpacity style={styles.filterIcon} onPress={() => {setTempFilterState({...filterState}); setPinFilterModalVisible(true);}}>
          <Icon name="filter-circle" size={30} color={Colors.lightOrange} />
        </TouchableOpacity>
        <View style={styles.verticalLine} />
        {filterState.location_tag ? 
          <Button 
            title={filterState.location_tag}
            buttonStyle={{...styles.locationTagOpacity, backgroundColor: Colors.lightOrange}}
            titleStyle={styles.locationTagText} 
            onPress={() => {
              setFilterState({...filterState, location_tag: ""});
            }} /> :
          <ScrollView style={styles.locationTagView} horizontal={true} showsHorizontalScrollIndicator={false}>
            {locationTags.map((tag: string, index: number) => {
              return (
                <Button 
                  title={tag}
                  key={index}
                  buttonStyle={styles.locationTagOpacity}
                  titleStyle={styles.locationTagText} 
                  onPress={() =>{
                    setFilterState({...filterState, location_tag: tag});
                  }}/>
              )
            })}
          </ScrollView>
        }
      </View>

      <MapView
        region={changingRegion}
        // onRegionChange={(newRegion) => {
        //   setChangingRegion(newRegion);
        // }}
        onRegionChangeComplete={(newRegion) => {
          setChangingRegion(newRegion);
        }}
        style={styles.mapContainer}
        showsPointsOfInterest={true}>
        {handleDragMode()}
      </MapView>

      <View style={styles.mapControlView}>
        {userFilterState.on ?
          <TouchableOpacity style={styles.mapControlButton} onPress={() => {setUserFilterState({modalVisible: false, search: "", queryUsers: [], on: false, user: ""})}}>
          <MaterialIcon name="search-off" size={25} color={Colors.lightOrange} />
          </TouchableOpacity>
        :
          <TouchableOpacity style={styles.mapControlButton} onPress={() => setUserFilterState({...userFilterState, modalVisible: true})}>
            <Icon name="search" size={25} color={Colors.lightOrange} />
          </TouchableOpacity>
        }
        <TouchableOpacity style={styles.mapControlButton} onPress={setCurrentLocation}>
          <FontAwesome6 name="location-arrow" size={25} color={Colors.lightOrange} />
        </TouchableOpacity>
      </View>
      
      {handleDragOptions()}

      <Modal 
        isVisible={pinFilterModalVisible} 
        onBackdropPress={() => {setFilterState(tempFilterState); setPinFilterModalVisible(false)}}
        style={styles.pinFilterModal}>
        <View style={styles.pinFilterModalView}>
          <Text style={styles.pinFilterModalTitle}>Filter pins</Text>
            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                  if (tempFilterState.private) {
                    setTempFilterState({...tempFilterState, private: false});
                  } else {
                    setTempFilterState({...tempFilterState, private: true});
                  }
              }}>
              <MaterialIcon name="lock" size={25} style={{ flex: 0.25}}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65}}>Personal</Text>
              <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={tempFilterState.private ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
            </TouchableOpacity>
            <View style={styles.horizontalLine} />

            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                  if (tempFilterState.friends) {
                    setTempFilterState({...tempFilterState, friends: false});
                  } else {
                    setTempFilterState({...tempFilterState, friends: true});
                  }
              }}>
              <MaterialIcon name="people-alt" size={25} style={{ flex: 0.25}}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65}}>Friends</Text>
              <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={tempFilterState.friends ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
            </TouchableOpacity>
            <View style={styles.horizontalLine} />

            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                  if (tempFilterState.public) {
                    setTempFilterState({...tempFilterState, public: false});
                  } else {
                    setTempFilterState({...tempFilterState, public: true});
                  }
              }}>
              <MaterialIcon name="public" size={25} style={{ flex: 0.25}}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65}}>Public</Text>
              <Icon name="checkmark-sharp" size={25} color={Colors.mediumOrange} style={tempFilterState.public ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
            </TouchableOpacity>
          </View>
      </Modal>

      <Modal 
        isVisible={userFilterState.modalVisible} 
        onBackdropPress={() => setUserFilterState({...userFilterState, modalVisible: false})}
        style={userTagsStyles.userTagsModal}>
        <View style={userTagsStyles.userTagsModalView}>
            <View style={userTagsStyles.userTagsModalHeader}>
                <Text style={userTagsStyles.userTagsModalTitle}>Filter by user</Text>
                <Entypo name="cross" size={25} color={Colors.mediumGray} onPress={() => setUserFilterState({...userFilterState, modalVisible: false})} style={{position: 'absolute', left: '55%'}}/>
            </View>
            <SearchBar 
                placeholder='Search...'
                value={userFilterState.search}
                round={true}
                autoCapitalize="none"
                lightTheme={true}
                containerStyle={userSearchStyles.searchBarContainer}
                onChangeText={(text) => setUserFilterState({...userFilterState, search: text})}/>
            <ScrollView style={{width: '100%', flex: 1}}>
              <View style={{flex: 0.8}}>
                  { userFilterState.queryUsers && userFilterState.queryUsers.length > 0 && userFilterState.queryUsers.map((user: any) => (
                      userView(user)
                  ))}
              </View>
            </ScrollView>
        </View>
    </Modal>

    </View> 
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '100%',
  },
  draggableOptionsView: {
    position: 'absolute',
    top: '55%',
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionIcon: {
    flex: 0.5,
    marginHorizontal: 10
  },
  pinCalloutStyle: {
    height: 250,
    width: 200,
    padding: 10,
  },
  pinCalloutView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCalloutTitle: {
    fontSize: 18,
    fontFamily: 'Sansation',
    fontWeight: 'bold',
    marginBottom: 5
  },
  pinCalloutPersonal: {
    fontSize: 16,
    fontStyle: 'italic',
    fontFamily: 'Sansation',
    color: Colors.mediumGray,
    marginBottom: 5
  },
  pinCalloutImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  pinCalloutViewButton: {
    backgroundColor: Colors.darkOrange,
    borderWidth: 0,
    borderRadius: 10,
    height: 30,
    width: 80,
  },
  mapControlView: {
    flexDirection: 'column',
    position: 'absolute',
    padding: 10,
    marginLeft: "80%",
    marginTop: "110%"
  },
  mapControlButton: {
    backgroundColor: 'white',
    borderWidth: 0,
    borderRadius: 30,
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    flex: 0.5,
    marginVertical: 5
  },
  filterView: {
    height: 40,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginLeft: 10,
  },
  verticalLine: {
    height: '80%',
    width: 1,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 10,
  },
  locationTagView: {
    flexDirection: 'row',
    marginVertical: 5
  },
  locationTagOpacity: {
    borderWidth: 0,
    borderRadius: 20,
    backgroundColor: Colors.whiteOrange,
    marginHorizontal: 5
  },
  locationTagText: {
    fontSize: 11,
    fontFamily: 'Sansation',
    fontWeight: 100,
    color: Colors.darkGray
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: '100%',
  },
  pinFilterModal: {
    justifyContent: 'center',
  },
  pinFilterModalView: {
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flex: 0.4,
  },
  pinFilterModalTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  filterVisibilityOpacity: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  filterVisibilityText: {
    flex: 0.99,
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'Sansation',
  },
});

export default Map;
