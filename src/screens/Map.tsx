import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import GetLocation, { isLocationError, Location } from 'react-native-get-location';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPins } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Map({ route, navigation }: { route: any, navigation: any }): React.JSX.Element {
  const [mapState, setMapState] = useState<any>({});

  useEffect(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      rationale: {
        title: 'Location permission',
        message: 'PinPal needs the permission to request your location.',
        buttonPositive: 'Ok',
      },
    })
    .then(newLocation => {
      setMapState({ region: {latitude: newLocation.latitude, longitude: newLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05} });
    })
    .catch(ex => {
      if (isLocationError(ex)) {
        const {code, message} = ex;
        console.warn(code, message);
        setMapState({region: { latitude: 34.0699, longitude: -118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05 }});
      } else {
        console.warn(ex);
      }
    })

    const getPersonalPins = async () => {
      const user_id = await AsyncStorage.getItem("user_id");
      if (user_id) {
        const personalPins = await getPins(user_id);
        setMapState({personalPins: personalPins.pins});
      } else {
        navigation.navigate("Welcome");
      }
    }

    getPersonalPins();
  }, []);

  return (
    <SafeAreaView style={{width: '100%', height: '100%'}}>
      <MapView
        region={mapState.region}
        onRegionChange={(region) => setMapState({...mapState, region})}
        style={styles.mapContainer}
      >
        {mapState.personalPins && mapState.personalPins.map((personalPin: any) => (
          <Marker
            key={personalPin.pin_id}  
            coordinate={{latitude: personalPin.latitude, longitude: personalPin.longitude}}
            image={require('../../assets/images/darkorange-pin.png')}
            title={personalPin.title} />
        ))}
      </MapView>
    </SafeAreaView> 
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  }
});

export default Map;
