import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Touchable, TouchableOpacity, View } from 'react-native';
import GetLocation, { isLocationError, Location } from 'react-native-get-location';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPins } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from '@rneui/base';
import * as Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../AppContext';

function Map({ route, navigation }: { route: any, navigation: any }): React.JSX.Element {
  const [mapState, setMapState] = useState<any>({});
  const { dragMode, setDragMode } = useAppContext();

  const setInitialMapState = async () => {
    var currLoc = {latitude: 0, longitude: 0, latitudeDelta: 0.05, longitudeDelta: 0.05}; 

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
      const user_id = await AsyncStorage.getItem("user_id");
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

  // useEffect(() => {
  //   setInitialMapState();
  //   console.log("Inside useEffect");
  // }, []);

  useFocusEffect(
    useCallback(() => {
      setInitialMapState();
      console.log("Inside useFocusEffect");
    }, [dragMode])
  );

  return (
    <SafeAreaView style={{width: '100%', height: '100%'}}>
      <MapView
        region={mapState.region}
        onRegionChange={(region) => setMapState({...mapState, region})}
        style={styles.mapContainer} >
        
        {mapState.pinDragMode ? 
        (<SafeAreaView style={styles.dragabbleContainerView}>
          <Image source={require('../../assets/images/darkorange-pin.png')} style={styles.draggablePinImage} />
          <SafeAreaView style={styles.draggableOptionsView}>
            <TouchableOpacity onPress={() => navigation.navigate("New pin", { params : { latitide: mapState.region.latitude, longitude: mapState.region.longitude }})}>
              <Icon name="checkmark-circle" size={30} color={Colors.brightGreen} style={styles.optionIcon}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setDragMode(false)}}>
              <MaterialIcon name="cancel" size={30} color={Colors.errorRed} style={styles.optionIcon}/>
            </TouchableOpacity>
          </SafeAreaView>
        </SafeAreaView>)
        : 
        (mapState.personalPins && mapState.personalPins.map((personalPin: any) => (
          <Marker
            key={personalPin.pin_id}  
            coordinate={{latitude: personalPin.latitude, longitude: personalPin.longitude}}
            image={require('../../assets/images/darkorange-pin.png')}
            title={personalPin.title} />
        )))
        }
      </MapView>
    </SafeAreaView> 
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  dragabbleContainerView: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 2,
    justifyContent: 'center',
  },
  draggablePinImage: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain',
    opacity: 0.7,
    flex: 1
  },
  draggableOptionsView: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 30,
    justifyContent: 'space-between',
  },
  optionIcon: {
    flex: 0.5,
  }
});

export default Map;
