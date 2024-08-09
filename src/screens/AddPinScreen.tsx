import React, {useState} from 'react';
import Modal from "react-native-modal";
import {StyleSheet, View, TouchableOpacity, Text, Button} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';

function AddPinScreen(): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
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
          style={styles.contentView}>
          <View style={styles.content}>
            <Text style={styles.contentTitle}>Add pin through..</Text>
            <Text>Map</Text>
            <Text>Journal</Text>
            <Button
                title="Close"
                onPress={() => {
                setModalVisible(false);
                }}>
            </Button>
          </View>
        </Modal>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 17,
    borderTopLeftRadius: 17,
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  contentView: {
    justifyContent: 'flex-end',
    margin: 30,
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
});

export default AddPinScreen;
