import React, { useCallback, useEffect, useState } from 'react';
import { getPins, getTaggedPins, getUser, getUserFriends } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Colors from '../constants/colors';
import { Button, Divider } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

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
          onPress={() => navigation.navigate("Friends", {id: userData.user_id})}>
          <Text style={styles.statTextNum}>{journalData.friends.length}</Text>
          <Text style={styles.statTextLabel}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard}>
          <Text style={styles.statTextNum}>{journalData.tagged_pins.length}</Text>
          <Text style={styles.statTextLabel}>Tagged Pins</Text>
        </TouchableOpacity>
      </View>

      <View style={{width: '100%', height: 50}}>
        <TouchableOpacity 
            style={styles.editButtonContainer}
            onPress={() => navigation.navigate("Settings")}>
            <MaterialIcons name='edit' size={15} color={Colors.white} style={{marginRight: 5}}/>
            <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <Divider style={styles.dividerStyle}/>

      <View style={styles.journalPinView}>
        {journalData.pins.length != 0 && journalData.pins.map((pin: any) => {
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
    margin: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pfpImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.mediumOrange,
  },  
  nameContainer: {
    flex: 1, 
    marginLeft: 5,
    alignSelf: 'center'
  },
  fullNameStyle: {
    fontSize: 15,
    fontFamily: 'ChunkFive',
    color: Colors.black
  },
  usernameStyle: {
    fontSize: 13,
    fontFamily: 'ChunkFive',
    color: Colors.mediumGray
  },
  editButtonContainer: {
    width: '90%',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.lightOrange,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  editButtonText: {
    color: Colors.white, 
    fontWeight: '500', 
    fontFamily: 'ChunkFive', 
    fontSize: 15,
    marginLeft: 5
  },
  statsContainer: {
    margin: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: Colors.whiteOrange,
    flex: 1,
    marginHorizontal: 10,
    alignSelf: 'center',
    borderRadius: 10,
    paddingVertical: 5
  },
  statTextNum: {
    color: Colors.black,
    fontFamily: 'ChunkFive',
    fontSize: 15,
    alignSelf: 'center',
  },
  statTextLabel: {
    color: Colors.darkGray,
    fontFamily: 'ChunkFive',
    fontSize: 12,
    alignSelf: 'center',
  },
  dividerStyle: {
    margin: 10
  },
  journalPinView: {
    width: '100%',
    display: 'flex',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  journalPinImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10
  }
});

export default Journal;
