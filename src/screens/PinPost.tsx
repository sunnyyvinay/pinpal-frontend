import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getPin, getUser } from '../services/user.service';
import { useRoute } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Colors from '../constants/colors';
import { Button } from '@rneui/themed';

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

  return (
    <ScrollView>
      <View style={styles.topView}>
        <View style={styles.userView}>
          <Image source={pinUserData.profile_pic ? {uri: pinUserData.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.pfpImage} />
          <Text style={styles.usernameText}>{pinUserData.username}</Text>
        </View>
        {personal ? 
        <Button 
          title="Edit"
          buttonStyle={styles.editButton}
          containerStyle={styles.editButtonContainer}
          titleStyle={{ color: Colors.white, fontWeight: '500', fontFamily: 'Sansation', fontSize: 16 }} 
          icon={{ name: 'edit', color: Colors.white, size: 16}}
          onPress={() => props.navigation.navigate("Settings")} /> 
        : null}
      </View>

      <Text style={styles.pinTitleText}>{pinData.title}</Text>

      {/* TODO: Add photo carousel */}

      <View style={styles.captionView}>
        <Text>
          <Text>asdfasdf</Text>
          <Text style={styles.captionText}>dsfadfasdfas</Text>
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

      <View style={styles.likesView}>

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
    flex: 0.9,
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
    marginBottom: 10,
  },
  usernameText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Sansation',
    marginLeft: 5,
  },
  editButton: {
    width: '100%',
    backgroundColor: Colors.mediumOrange,
  },
  editButtonContainer: {
    flex: 0.25,
    alignSelf: 'center',
  },
  locationTagsButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 5,
    rowGap: 5,
  },
  locationTagButton: {
    backgroundColor: Colors.whiteOrange,
    borderWidth: 0,
    borderRadius: 20,
  },
  pinTitleText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Sansation',
    color: Colors.black,
    marginVertical: 10,
  },
  captionView: {
    backgroundColor: Colors.whiteOrange,
    borderWidth: 0,
    borderRadius: 20,
  },
  captionText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Sansation',
    color: Colors.black,
  },
  likesView: {
    
  },
  likeIcon: {

  }
})

export default PinPost;