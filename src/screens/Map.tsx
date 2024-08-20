import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import GetLocation, { isLocationError, Location } from 'react-native-get-location';
import MapView from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

function Map(): React.JSX.Element {
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
    })}, []);

  return (
    <SafeAreaView style={{width: '100%', height: '100%'}}>
      <MapView
        region={mapState.region}
        onRegionChange={(region) => setMapState({ region })}
        style={styles.mapContainer}
      >
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
