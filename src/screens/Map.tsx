import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import GetLocation, { isLocationError, Location } from 'react-native-get-location';
import MapView, { Callout, CalloutSubview, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPins, getUser, getUserFriends, updatePin, updatePinLocation } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from '@rneui/base';
import * as Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../AppContext';
import { Button } from '@rneui/themed';

function Map({ route, navigation }: { route: any, navigation: any }): React.JSX.Element {
  const { region, setRegion, dragMode, setDragMode } = useAppContext();
  const [changingRegion, setChangingRegion] = useState<any>({});
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

  const tempImg = "https://images.unsplash.com/photo-1720802616209-c174c23f6565?q=80&w=2971&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  useEffect(() => {
    const setInitialMapState = async () => {  
      await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        rationale: {
          title: 'Location permission',
          message: 'PinPal needs the permission to request your location.',
          buttonPositive: 'Ok',
        },
      })
      .then(newLocation => {
        setRegion({latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05});
        setChangingRegion({latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05});
      })
      .catch(ex => {
        if (isLocationError(ex)) {
          const {code, message} = ex;
          console.warn(code, message);
          setRegion({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05});
          setChangingRegion({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05});
        } else {
          console.warn(ex);
        }
      })
    }

    setInitialMapState();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const setPinState = async () => {
        const user_id = await AsyncStorage.getItem("user_id");
        if (user_id) {
          // PERSONAL PINS
          const personalPins = await getPins(user_id);
          setPins(personalPins.pins);
          
          // FRIEND PINS
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
            friendData.friends[i] = {user: friend.user, pins: pin.pins};
          }
          setFriendPins([...friendData.friends]);

        // PUBLIC PINS

        } else {
          navigation.navigate("Welcome");
        }
      }

      setPinState();
    }, [])
  );

  const handleDragMode = () => {
    switch (dragMode.mode) {
      case 0:
        return (
          <React.Fragment>
            {pins && pins.map((personalPin: any, index: number) => (
            <Marker
              key={personalPin.pin_id}  
              coordinate={{latitude: personalPin.latitude, longitude: personalPin.longitude}}
              image={require('../../assets/images/personal-pin.png')}
              title={personalPin.title} >
                <Callout style={styles.pinCalloutStyle}>
                  <CalloutSubview style={styles.pinCalloutView}>
                    <Text style={styles.pinCalloutTitle}>{personalPin.title}</Text>
                    <Text style={styles.pinCalloutPersonal}>Personal Pin</Text>
                    <Image source={{uri: tempImg}} style={styles.pinCalloutImage}/>
                  </CalloutSubview>

                  <CalloutSubview style={{justifyContent: 'space-evenly', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { 
                          setChangingRegion({latitude: personalPin.latitude, longitude: personalPin.longitude, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta});
                          setRegion({latitude: personalPin.latitude, longitude: personalPin.longitude, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta});
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
                  </CalloutSubview>
                </Callout>
            </Marker>
          ))}
          
        {friendPins && friendPins.map((friend: any, index: number) => (
          friend && friend.pins && friend.pins.map((friendPin: any, index: number) => (
            friendPin.visibility > 0 &&
            <Marker
              key={friendPin.pin_id}  
              coordinate={{latitude: friendPin.latitude, longitude: friendPin.longitude}}
              image={require('../../assets/images/friend-pin.png')}
              title={friendPin.title} >
                <Callout style={styles.pinCalloutStyle}>
                  <CalloutSubview style={styles.pinCalloutView}>
                    <Text style={styles.pinCalloutTitle}>{friendPin.title}</Text>
                    <Text style={styles.pinCalloutPersonal}>@{friend.user.username}</Text>
                    <Image source={{uri: tempImg}} style={styles.pinCalloutImage}/>
                  </CalloutSubview>

                  <CalloutSubview style={{justifyContent: 'space-evenly', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <CalloutSubview style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => { navigation.navigate("Pin detail", { pin_id: friendPin.pin_id, pin_user_id: friendPin.user_id })}}>
                      <Button 
                          title="View" 
                          buttonStyle={styles.pinCalloutViewButton}
                          color={Colors.white}
                          titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation', fontSize: 12 }} />
                    </CalloutSubview>
                  </CalloutSubview>
                </Callout>
            </Marker>
          ))))}
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
              navigation.navigate("New pin", { latitude: region.latitude, longitude: region.longitude })
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
      <MapView
        region={region}
        onRegionChange={(newRegion) => {
          setChangingRegion(newRegion);
        }}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
        }}
        style={styles.mapContainer}
        showsPointsOfInterest={true}>
        
        {handleDragMode()}

      </MapView>
      
      {handleDragOptions()}

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
    height: 260,
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
    width: 150,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 5
  },
  pinCalloutViewButton: {
    backgroundColor: Colors.darkOrange,
    borderWidth: 0,
    borderRadius: 10,
    height: 30,
    width: 80,
  }
});

export default Map;
