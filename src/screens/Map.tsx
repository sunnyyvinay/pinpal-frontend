import React from 'react';
import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

function Map(): React.JSX.Element {
  const [mapState, setMapState] = React.useState({
    region: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
  });

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
