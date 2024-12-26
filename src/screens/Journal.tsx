import React, { useCallback, useState } from 'react';
import { getPins, getTaggedPins, getUser, getUserFriends } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Colors from '../constants/colors';
import { Divider } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';

function Journal({ route, navigation }: any): React.JSX.Element {
  const [userData, setUserData] = useState<any>({});
  type JournalState = {
    pins: any[];
    friends: any[];
    tagged_pins: any[];
  }
  const [journalData, setJournalData] = useState<JournalState>({
    pins: [],
    friends: [],
    tagged_pins: []
  });

  const [tagged, setTagged] = useState<boolean>(false);
  
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
            const user_id  = await AsyncStorage.getItem("user_id");
            if (user_id) {
                const userData = await getUser(user_id);
                setUserData(userData.user);
                const pinData = await getPins(user_id);
                const friendData = await getUserFriends(user_id);
                const taggedPinData = await getTaggedPins(user_id);
                setJournalData({ ...journalData, friends: friendData.friends ? friendData.friends : [], pins: pinData.pins ? pinData.pins : [], tagged_pins: taggedPinData.pins ? taggedPinData.pins : [] });
            } else {
                navigation.navigate("Welcome");
            }
        } catch (error) {
            console.log("Error fetching Settings data: ", error);
        } 
    }
    fetchUserData();
    }, [])
  );

  return (
    <ScrollView style={{width: '100%', height: '100%', backgroundColor: Colors.white}}>
      <View style={styles.profileContainer}>
        <Image source={userData.profile_pic && userData.profile_pic != "" ? {uri: userData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
        <View style={styles.nameContainer}>
          <Text style={styles.fullNameStyle}>{userData.full_name}</Text>
          <Text style={styles.usernameStyle}>@{userData.username}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard}>
          <Text style={styles.statTextNum}>{journalData.pins.length}</Text>
          <Text style={styles.statTextLabel}>Pins</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard}
          onPress={() => navigation.navigate("UserList", {id: userData.user_id, type: "Friends"})}>
          <Text style={styles.statTextNum}>{journalData.friends.length}</Text>
          <Text style={styles.statTextLabel}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{...styles.statCard, backgroundColor: tagged ? Colors.mediumOrange : Colors.whiteOrange}} onPress={() => setTagged(!tagged)}>
          <Text style={{...styles.statTextNum, color: tagged ? Colors.white : Colors.black}}>{journalData.tagged_pins.length}</Text>
          <Text style={{...styles.statTextLabel, color: tagged ? Colors.white : Colors.black}}>Tagged Pins</Text>
        </TouchableOpacity>
      </View>

        <TouchableOpacity 
            style={styles.editButtonContainer}
            onPress={() => navigation.navigate("Settings")}>
            <MaterialIcons name='edit' size={hp('2%')} color={Colors.white} style={{marginRight: wp('1%')}}/>
            <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      
      <Divider style={styles.dividerStyle}/>

      <View style={styles.journalPinView}>
        {!tagged && journalData.pins.length == 0 &&
          <View style={styles.noPinsView}>
            <FontAwesome6Icon name='map-location-dot' size={hp('10%')} color={Colors.mediumGray} style={{marginBottom: hp('1%')}}/>
            <Text style={styles.noPinsText}>You don't have any pins yet</Text>
          </View>
        }
        {!tagged && journalData.pins.length != 0 && journalData.pins.map((pin: any) => {
          return (
            <TouchableOpacity key={pin.pin_id} onPress={() => navigation.navigate("Pin detail", {pin_id: pin.pin_id, pin_user_id: pin.user_id})}>
              <Image source={{uri: pin.photo || require('../../assets/images/default-pfp.jpg')}} style={styles.journalPinImage} />
            </TouchableOpacity>
          )
        }).reverse()}

        {tagged && journalData.tagged_pins.length == 0 &&
          <View style={styles.noPinsView}>
            <FontAwesome6Icon name='map-location-dot' size={hp('10%')} color={Colors.mediumGray} style={{marginBottom: hp('1%')}}/>
            <Text style={styles.noPinsText}>You're not tagged in any pins</Text>
          </View>
        }
        {tagged && journalData.tagged_pins.length != 0 && journalData.tagged_pins.map((pin: any) => {
          return (
            <TouchableOpacity key={pin.pin_id} onPress={() => navigation.navigate("Pin detail", {pin_id: pin.pin_id, pin_user_id: pin.user_id})}>
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
    width: hp('5%'),
    height: hp('5%'),
    borderRadius: hp('2.5%'),
    borderWidth: hp('0.2%'),
    borderColor: Colors.mediumOrange,
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
  editButtonContainer: {
    width: wp('90%'),
    height: hp('3%'),
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.lightOrange,
    borderRadius: hp('1%'),
    marginVertical: hp('2%'),
    marginHorizontal: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  editButtonText: {
    color: Colors.white, 
    fontWeight: '500', 
    fontFamily: 'ChunkFive', 
    fontSize: 15,
    marginLeft: wp('1%')
  },
  statsContainer: {
    margin: wp('1%'),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: Colors.whiteOrange,
    flex: 1,
    marginHorizontal: wp('2%'),
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
    margin: hp('1%'),
  },
  journalPinView: {
    width: '100%',
    height: '100%',
    display: 'flex',
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

export default Journal;
