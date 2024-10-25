import { View,  useWindowDimensions, ActivityIndicator, PermissionsAndroid, Platform, } from 'react-native'
import React, {useState, useEffect} from 'react'
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
// import Geolocation from 'react-native-geolocation-service';
import * as Location from 'expo-location';
import Entypo from '@expo/vector-icons/Entypo';
import styles from './styles'

const Map = ({location, setLocation, orders}) => {

  const {width, height} = useWindowDimensions()
  
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          return;
        }

        // Watch the user's location and update it continuously
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 20000, // Update location every 20 seconds
            distanceInterval: 300, // Update location every 300 meters
          },
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            console.log('Updated Location:', position);
          }
        );
      } catch (error) {
        console.error('Location permission error:', error);
        setErrorMsg('Failed to request location permission');
      }
    };

    requestLocationPermission();

    // Cleanup when the component unmounts
    return () => {
      Location.hasServicesEnabledAsync().then((enabled) => {
        if (enabled) {
          Location.stopLocationUpdatesAsync();
        }
      });
    };
  }, [setLocation]);

  if (!location || !location.latitude || !location.longitude) {
    return <ActivityIndicator style={{ marginTop: 90 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <MapView
      style={{width, height:height- 110}}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation
      followsUserLocation
      />
    </View>
  )
}

export default Map
