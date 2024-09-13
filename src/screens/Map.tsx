import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import GetLocation, { isLocationError, Location } from 'react-native-get-location';
import MapView, { Callout, CalloutSubview, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPins } from '../services/user.service';
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
  const [pins, setPins] = useState([]);

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
          const personalPins = await getPins(user_id);
          setPins(personalPins.pins);
        } else {
          navigation.navigate("Welcome");
        }
      }

      setPinState();
    }, [])
  );

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
        
        {!dragMode ? 
        (pins && pins.map((personalPin: any) => (
          <Marker
            key={personalPin.pin_id}  
            coordinate={{latitude: personalPin.latitude, longitude: personalPin.longitude}}
            image={require('../../assets/images/darkorange-pin.png')}
            title={personalPin.title} >
              <Callout style={styles.pinCalloutStyle}>
                <CalloutSubview style={styles.pinCalloutView}>
                  <Text style={styles.pinCalloutTitle}>{personalPin.title}</Text>
                  <Text style={styles.pinCalloutPersonal}>Personal Pin</Text>
                  <Image source={{uri: tempImg}} style={styles.pinCalloutImage}/>
                </CalloutSubview>

                <CalloutSubview onPress={() => { navigation.navigate("Pin detail", { pin_id: personalPin.pin_id, pin_user_id: personalPin.user_id })}} style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Button 
                    title="VIEW PIN" 
                    buttonStyle={styles.pinCalloutViewButton}
                    color={Colors.white}
                    titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation', fontSize: 12 }} />
                </CalloutSubview>
              </Callout>
          </Marker>
        ))) 
        : 
        (<Marker 
          key={0}
          coordinate={{latitude: changingRegion.latitude, longitude: changingRegion.longitude}} 
          image={require('../../assets/images/darkorange-pin.png')}
          opacity={0.7} />)}
      </MapView>

      {dragMode ?
      (<SafeAreaView style={styles.draggableOptionsView}>
        <TouchableOpacity 
          onPress={() => {
            setDragMode(false);
            navigation.navigate("New pin", { latitude: region.latitude, longitude: region.longitude })
          }}>
          <Icon name="checkmark-circle" size={40} color={Colors.green} style={styles.optionIcon} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            setDragMode(false);
          }}>
          <MaterialIcon name="cancel" size={40} color={Colors.errorRed} style={styles.optionIcon}/>
        </TouchableOpacity>
      </SafeAreaView>) : null}
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
    height: 250,
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
    marginBottom: 10
  },
  pinCalloutViewButton: {
    backgroundColor: Colors.darkOrange,
    borderWidth: 0,
    borderRadius: 20,
    height: 30,
    width: 100,
    marginBottom: 10
  }
});

export default Map;
