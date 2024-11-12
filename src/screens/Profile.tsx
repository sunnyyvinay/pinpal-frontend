import React, { useEffect, useState } from 'react';
import { getFriendStatus, getUser, createFriendRequest, deleteFriendRequest, acceptFriendRequest, getUserFriends, getPins, getTaggedPins} from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from '@rneui/base';
import * as Colors from '../constants/colors';
import { Button, Divider } from '@rneui/themed';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';

function Profile(props: any): React.JSX.Element {
  let curr_user_id: string|null = "";
  const [userData, setUserData] = useState<any>({});
  const [friendStatus, setFriendStatus] = useState<number>(-1); // -1 for not friends, 0 for pending, 1 for friends
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
  
  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const user_id  = props.route.params.user_id;
            curr_user_id = await AsyncStorage.getItem("user_id");
            if (user_id) {
                const userData = await getUser(user_id);
                setUserData(userData.user);
                const friendStatusData = await getFriendStatus(curr_user_id, user_id);
                setFriendStatus(friendStatusData.status);
                const pinData = await getPins(user_id);
                const friendData = await getUserFriends(user_id);
                const taggedData = await getTaggedPins(user_id);
                setProfileData({ ...profileData, friends: friendData.friends ? friendData.friends : [], pins: pinData.pins ? pinData.pins : [], tagged_pins: taggedData.tagged_pins ? taggedData.tagged_pins : []});
            } else {
                props.navigation.navigate("Welcome");
            }
        } catch (error) {
            console.log("Error fetching profile data: ", error);
        } 
    }
    fetchUserData();
}, [props.route.params.user_id]);

  function friendRequestView() {
    if (props.route.params.user_id == curr_user_id) {
      return null;
    }
    switch(friendStatus) {
      case -1:
        return (
          <TouchableOpacity 
            style={{...styles.requestOpacity, backgroundColor: Colors.lightOrange}}
            onPress={async() => {
              const curr_user_id = await AsyncStorage.getItem("user_id");
              createFriendRequest(curr_user_id, userData.user_id);
              setFriendStatus(0);
            }}>
            <Icon name='person-add' size={15} color={Colors.white} />
            <Text style={styles.requestText}>Add Friend</Text>
          </TouchableOpacity>
        );
      case 0:
        return (
          <TouchableOpacity 
            style={{...styles.requestOpacity, backgroundColor: Colors.mediumGray}}
            onPress={ async () => {
              const curr_user_id = await AsyncStorage.getItem("user_id");
              deleteFriendRequest(curr_user_id, userData.user_id);
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
              const curr_user_id = await AsyncStorage.getItem("user_id");
              deleteFriendRequest(curr_user_id, userData.user_id);
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
              const curr_user_id = await AsyncStorage.getItem("user_id");
              acceptFriendRequest(curr_user_id, userData.user_id);
              setFriendStatus(-1);
            }}>
            <FontAwesome5 name='user-check' size={15} color={Colors.white} />
            <Text style={styles.requestText}>Accept Friend Request</Text>
          </TouchableOpacity>
        );
    }
  }

  return (
    <ScrollView style={{width: '100%', height: '100%'}}>
      <View style={styles.profileContainer}>
        <Image source={userData.profile_pic ? {uri: userData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
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
          onPress={() => props.navigation.navigate("Friends", {id: userData.user_id})}>
          <Text style={styles.statTextNum}>{profileData.friends.length || 0}</Text>
          <Text style={styles.statTextLabel}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard}>
          <Text style={styles.statTextNum}>{profileData.tagged_pins.length || 0}</Text>
          <Text style={styles.statTextLabel}>Tagged Posts</Text>
        </TouchableOpacity>
      </View>

      <View style={{width: '100%', height: 50}}>
        {friendRequestView()}
      </View>
      
      <Divider style={styles.dividerStyle}/>

      <View style={styles.journalPinView}>
        {profileData.pins.length != 0 && profileData.pins.map((pin: any) => {
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
    flex: 1
  },  
  nameContainer: {
    flex: 1, 
    marginLeft: 5,
    alignSelf: 'center'
  },
  fullNameStyle: {
    fontSize: 15,
    fontFamily: 'Sansation',
    color: Colors.black
  },
  usernameStyle: {
    fontSize: 13,
    fontFamily: 'Sansation',
    color: Colors.lightGray
  },
  editButton: {
    width: '100%',
    backgroundColor: Colors.mediumOrange,
  },
  editButtonContainer: {
    flex: 0.25,
    alignSelf: 'center',
  },
  statsContainer: {
    margin: 10,
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
    padding: 10
  },
  statTextNum: {
    color: Colors.black,
    fontFamily: 'Sansation',
    fontSize: 15,
    alignSelf: 'center',
  },
  statTextLabel: {
    color: Colors.darkGray,
    fontFamily: 'Sansation',
    fontSize: 12,
    alignSelf: 'center',
  },
  dividerStyle: {
    margin: 10
  },
  requestOpacity: {
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestText: {
    color: Colors.white,
    fontFamily: 'Sansation',
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 5
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

export default Profile;
