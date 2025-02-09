import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Appearance, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GetLocation, { isLocationError } from 'react-native-get-location';
import MapView, { Callout, CalloutSubview, MapMarker, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPins, getPublicPins, getSearchUsers, getUser, getUserFriends, updatePinLocation } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../AppContext';
import { SearchBar } from '@rneui/themed';
import Modal from "react-native-modal";
import { locationTags } from '../constants/locationtags';
import userTagsStyles from '../styles/usertags';
import Entypo from 'react-native-vector-icons/Entypo';
import userSearchStyles from '../styles/usersearch';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FastImage from 'react-native-fast-image';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

function Map({ route, navigation }: { route: any, navigation: any }): React.JSX.Element {
  const {theme, setTheme} = useAppContext();
  const { region, setRegion, dragMode, setDragMode } = useAppContext();
  type Region = {latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number};
  const [changingRegion, setChangingRegion] = useState<Region>({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.01, longitudeDelta: 0.01});
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
      phone_no: string | undefined,
      profile_pic: string | null
    },
    pins: Pin[]
  }
  const [friendPins, setFriendPins] = useState<FriendPin[]>([]);
  const [publicPins, setPublicPins] = useState([]);

  let searchedUserCount: number = 0;
  type FilterState = {
    private: boolean,
    friends: boolean,
    public: boolean,
    location_tag: string,
    modalState: number,  // 0 - not visible, 1 - options, 2 - visibility, 3 - user
    search: string,
    queryUsers: [],
    on: boolean,
    user: ""
  }
  const [filterState, setFilterState] = useState<FilterState>({
    private: true,
    friends: true,
    public: true,
    location_tag: "",
    modalState: 0,
    search: "",
    queryUsers: [],
    on: false,
    user: ""
  });
  const [locationSearch, setLocationSearch] = useState({
    modalVisible: false,
    search: "",
  });

  const markerRefs = useRef<Record<string, MapMarker | null>>({});

  const setCurrentLocation = async () => {
    const user_id = await AsyncStorage.getItem("user_id");
    if (!user_id) navigation.navigate("Welcome");

    await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      rationale: {
        title: 'Location permission', message: 'PinPal needs the permission to request your location.', buttonPositive: 'Ok',
      },
    })
    .then(newLocation => {
      //setRegion({latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01});
      setChangingRegion({latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01});
    })
    .catch(ex => {
      if (isLocationError(ex)) {
        const {code, message} = ex;
        console.warn(code, message);
        //setRegion({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.01, longitudeDelta: 0.01});
        setChangingRegion({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.01, longitudeDelta: 0.01});
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
        const now = new Date();
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
                pin = pin.pins.filter((pin: any) => {
                  if (route.params && pin.pin_id == route.params.pin_id) return true;
                  return pin.visibility > 0 && (filterState.location_tag == "" || pin.location_tags.includes(filterState.location_tag))
                });
                if (!filterState.on && filterState.location_tag == "") pin = pin.filter((pin: any) => {
                  if (route.params && pin.pin_id == route.params.pin_id) return true;
                  return Math.floor((now.getTime() - new Date(pin.create_date).getTime()) / (1000*60*60)) <= 120 // last 5 days
                }); 
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
                const user = await getUser(publicPins.pins[i].user_id);
                publicPins.pins[i] = {...publicPins.pins[i], user: user.user};
              }
              setPublicPins(publicPins.pins.filter((pin: any) => filterState.location_tag == "" || pin.location_tags.includes(filterState.location_tag)));
            }
          } else setPublicPins([]);

        } else {
          navigation.navigate("Welcome");
        }
      }

      try {
        setPinState();
      } catch (error) {
        console.error(error);
      }
    }, [filterState, route.params])
  );

  useEffect(() => {
    setChangingRegion({latitude: route.params.latitude, longitude: route.params.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005});
    const timer = setTimeout(() => {
      if (route.params) {
        const marker = markerRefs.current[route.params.pin_id];
        if (marker) {
          marker.showCallout();
        }
      }
    }, 1000);  // Delay ensures refs are set after initial render

    return () => clearTimeout(timer);  // Cleanup
  }, [route.params]);

  // USE EFFECT: SEARCH USERS
  useEffect(() => {
    const fetchData = async () => {
        try {
            const users = await getSearchUsers(filterState.search);
            searchedUserCount = users.users.length + 1;
            setFilterState({...filterState, queryUsers: users.users});
        } catch (error) {
            console.error(error);
        }
    };

    if (filterState.search.length > 0) {
        // Debounce the API call to avoid too many requests
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);
        
        return () => clearTimeout(timeoutId);
    } else {
        setFilterState({...filterState, queryUsers: []});
    }
  }, [filterState.search]);

  useLayoutEffect(() => {
      navigation.setOptions({
          headerStyle: {backgroundColor: theme == "dark" ? Colors.darkBackground : Colors.white},
          headerTitleStyle: {color: theme == "dark" ? Colors.white : Colors.black},
      });
  }, [navigation, theme]);

  const userView = (user: any) => {
    searchedUserCount--;
        return (
        <TouchableOpacity key={searchedUserCount} onPress={() => {
            setFilterState({...filterState, modalState: 0, search: "", on: true, queryUsers: [], user: user.user_id})
          }}>
            <View style={{...userSearchStyles.searchUserView, marginLeft: wp('10%')}}>
                <FastImage 
                    source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                    style={{...userSearchStyles.searchUserPfp}} />
                <View style={{...userSearchStyles.searchUserTextView}}>
                    <Text style={{...userSearchStyles.searchUserFullName, color: theme == "dark" ? Colors.white : Colors.black}}>{user.full_name}</Text>
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
            {pins && !filterState.on && pins.map((personalPin: any, index: number) => (
            <Marker
              key={personalPin.pin_id}  
              coordinate={{latitude: personalPin.latitude, longitude: personalPin.longitude}}
              title={personalPin.title}
              ref={ref => (markerRefs.current[personalPin.pin_id] = ref)}>
                <Image source={require('../../assets/images/personal-pin.png')} style={{width: wp('5.5%'), height: hp('5.5%')}} resizeMode='contain' />
                <Callout style={{...styles.pinCalloutStyle, height: hp('30%')}}>
                  <View style={{...styles.pinCalloutView}}>
                    <Text style={styles.pinCalloutTitle}>{personalPin.title}</Text>
                    <FastImage source={{uri: personalPin.photo}} style={styles.pinCalloutImage}/>
                  </View>

                  <View style={{justifyContent: 'space-evenly', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { 
                          setChangingRegion({latitude: personalPin.latitude, longitude: personalPin.longitude, latitudeDelta: changingRegion.latitudeDelta, longitudeDelta: changingRegion.longitudeDelta});
                          //setRegion({latitude: personalPin.latitude, longitude: personalPin.longitude, latitudeDelta: changingRegion.latitudeDelta, longitudeDelta: changingRegion.longitudeDelta});
                          setDragMode({mode: 2, location: {latitude: personalPin.latitude, longitude: personalPin.longitude}, pin_index: index});
                        }}>
                      <View style={styles.pinCalloutViewButton}>
                        <Text style={styles.pinCalloutViewButtonText}>Drag</Text>
                      </View>
                    </CalloutSubview>
                    
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { navigation.push("Pin detail", { pin_id: personalPin.pin_id, pin_user_id: personalPin.user_id })}}>
                      <View style={styles.pinCalloutViewButton}>
                        <Text style={styles.pinCalloutViewButtonText}>View</Text>
                      </View>
                    </CalloutSubview>
                  </View>
                </Callout>
            </Marker>
          ))}
          
        {friendPins && friendPins.map((friend: any, index: number) => (
          friend && friend.pins && friend.pins.map((friendPin: any, index: number) => (
            friendPin.visibility > 0 && (!filterState.on || (filterState.on && friendPin.user_id == filterState.user)) &&
            <Marker
              key={friendPin.pin_id}  
              coordinate={{latitude: friendPin.latitude, longitude: friendPin.longitude}}
              title={friendPin.title} 
              ref={ref => (markerRefs.current[friendPin.pin_id] = ref)}>
                <Image source={require('../../assets/images/friend-pin.png')} style={{width: wp('5.5%'), height: hp('5.5%')}} resizeMode='contain' />
                <Callout style={styles.pinCalloutStyle}>
                  <View style={{...styles.pinCalloutView}}>
                    <Text style={styles.pinCalloutTitle}>{friendPin.title}</Text>
                    <Text style={styles.pinCalloutUsername}>@{friend.user.username}</Text>
                    <FastImage source={{uri: friendPin.photo}} style={styles.pinCalloutImage}/>
                  </View>

                  <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                    <CalloutSubview style={{justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { navigation.push("Pin detail", { pin_id: friendPin.pin_id, pin_user_id: friendPin.user_id })}}>
                      <View style={styles.pinCalloutViewButton}>
                        <Text style={styles.pinCalloutViewButtonText}>View</Text>
                      </View>
                    </CalloutSubview>
                  </View>
                </Callout>
            </Marker>
          ))))}

        {publicPins && publicPins.map((publicPin: any, index: number) => (
          (!filterState.on || (filterState.on && publicPin.user_id == filterState.user)) &&
            <Marker
              key={publicPin.pin_id}  
              coordinate={{latitude: publicPin.latitude, longitude: publicPin.longitude}}
              title={publicPin.title} 
              ref={ref => (markerRefs.current[publicPin.pin_id] = ref)}>
                <Image source={require('../../assets/images/public-pin.png')} style={{width: wp('5.5%'), height: hp('5.5%')}} resizeMode='contain' />
                <Callout style={styles.pinCalloutStyle}>
                  <View style={styles.pinCalloutView}>
                    <Text style={styles.pinCalloutTitle}>{publicPin.title}</Text>
                    <Text style={styles.pinCalloutUsername}>@{publicPin.user.username}</Text>
                    <FastImage source={{uri: publicPin.photo}} style={styles.pinCalloutImage}/>
                  </View>

                  <View style={{justifyContent: 'space-evenly', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { navigation.push("Pin detail", { pin_id: publicPin.pin_id, pin_user_id: publicPin.user_id })}}>
                      <View style={styles.pinCalloutViewButton}>
                        <Text style={styles.pinCalloutViewButtonText}>View</Text>
                      </View>
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
            opacity={theme == 'dark' ? 0.9 : 0.7}>
              <Image source={require('../../assets/images/personal-pin.png')} style={{width: wp('5.5%'), height: hp('5.5%')}} resizeMode='contain' />
          </Marker>
        );
      
      case 2:
        return (
          <Marker 
            key={0}
            coordinate={{latitude: changingRegion.latitude, longitude: changingRegion.longitude}} 
            opacity={theme == 'dark' ? 0.9 : 0.7}>
              <Image source={require('../../assets/images/personal-pin.png')} style={{width: wp('5.5%'), height: hp('5.5%')}} resizeMode='contain' />
          </Marker>
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
            <Icon name="checkmark-circle" size={wp('10%')} color={Colors.green} style={styles.optionIcon} />
          </TouchableOpacity>
  
          <TouchableOpacity 
            onPress={() => {
              setDragMode({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
            }}>
            <MaterialIcon name="cancel" size={wp('10%')} color={Colors.errorRed} style={styles.optionIcon}/>
          </TouchableOpacity>
        </SafeAreaView>
        );

      case 2:
        return (
        <SafeAreaView style={styles.draggableOptionsView}>
          <TouchableOpacity 
            onPress={async () => {
              try {
                setPins((prevArray) => {
                  const newArray = [...prevArray];
                  newArray[dragMode.pin_index] = {...newArray[dragMode.pin_index], latitude: changingRegion.latitude, longitude: changingRegion.longitude};
                  return newArray;
                });
                await updatePinLocation(pins[dragMode.pin_index].user_id, pins[dragMode.pin_index].pin_id, {latitude: changingRegion.latitude, longitude: changingRegion.longitude});
                setDragMode({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
              } catch (error) {
                console.error(error);
              }
            }}>
            <Icon name="checkmark-circle" size={wp('10%')} color={Colors.green} style={styles.optionIcon} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              setDragMode({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
            }}>
            <MaterialIcon name="cancel" size={wp('10%')} color={Colors.errorRed} style={styles.optionIcon}/>
          </TouchableOpacity>
        </SafeAreaView>
        );
    }
  }

  const handleFilterModal = () => {
    switch (filterState.modalState) {
      case 1:
        return (
          <View style={{...styles.pinFilterModalView, backgroundColor: theme == 'dark' ? Colors.darkSurface : Colors.white}}>
            <View style={userTagsStyles.userTagsModalHeader}>
                <Text style={{...userTagsStyles.userTagsModalTitle, color: theme == 'dark' ? Colors.white : Colors.black}}>Filter pins by</Text>
                <Entypo name="cross" size={wp('6%')} color={Colors.mediumGray} onPress={() => setFilterState({...filterState, modalState: 0})} style={{position: 'absolute', left: wp('50%')}}/>
            </View>
            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                setFilterState({...filterState, modalState: 2});
              }}>
              <MaterialIcon name="visibility" size={wp('6%')} style={{ flex: 0.25}} color={theme == 'dark' ? Colors.white : Colors.black}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65, color: theme == 'dark' ? Colors.white : Colors.black}}>Visibility</Text>
            </TouchableOpacity>
            <View style={{...styles.horizontalLine, borderBottomColor: theme == 'dark' ? Colors.white : Colors.black}} />

            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                setFilterState({...filterState, modalState: 3});
              }}>
              <MaterialIcon name="person" size={wp('6%')} style={{ flex: 0.25}} color={theme == 'dark' ? Colors.white : Colors.black}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65, color: theme == 'dark' ? Colors.white : Colors.black}}>User</Text>
            </TouchableOpacity>
          </View>
        );
      case 2: // Visibility
        return (
          <View style={{...styles.pinFilterModalView, backgroundColor: theme == 'dark' ? Colors.darkSurface : Colors.white}}>
            <View style={userTagsStyles.userTagsModalHeader}>
                <Ionicons name="arrow-back" size={wp('6%')} color={Colors.mediumGray} onPress={() => setFilterState({...filterState, modalState: 1})} style={{position: 'absolute', right: wp('50%')}}/>
                <Text style={{...userTagsStyles.userTagsModalTitle, color: theme == 'dark' ? Colors.white : Colors.black}}>Filter by Visibility</Text>
                <Entypo name="cross" size={wp('6%')} color={Colors.mediumGray} onPress={() => setFilterState({...filterState, modalState: 0})} style={{position: 'absolute', left: wp('50%')}}/>
            </View>
            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                  if (filterState.private) {
                    setFilterState({...filterState, private: false});
                  } else {
                    setFilterState({...filterState, private: true});
                  }
              }}>
              <MaterialIcon name="lock" size={wp('6%')} style={{ flex: 0.25}} color={theme == 'dark' ? Colors.white : Colors.black}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65, color: theme == 'dark' ? Colors.white : Colors.black}}>Personal</Text>
              <Icon name="checkmark-sharp" size={wp('6%')} color={Colors.mediumOrange} style={filterState.private ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
            </TouchableOpacity>
            <View style={{...styles.horizontalLine, borderBottomColor: theme == 'dark' ? Colors.white : Colors.black}} />

            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                if (filterState.friends) {
                  setFilterState({...filterState, friends: false});
                } else {
                  setFilterState({...filterState, friends: true});
                }
              }}>
              <MaterialIcon name="people-alt" size={wp('6%')} style={{ flex: 0.25}} color={theme == 'dark' ? Colors.white : Colors.black}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65, color: theme == 'dark' ? Colors.white : Colors.black}}>Friends</Text>
              <Icon name="checkmark-sharp" size={wp('6%')} color={Colors.mediumOrange} style={filterState.friends ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
            </TouchableOpacity>
            <View style={{...styles.horizontalLine, borderBottomColor: theme == 'dark' ? Colors.white : Colors.black}} />

            <TouchableOpacity 
              style={styles.filterVisibilityOpacity}
              onPress={() => {
                if (filterState.public) {
                  setFilterState({...filterState, public: false});
                } else {
                  setFilterState({...filterState, public: true});
                }
              }}>
              <MaterialIcon name="public" size={wp('6%')} style={{ flex: 0.25}} color={theme == 'dark' ? Colors.white : Colors.black}/>
              <Text style={{...styles.filterVisibilityText, flex: 0.65, color: theme == 'dark' ? Colors.white : Colors.black}}>Public</Text>
              <Icon name="checkmark-sharp" size={wp('6%')} color={Colors.mediumOrange} style={filterState.public ? { flex: 0.1} : { flex: 0.1, opacity: 0}}/>
            </TouchableOpacity>
          </View>
        );
      case 3: // User
        return(
          <View style={{...userTagsStyles.userTagsModalView, backgroundColor: theme == 'dark' ? Colors.darkSurface : Colors.white}}>
            <View style={userTagsStyles.userTagsModalHeader}>
                <Ionicons name="arrow-back" size={wp('6%')} color={Colors.mediumGray} onPress={() => setFilterState({...filterState, modalState: 1})} style={{position: 'absolute', right: wp('50%')}}/>
                <Text style={{...userTagsStyles.userTagsModalTitle, color: theme == 'dark' ? Colors.white : Colors.black}}>Filter by User</Text>
                <Entypo name="cross" size={wp('6%')} color={Colors.mediumGray} onPress={() => setFilterState({...filterState, modalState: 0})} style={{position: 'absolute', left: wp('50%')}}/>
            </View>
            <SearchBar 
                placeholder='Search...'
                value={filterState.search}
                round={true}
                autoCapitalize="none"
                autoCorrect={false}
                lightTheme={theme == 'light'}
                containerStyle={{...userSearchStyles.searchBarContainer, width: wp('80%')}}
                onChangeText={(text) => setFilterState({...filterState, search: text})}/>
            <ScrollView style={{width: wp('100%'), flex: 1}}>
              <View style={{flex: 0.8}}>
                  { filterState.queryUsers && filterState.queryUsers.length > 0 && filterState.queryUsers.map((user: any) => (
                      userView(user)
                  ))}
              </View>
            </ScrollView>
          </View>
        );
    }
  }

  return (
    <View style={{width: wp('100%'), height: hp('100%')}}>

      {/* Filter View */ }
      <View style={{...styles.filterView, backgroundColor: theme == 'dark' ? Colors.darkBackground : Colors.white}}>
        <TouchableOpacity style={styles.filterIcon} onPress={() => {if (dragMode.mode == 0) {setFilterState({...filterState, modalState: 1});}}}>
          <Icon name="filter-circle" size={wp('8%')} color={theme == 'dark' ? Colors.mediumOrange : Colors.lightOrange} />
        </TouchableOpacity>
        <View style={styles.verticalLine} />
        {filterState.location_tag ? 
          <TouchableOpacity style={{...styles.locationTagOpacity, backgroundColor: Colors.lightOrange}} onPress={() => { setFilterState({...filterState, location_tag: ""}); }}>
            <Text style={styles.locationTagText}>{filterState.location_tag}</Text>
          </TouchableOpacity>
          :
          <ScrollView style={styles.locationTagView} horizontal={true} showsHorizontalScrollIndicator={false}>
            {locationTags.map((tag: string, index: number) => {
              return (
                  <TouchableOpacity key={index} style={styles.locationTagOpacity} onPress={() =>{
                    setFilterState({...filterState, location_tag: tag});
                  }}>
                    <Text style={styles.locationTagText}>{tag}</Text>
                  </TouchableOpacity>
              )
            })}
          </ScrollView>
        }
      </View>

      <MapView
        region={changingRegion}
        onRegionChangeComplete={(newRegion) => {
          setChangingRegion(newRegion);
        }}
        style={styles.mapContainer}
        showsPointsOfInterest={true}
        showsUserLocation={true}
        userInterfaceStyle={theme === "dark" ? "dark" : "light"}>
        {handleDragMode()}
      </MapView>
      
      { /* Map controls */}
      <View style={{...styles.mapControlView, marginTop: filterState.on ? hp('56.5%') : hp('63.5%')}}>
        {filterState.on &&
          <TouchableOpacity style={{...styles.mapControlButton, backgroundColor: theme == 'dark' ? Colors.darkBackground : Colors.white}} onPress={() => {if (dragMode.mode == 0) setFilterState({...filterState, search: "", queryUsers: [], on: false, user: ""})}}>
            <MaterialIcon name="search-off" size={wp('6%')} color={Colors.lightOrange} />
          </TouchableOpacity>
        }
        <TouchableOpacity style={{...styles.mapControlButton, backgroundColor: theme == 'dark' ? Colors.darkBackground : Colors.white}} onPress={() => {setLocationSearch({...locationSearch, modalVisible: true})}}>
          <FontAwesome5Icon name="search" size={wp('5%')} color={theme == 'dark' ? Colors.mediumOrange : Colors.lightOrange} />
        </TouchableOpacity>
        <TouchableOpacity style={{...styles.mapControlButton, backgroundColor: theme == 'dark' ? Colors.darkBackground : Colors.white}} onPress={setCurrentLocation}>
          <FontAwesome6 name="location-arrow" size={wp('6%')} color={theme == 'dark' ? Colors.mediumOrange : Colors.lightOrange} />
        </TouchableOpacity>
      </View>
      
      {handleDragOptions()}
      
      {/* Filter Modal */}
      <Modal 
        isVisible={filterState.modalState > 0} 
        onBackdropPress={() => {setFilterState({...filterState, modalState: 0})}}
        style={styles.pinFilterModal}>
          <>{handleFilterModal()}</>
      </Modal>
      
      { /* Location Search Modal */ }
      <Modal 
        isVisible={locationSearch.modalVisible} 
        onBackdropPress={() => setLocationSearch({...locationSearch, modalVisible: false})}
        style={userTagsStyles.userTagsModal}>
        <SafeAreaView style={{...userTagsStyles.userTagsModalView, flex: 0.5, backgroundColor: theme == 'dark' ? Colors.darkSurface : Colors.white}}>
            <View style={userTagsStyles.userTagsModalHeader}>
                <Text style={{...userTagsStyles.userTagsModalTitle, color: theme == 'dark' ? Colors.white : Colors.black}}>Search Location</Text>
                <Entypo name="cross" size={wp('6%')} color={Colors.mediumGray} onPress={() => setLocationSearch({...locationSearch, modalVisible: false})} style={{position: 'absolute', left: wp('50%')}}/>
            </View>
            <GooglePlacesAutocomplete
              placeholder="Search"
              textInputProps={{
                autoCapitalize: "none",
                autoCorrect: false,
              }}
              onPress={(data, details = null) => {
                setLocationSearch({...locationSearch, modalVisible: false});
                if (details && details.geometry && details.geometry.location) {
                  setChangingRegion({
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                } else {
                  console.log('No details found for', data);
                  setCurrentLocation();
                }
              }}
              query={{
                key: 'AIzaSyC68_tPg4ZLMBR8YTz7aSMLW43qwIXHWa4',
                language: 'en',
              }}
              styles={{
                textInputContainer: {
                  width: '90%',
                  marginTop: hp('1%'),
                  alignSelf: 'center',
                  borderWidth: wp('1.5%'),
                  borderColor: theme == 'dark' ? Colors.darkGray : Colors.lightGray,
                  borderRadius: wp('3%'),
                },
                textInput: {
                  height: 38,
                  color: theme == 'dark' ? Colors.mediumGray : Colors.black,
                  fontSize: 16,
                  backgroundColor: theme == 'dark' ? Colors.darkSurface : Colors.white,
                  fontFamily: 'Futura',
                },
                row: {
                  backgroundColor: theme == 'dark' ? Colors.darkSurface : Colors.white
                },
                poweredContainer: {
                  backgroundColor: theme == 'dark' ? Colors.darkSurface : Colors.white
                },
                predefinedPlacesDescription: {
                  color: theme == 'dark' ? Colors.mediumGray : Colors.black,
                },
                description: {
                  fontSize: 11,
                  fontFamily: 'Futura',
                  color: theme == 'dark' ? Colors.mediumGray : Colors.black,
                },
                powered: {
                  color: theme == 'dark' ? Colors.mediumGray : Colors.black,
                },
              }}
              fetchDetails={true}
            />
        </SafeAreaView>
      </Modal>
    </View> 
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    width: wp('100%'),
    height: hp('74%'),
  },
  draggableOptionsView: {
    position: 'absolute',
    top: hp('40%'),
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionIcon: {
    flex: 0.5,
    marginHorizontal: wp('2.5%'),
  },
  pinCalloutStyle: {
    height: hp('35%'),
    width: wp('50%'),
    padding: hp('1%'),
  },
  pinCalloutView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCalloutTitle: {
    fontSize: 18,
    fontFamily: 'ChunkFive',
    fontWeight: 'bold',
    marginBottom: hp('0.5%')
  },
  pinCalloutUsername: {
    fontSize: 16,
    fontStyle: 'italic',
    fontFamily: 'Futura',
    color: Colors.darkGray,
    marginBottom: hp('0.5%')
  },
  pinCalloutImage: {
    width: wp('50%'),
    height: hp('20%'),
    borderRadius: hp('1%'),
    resizeMode: 'center',
  },
  pinCalloutViewButton: {
    backgroundColor: Colors.darkOrange,
    borderWidth: 0,
    borderRadius: hp('1%'),
    height: hp('3%'),
    width: wp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCalloutViewButtonText: {
    color: Colors.white, 
    fontWeight: '700', 
    fontFamily: 'ChunkFive', 
    fontSize: 12,
    textAlign: 'center'
  },
  mapControlView: {
    flexDirection: 'column',
    position: 'absolute',
    padding: hp('1%'),
    marginLeft: wp("82.5%"),
    marginTop: hp("62.5%")
  },
  mapControlButton: {
    backgroundColor: 'white',
    borderWidth: 0,
    borderRadius: hp('3%'),
    height: hp('6%'),
    width: hp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    flex: 0.5,
    marginVertical: hp('0.5%')
  },
  filterView: {
    height: hp('6%'),
    width: wp('100%'),
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginLeft: wp('3%'),
  },
  verticalLine: {
    height: hp('80%'),
    width: 1,
    backgroundColor: Colors.mediumGray,
    marginHorizontal: wp('3%'),
  },
  locationTagView: {
    flexDirection: 'row',
    marginVertical: hp('0.5%')
  },
  locationTagOpacity: {
    borderWidth: 0,
    borderRadius: hp('2%'),
    backgroundColor: Colors.whiteOrange,
    marginHorizontal: wp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
    padding: hp('1%'),
  },
  locationTagText: {
    fontSize: 11,
    fontFamily: 'Futura',
    color: Colors.darkGray,
    textAlign: "center",
    fontWeight: 'bold'
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: wp('75%'),
  },
  pinFilterModal: {
    justifyContent: 'center',
  },
  pinFilterModalView: {
    backgroundColor: 'white',
    padding: hp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: hp('1%'),
    flex: 0.3,
  },
  pinFilterModalTitle: {
    fontSize: 20,
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    fontFamily: 'Futura',
  },
  filterVisibilityOpacity: {
    flex: 1,
    flexDirection: 'row',
    padding: hp('1%'),
    alignItems: 'center',
  },
  filterVisibilityText: {
    flex: 0.99,
    marginLeft: wp('1%'),
    fontSize: 18,
    fontFamily: 'Futura',
  },
});

export default Map;
