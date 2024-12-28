import React, { useEffect, useState } from 'react';
import { getFriendStatus, getUser, createFriendRequest, deleteFriendRequest, acceptFriendRequest, getUserFriends, getPins, getTaggedPins} from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl, Image } from 'react-native';
import * as Colors from '../constants/colors';
import { Divider } from '@rneui/themed';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';

function Profile(props: any): React.JSX.Element {
  const [currUser, setCurrUser] = useState<string|null>("");
  const [userData, setUserData] = useState<any>({});
  const [friendStatus, setFriendStatus] = useState<number>(-1); // -1 for not friends, 0 for pending, 1 for friends, -2 for pending
  type ProfileState = {
    pins: any[];
    friends: any[];
    tagged_pins: any[];
  }
  const [profileData, setProfileData] = useState<ProfileState>({
    pins: [],
    friends: [],
    tagged_pins: []
  });

  const [tagged, setTagged] = useState<boolean>(false);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUserData = async () => {
    try {
        const user_id  = props.route.params.user_id;
        const curr_user_id = await AsyncStorage.getItem("user_id");
        setCurrUser(curr_user_id);
        if (user_id) {
            const userData = await getUser(user_id);
            setUserData(userData.user);
            const friendStatusData = await getFriendStatus(curr_user_id, user_id);
            setFriendStatus(friendStatusData.status);
            const friendData = await getUserFriends(user_id);

            const pinData = await getPins(user_id);
            
            let displayedPinData = [];
            if (curr_user_id != user_id) {
              for (const pin of pinData.pins) {
                if (pin.visibility == 2) {
                  displayedPinData.push(pin);
                } else if (pin.visibility == 1 && friendStatusData.status == 1) {
                  displayedPinData.push(pin);
                }
              }
            } else {
              displayedPinData = pinData.pins ? pinData.pins : [];
            }
            
            const taggedData = await getTaggedPins(user_id);
            let displayedTaggedPinData = [];
            if (curr_user_id != user_id) {
              for (const pin of taggedData.pins) {
                if (pin.visibility == 2) {
                  displayedTaggedPinData.push(pin);
                } else if (pin.visibility == 1) { // check if curr user is friends with tagged pin user
                  const tagged_pin_user = pin.user_id;
                  const tagged_pin_user_friend_status = await getFriendStatus(curr_user_id, tagged_pin_user);
                  if (tagged_pin_user == curr_user_id || tagged_pin_user_friend_status.status == 1) {
                    displayedTaggedPinData.push(pin);
                  }
                }
              }
            } else {
              displayedTaggedPinData = taggedData.pins ? taggedData.pins : [];
            }
            
            setProfileData({ ...profileData, friends: friendData.friends ? friendData.friends : [], pins: displayedPinData, tagged_pins: displayedTaggedPinData});
        } else {
            props.navigation.navigate("Welcome");
        }
    } catch (error) {
        console.log("Error fetching profile data: ", error);
    } 
  }
  
  useEffect(() => {
    fetchUserData();
}, [props.route.params.user_id]);

  const friendRequestView = () => {
    if (props.route.params.user_id == currUser) {
      return (
        <TouchableOpacity 
            style={{...styles.requestOpacity, backgroundColor: Colors.lightOrange}}
            onPress={() => props.navigation.navigate("Settings")}>
            <MaterialIcons name='edit' size={hp('2%')} color={Colors.white} />
            <Text style={styles.requestText}>Edit Profile</Text>
        </TouchableOpacity>
      );
    }

    switch(friendStatus) {
      case -1:
        return (
          <TouchableOpacity 
            style={{...styles.requestOpacity, backgroundColor: Colors.lightOrange}}
            onPress={ async () => {
              createFriendRequest(currUser, userData.user_id);
              setFriendStatus(0);
            }}>
            <Icon name='person-add' size={hp('2%')} color={Colors.white} />
            <Text style={styles.requestText}>Add Friend</Text>
          </TouchableOpacity>
        );
      case 0:
        return (
          <TouchableOpacity 
            style={{...styles.requestOpacity, backgroundColor: Colors.mediumGray}}
            onPress={ async () => {
              deleteFriendRequest(currUser, userData.user_id);
              setFriendStatus(-1);
            }}>
            <Text style={styles.requestText}>Requested</Text>
          </TouchableOpacity>
        );
      case 1:
        return (
          <TouchableOpacity 
            style={{...styles.requestOpacity, backgroundColor: Colors.mediumOrange}}
            onPress={ async () => {
              deleteFriendRequest(currUser, userData.user_id);
              setFriendStatus(-1);
            }}>
            <Text style={styles.requestText}>Friends</Text>
          </TouchableOpacity>
        );
      case -2:
        return (
          <TouchableOpacity 
            style={{...styles.requestOpacity, backgroundColor: Colors.lightOrange}}
            onPress={async() => {
              acceptFriendRequest(currUser, userData.user_id);
              setFriendStatus(1);
            }}>
            <FontAwesome5 name='user-check' size={hp('2%')} color={Colors.white} />
            <Text style={styles.requestText}>Accept Friend Request</Text>
          </TouchableOpacity>
        );
    }
  }

  return (
    <ScrollView style={{width: '100%', height: '100%', backgroundColor: Colors.white}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {setRefreshing(true); fetchUserData(); setRefreshing(false);}}
          colors={[Colors.whiteGray]}
          progressBackgroundColor={Colors.mediumGray}
        />
      }>
      <View style={styles.profileContainer}>
        <Image source={userData && userData.profile_pic && userData.profile_pic != "" ? {uri: userData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
        <View style={styles.nameContainer}>
          <Text style={styles.fullNameStyle}>{userData.full_name}</Text>
          <Text style={styles.usernameStyle}>@{userData.username}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard}>
          <Text style={styles.statTextNum}>{profileData.pins.length || 0}</Text>
          <Text style={styles.statTextLabel}>Pins</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard}
          onPress={() => props.navigation.navigate("UserList", {id: userData.user_id, type: "Friends"})}>
          <Text style={styles.statTextNum}>{profileData.friends.length || 0}</Text>
          <Text style={styles.statTextLabel}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{...styles.statCard, backgroundColor: tagged ? Colors.mediumOrange : Colors.whiteOrange}} onPress={() => setTagged(!tagged)}>
          <Text style={{...styles.statTextNum, color: tagged ? Colors.white : Colors.black}}>{profileData.tagged_pins.length || 0}</Text>
          <Text style={{...styles.statTextLabel, color: tagged ? Colors.white : Colors.black}}>Tagged Pins</Text>
        </TouchableOpacity>
      </View>

      <View style={{width: '100%', height: hp('5%')}}>
        {friendRequestView()}
      </View>
      
      <Divider style={styles.dividerStyle}/>

      <View style={styles.journalPinView}>
        {!tagged && profileData.pins.length == 0 &&
          <View style={styles.noPinsView}>
            <FontAwesome6Icon name='map-location-dot' size={hp('10%')} color={Colors.mediumGray} style={{marginBottom: hp('1%')}}/>
            <Text style={styles.noPinsText}>This user has no pins</Text>
          </View>
        }
        {!tagged && profileData.pins.length != 0 && profileData.pins.map((pin: any) => {
          return (
            <TouchableOpacity key={pin.pin_id} onPress={() => props.navigation.navigate("Pin detail", {pin_id: pin.pin_id, pin_user_id: pin.user_id})}>
              <Image source={{uri: pin.photo}} style={styles.journalPinImage} />
            </TouchableOpacity>
          )
        }).reverse()}

        {tagged && profileData.tagged_pins.length == 0 &&
          <View style={styles.noPinsView}>
            <FontAwesome6Icon name='map-location-dot' size={hp('10%')} color={Colors.mediumGray} style={{marginBottom: hp('1%')}}/>
            <Text style={styles.noPinsText}>This user has no tagged pins</Text>
          </View>
        }
        {tagged && profileData.tagged_pins.length != 0 && profileData.tagged_pins.map((pin: any) => {
          return (
            <TouchableOpacity key={pin.pin_id} onPress={() => props.navigation.navigate("Pin detail", {pin_id: pin.pin_id, pin_user_id: pin.user_id})}>
              <Image source={{uri: pin.photo}} style={styles.journalPinImage} />
            </TouchableOpacity>
          )
        }).reverse()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    margin: hp('1%'),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pfpImage: {
    width: hp('8%'),
    height: hp('8%'),
    borderRadius: hp('4%'),
    borderWidth: hp('0.2%'),
    borderColor: Colors.mediumOrange,
    backgroundColor: Colors.whiteGray
  },  
  nameContainer: {
    flex: 1, 
    marginLeft: wp('2%'),
    alignSelf: 'center'
  },
  fullNameStyle: {
    fontSize: 15,
    fontFamily: 'Futura',
    color: Colors.black
  },
  usernameStyle: {
    fontSize: 13,
    fontFamily: 'Futura',
    color: Colors.mediumGray
  },
  statsContainer: {
    margin: hp('0.5%'),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: Colors.whiteOrange,
    flex: 1,
    marginHorizontal: hp('1%'),
    alignSelf: 'center',
    borderRadius: hp('1%'),
    paddingVertical: hp('0.5%')
  },
  statTextNum: {
    color: Colors.black,
    fontFamily: 'Futura',
    fontSize: 15,
    alignSelf: 'center',
  },
  statTextLabel: {
    color: Colors.darkGray,
    fontFamily: 'Futura',
    fontSize: 12,
    alignSelf: 'center',
  },
  dividerStyle: {
    margin: hp('1%')
  },
  requestOpacity: {
    width: wp('90%'),
    alignSelf: 'center',
    borderRadius: hp('1%'),
    marginVertical: hp('1%'),
    marginHorizontal: wp('5%'),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightOrange
  },
  requestText: {
    color: Colors.white,
    fontFamily: 'ChunkFive',
    fontWeight: '300',
    fontSize: 15,
    marginLeft: wp('1%')
  },
  journalPinView: {
    width: '100%',
    display: 'flex',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    paddingHorizontal: wp('1%')
  },
  journalPinImage: {
    width: hp('12.5%'),
    height: hp('12.5%'),
    borderRadius: hp('1%'),
    marginVertical: hp('0.5%'),
    marginHorizontal: wp('2.5%'),
    alignSelf: 'center'
  },
  noPinsView: {
    width: '100%',
    height: '75%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPinsText: {
    color: Colors.mediumGray,
    fontFamily: 'ChunkFive',
    fontSize: 15,
    alignSelf: 'center',
    marginTop: hp('2%')
  }
});

export default Profile;
