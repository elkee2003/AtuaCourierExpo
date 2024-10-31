import { View, Text, useWindowDimensions, ActivityIndicator, PermissionsAndroid, Platform, } from 'react-native';
import React, { useState, useEffect, } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {GOOGLE_API_KEY} from '../../../keys'
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Feather from '@expo/vector-icons/Feather';
import styles from './styles';
import {useOrderContext} from '@/providers/OrderProvider';
import {useAuthContext} from '@/providers/AuthProvider';
import { DataStore } from 'aws-amplify/datastore';
import {Courier} from '../../../src/models';


const OrderDeliveryMap = ({
        order,user, 
    }) => {

        const { width, height } = useWindowDimensions();
        
        const [errorMsg, setErrorMsg] = useState(null);

        const {mapRef, setTotalKm, setTotalMins, setIsCourierClose, isPickedUp, location, setLocation} = useOrderContext();

        const {dbUser} = useAuthContext()

        // useEffect for updating Courier Location in the database
        useEffect(()=>{
            if(!location){
                return;
            }

            DataStore.save(Courier.copyOf(dbUser, (updated)=>{
                updated.lat = location.latitude,
                updated.lng = location.longitude
                // updated.heading = location.heading
            }))
        },[location])

        useEffect(() => {
            let locationSubscription;
        
            const requestLocationPermission = async () => {
                try {
                    // Request location permissions
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        setErrorMsg('Permission to access location was denied');
                        return;
                    }
        
                    // Get the current location once
                    let initialLocation = await Location.getCurrentPositionAsync({});
                    setLocation({
                        latitude: initialLocation.coords.latitude,
                        longitude: initialLocation.coords.longitude,
                    });
        
                    // Watch location with updates every 20 seconds or every 500 meters
                    locationSubscription = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.High,
                            timeInterval: 20000, // 20 seconds
                            distanceInterval: 200, // 500 meters
                        },
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            setLocation({ latitude, longitude,
                            // heading: heading || 0,
                            });
                            console.log('Updated Location:', position);
                            // console.log(location.heading)
                        }
                    );
                } catch (error) {
                    console.error('Location permission error:', error);
                    setErrorMsg('Failed to request location permission');
                }
            };
        
            requestLocationPermission();
        
            // Cleanup the watcher when the component unmounts
            return () => {
                if (locationSubscription) {
                    locationSubscription.remove();
                }
            };
        }, [setLocation]);

        if (!location || !location.latitude || !location.longitude) {
            return <ActivityIndicator style={{ marginTop: 90 }} size="large" />;
        }

        // Function to Change the Latitude and Longitude of MapDirection
        const getDestination=()=>{
            if (isPickedUp){
            return{
                latitude:order.parcelDestinationLat,
                longitude:order.parcelDestinationLng,
            }
            }return{
            latitude:order.parcelOriginLat,
            longitude:order.parcelOriginLng,
            }
        }

    return (
        <View style={styles.container}>
            <MapView
              ref={mapRef}
              style={{ width, height: height - 50 }}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                    // latitude: '4.80908666666',
                    // longitude:'7.021343333333',
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
              }}
              showsUserLocation
              followsUserLocation
            >
                <MapViewDirections
                    origin={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }}
                    destination={getDestination()}
                    apikey={GOOGLE_API_KEY}
                    timePrecision='now'
                    strokeWidth={3}
                    strokeColor='red'
                    onReady={(result) => {
                        setIsCourierClose(result.distance <= 0.1);
                        setTotalMins(result.duration);
                        setTotalKm(result.distance);
                    }}
                />

                {/* Origin Marker */}
                <Marker
                    key={`${order.id}-origin`}
                    title={user.firstName}
                    description={order.parcelOrigin}
                    coordinate={{
                        latitude: order.parcelOriginLat,
                        longitude: order.parcelOriginLng,
                    }}
                >
                    <View style={{ backgroundColor: '#04b831', padding: 5, borderRadius: 20 }}>
                        <Feather name="box" size={30} color="black" />
                    </View>
                </Marker>

                {/* Destination Marker */}
                <Marker
                    key={`${order.id}-destination`}
                    title={user.firstName}
                    description={'Destination Location'}
                    coordinate={{
                        latitude: order.parcelDestinationLng,
                        longitude: order.parcelDestinationLng,
                    }}
                >
                    <View style={{ backgroundColor: 'red', padding: 5, borderRadius: 20 }}>
                        <Feather name="box" size={30} color="black" />
                    </View>
                </Marker>
            </MapView>
        </View>
    );
}

export default OrderDeliveryMap;

    // useEffect(() => {
        //     const requestLocationPermission = async () => {
        //         try {
        //             // Request location permissions from expo-location
        //             let { status } = await Location.requestForegroundPermissionsAsync();
        //             if (status !== 'granted') {
        //                 setErrorMsg('Location permission denied');
        //                 return;
        //             }
    
        //             // Watch the user's location and update it continuously
        //             Location.watchPositionAsync(
        //                 {
        //                     accuracy: Location.Accuracy.High,
        //                     timeInterval: 20000, // Update location every 20 seconds
        //                     distanceInterval: 500, // Update location every 500 meters
        //                 },
        //                 (position) => {
        //                     const { latitude, longitude } = position.coords;
        //                     setLocation({ latitude, longitude });
        //                     console.log('Updated Location:', position);
        //                 }
        //             );
        //         } catch (error) {
        //             console.error('Location permission error:', error);
        //             setErrorMsg('Failed to request location permission');
        //         }
        //     };
    
        //     requestLocationPermission();
    
        //     // Cleanup when the component unmounts
        //     return () => {
        //         Location.hasServicesEnabledAsync().then((enabled) => {
        //             if (enabled) {
        //                 Location.stopLocationUpdatesAsync();
        //             }
        //         });
        //     };
    // }, [setLocation]);
