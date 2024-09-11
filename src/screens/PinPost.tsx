import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getPin, getUser } from '../services/user.service';
import { useRoute } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Colors from '../constants/colors';
import { Button } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const PinPost = (props:any) => {
    const { pin_id, pin_user_id } = props.route.params;  
    const [editMode, setEditMode] = useState<boolean>(false);
    const [personal, setPersonal] = useState<boolean>(false);
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
    const [liked, setLiked] = useState<boolean>(false);

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
        setPinUserData(userData.user);
      }

        getInfo();
    }, []);

    function formatTimestamp(timestamp: string): string {
      const date = new Date(timestamp);
  
      const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      };
  
      return date.toLocaleDateString('en-US', options);
  }

  return (
    <ScrollView>
      <View style={styles.topView}>
        <View style={styles.userView}>
          <Image source={pinUserData.profile_pic ? {uri: pinUserData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
          <Text style={styles.usernameText}>{pinUserData.username}</Text>
        </View>
        {personal ? 
        <TouchableOpacity>
          <MaterialIcon name="more-vert" size={20} color={Colors.black} />
        </TouchableOpacity>
        : null}
      </View>

      <Text style={styles.pinTitleText}>{pinData.title}</Text>

      {/* TODO: Add photo carousel */}

      <View style={styles.likesView}>
        <TouchableOpacity onPress={() => setLiked(!liked)}>
          {liked ? <Icon name="heart" size={30} color={Colors.likeRed} /> : <Icon name="heart-outline" size={30} color={Colors.black} />}
        </TouchableOpacity>
        <Text style={{...styles.likesText, color: liked ? Colors.likeRed : Colors.black}}>124</Text>
      </View>

      <View style={styles.captionView}>
        <Text>
          <Text style={styles.createDateText}>{formatTimestamp(pinData.create_date)}</Text>
          <Text style={styles.captionText}>{pinData.caption ? " - \"" + pinData.caption + "\"" : null}</Text>
        </Text>
      </View>

      <View style={styles.locationTagsButtonView}>
        {pinData.location_tags.map((tag:string, index:number) => {
            return (
              <Button 
                title={tag} 
                key={index}
                buttonStyle={styles.locationTagButton}
                titleStyle={{ color: Colors.lightGray, fontWeight: '300', fontFamily: 'Sansation', fontSize: 15 }} />
            )
        })}
      </View>
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
  pinTitleText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Sansation',
    color: Colors.black,
    marginVertical: 5,
  },
  likesView: {
    alignItems: 'center',
    marginVertical: 5,
  },
  likesText: {
    marginHorizontal: 5,
    fontSize: 16,
    fontFamily: 'Sansation',
  },
  captionView: {
    backgroundColor: Colors.whiteOrange,
    borderWidth: 0,
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 15,
    padding: 10,
    textAlign: 'center',
    justifyContent: 'center',
  },
  captionText: {
    fontSize: 15,
    fontFamily: 'Sansation',
    color: Colors.black,
  },
  createDateText: {
    color: Colors.lightGray,
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
})

export default PinPost;