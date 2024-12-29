import React, {useEffect, useState} from 'react';
import Modal from "react-native-modal";
import { Button } from '@rneui/themed';
import {StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import GetLocation, { isLocationError } from 'react-native-get-location';
import { useAppContext } from '../AppContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AddPinOptions({ route, navigation }: any): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  var lat_long = {latitude : 0, longitude: 0};
  const { dragMode, setDragMode } = useAppContext();

  const [theme, setTheme] = React.useState('light');
    useEffect(() => {
        const getTheme = async () => {
            setTheme(await AsyncStorage.getItem('theme') || 'light');
        }
        getTheme();
    })

  const getCurrLocation = async () => {
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
      lat_long = {latitude: newLocation.latitude, longitude: newLocation.longitude};
    })
    .catch(ex => {
      if (isLocationError(ex)) {
        const {code, message} = ex;
        console.warn(code, message);
      } else {
        console.warn(ex);
      }
    })
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (dragMode.mode === 0) {
            setModalVisible(true);
          }
        }}
        style={{...styles.buttonStyle, backgroundColor: Colors.darkOrange}}>
        <Icon name={'add'} size={40} color={Colors.white}/>
      </TouchableOpacity>

      <View>
        <Modal
          isVisible={modalVisible}
          style={styles.contentView}
          onBackdropPress={() => setModalVisible(false)}>
          <View style={{...styles.content, backgroundColor: theme === 'dark' ? Colors.darkGray : Colors.white}}>
            <Text style={{...styles.contentTitle, color: theme === 'dark' ? Colors.white : Colors.black}}>Add pin at..</Text>
            <Button 
                title="Current location" 
                color={Colors.white}
                buttonStyle={styles.optionButton}
                titleStyle={{ color: Colors.white, fontWeight: '400', fontFamily: 'ChunkFive' }}
                containerStyle={styles.optionButtonContainer}
                onPress= {async () => {
                  setModalVisible(false);
                  await getCurrLocation();
                  navigation.navigate("New pin", { latitude: lat_long.latitude, longitude: lat_long.longitude });
                }} />
            <Button 
                title="Dragged location" 
                color={Colors.white}
                buttonStyle={styles.optionButton}
                titleStyle={{ color: Colors.white, fontWeight: '400', fontFamily: 'ChunkFive' }}
                containerStyle={styles.optionButtonContainer}
                onPress= {() => {
                  setModalVisible(false);
                  setDragMode({mode: 1, location: {latitude: 0, longitude: 0}, pin_index: -1});
                  navigation.navigate("NavBar", { screen: 'Map' });
                }} />
          </View>
        </Modal>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  content: {
    backgroundColor: 'white',
    padding: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('2.5%'),
  },
  contentTitle: {
    fontSize: wp('5%'),
    marginBottom: hp('1%'),
    fontFamily: 'Futura',
  },
  contentView: {
    justifyContent: 'center',
  },
  buttonStyle: {
    height: hp('7%'),
    width: hp('7%'),
    backgroundColor: Colors.darkOrange,
    borderRadius: hp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
  },
  optionButton: {
    backgroundColor: Colors.mediumOrange,
    borderRadius: wp('5%')
  },
  optionButtonContainer: {
    width: wp('75%'),
    marginTop: hp('2%'),
  }
});

export default AddPinOptions;
