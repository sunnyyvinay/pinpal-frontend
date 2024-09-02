import React, {useState} from 'react';
import Modal from "react-native-modal";
import { Button } from '@rneui/themed';
import {StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import GetLocation, { isLocationError } from 'react-native-get-location';
import { useAppContext } from '../AppContext';

function AddPinOptions({ route, navigation }: any): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const { setDragMode } = useAppContext();

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
      return {latitude: newLocation.latitude, longitude: newLocation.longitude};
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
          setModalVisible(true);
        }}
        style={styles.buttonStyle}>
        <Icon name={'add'} size={40} color={Colors.white}/>
      </TouchableOpacity>

      <View>
        <Modal
          isVisible={modalVisible}
          style={styles.contentView}
          onBackdropPress={() => setModalVisible(false)}>
          <View style={styles.content}>
            <Text style={styles.contentTitle}>Add pin at..</Text>
            <Button 
                title="Current location" 
                color={Colors.white}
                buttonStyle={styles.optionButton}
                titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation' }}
                containerStyle={styles.optionButtonContainer}
                onPress= {() => {
                  setModalVisible(false);
                  navigation.navigate("New pin", { params : getCurrLocation() });
                }} />
            <Button 
                title="Dragged location" 
                color={Colors.white}
                buttonStyle={styles.optionButton}
                titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation' }}
                containerStyle={styles.optionButtonContainer}
                onPress= {() => {
                  setModalVisible(false);
                  setDragMode(true);
                  navigation.navigate("NavBar");
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 5,
  },
  contentView: {
    justifyContent: 'center',
  },
  buttonStyle: {
    height: 80,
    width: 80,
    backgroundColor: Colors.darkOrange,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: Colors.mediumOrange
  },
  optionButtonContainer: {
    width: '75%',
    marginTop: 20,
  }
});

export default AddPinOptions;
