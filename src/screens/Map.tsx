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
  type MapState = {
    personalPins: any[];
    region: {latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number};
    pinDragMode: boolean
  }
  const [mapState, setMapState] = useState<any>({});
  const { dragMode, setDragMode } = useAppContext();
  let user_id: string | null = "";

  useEffect(() => {
    const setInitialMapState = async () => {
      let currLoc = {latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05}; 
  
      await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        rationale: {
          title: 'Location permission',
          message: 'PinPal needs the permission to request your location.',
          buttonPositive: 'Ok',
        },
      })
      .then(async newLocation => {
        currLoc = {latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05};
        user_id = await AsyncStorage.getItem("user_id");
        if (user_id) {
          const personalPins = await getPins(user_id);
          setMapState({personalPins: personalPins.pins, region: currLoc, pinDragMode: dragMode});
        } else {
          navigation.navigate("Welcome");
        }
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

    setInitialMapState();
    console.log("useEffect map region: " + JSON.stringify(mapState.region));
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffect map region: " + JSON.stringify(mapState.region));
      const setPinState = async () => {
        const user_id = await AsyncStorage.getItem("user_id");
          if (user_id) {
            const personalPins = await getPins(user_id);
            setMapState({...mapState, personalPins: personalPins.pins, pinDragMode: dragMode});
          } else {
            navigation.navigate("Welcome");
          }
      }

      setPinState();
    }, [dragMode])
  );

  return (
    <View style={{width: '100%', height: '100%'}}>
      <MapView
        region={mapState.region}
        onRegionChange={(newRegion) => {setMapState({...mapState, region: newRegion}); console.log("onRegionChange: " + JSON.stringify(mapState.region))}}
        style={styles.mapContainer} >
        
        {!mapState.pinDragMode ? 
        (mapState.personalPins && mapState.personalPins.map((personalPin: any) => (
          <Marker
            key={personalPin.pin_id}  
            coordinate={{latitude: personalPin.latitude, longitude: personalPin.longitude}}
            image={require('../../assets/images/darkorange-pin.png')}
            title={personalPin.title} >
              <Callout style={styles.pinCalloutStyle}>
                <CalloutSubview style={styles.pinCalloutView}>
                  <Text style={styles.pinCalloutTitle}>{personalPin.title}</Text>
                  <Text style={styles.pinCalloutPersonal}>Personal Pin</Text>
                  {/* Image */}
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
          coordinate={{latitude: mapState.region.latitude, longitude: mapState.region.longitude}} 
          image={require('../../assets/images/darkorange-pin.png')}
          opacity={0.7} />)}
      </MapView>

      {mapState.pinDragMode ?
      (<SafeAreaView style={styles.draggableOptionsView}>
        <TouchableOpacity 
          onPress={() => {
            setDragMode(false); 
            setMapState({...mapState, pinDragMode: false})
            navigation.navigate("New pin", { latitude: mapState.region.latitude, longitude: mapState.region.longitude })
          }}>
          <Icon name="checkmark-circle" size={40} color={Colors.green} style={styles.optionIcon} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            setDragMode(false); 
            setMapState({...mapState, pinDragMode: false})
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
    height: 100,
    width: 200
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
    color: Colors.lightGray,
    marginBottom: 10
  },
  pinCalloutViewButton: {
    backgroundColor: Colors.darkOrange,
    borderWidth: 0,
    borderRadius: 20,
    height: 30,
    width: 100,
  }
});

export default Map;
