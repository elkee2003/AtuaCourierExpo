import { View, Text, useWindowDimensions, ActivityIndicator, PermissionsAndroid, Platform, } from 'react-native';
import React, { useState, useEffect, } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {GOOGLE_API_KEY} from '../../keys'
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Entypo from '@expo/vector-icons/Entypo';
import styles from './styles';
import { orders } from '@/assets/data/orders';

const OrderDeliveryMap = ({
        mapRef, 
        setTotalKm, 
        setTotalMins,
        order, 
        setIsCourierClose,
        isPickedUp,
        location,
        setLocation,
      
    }) => {
        const { width, height } = useWindowDimensions();
        const [avaliableOrders, setAvaliableOrders] = useState(orders);
        const [errorMsg, setErrorMsg] = useState(null);

        useEffect(() => {
            let watchId;
        
            const requestLocationPermission = async () => {
                try {
                    // For both iOS and Android
                    if (Platform.OS === 'ios' || Platform.OS === 'android') {
                    Geolocation.requestAuthorization(); // Request permission on iOS and Android
                    }
            
                    // Watch the user's location and update it continuously
                    watchId = Geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ latitude, longitude });
                        console.log('Updated Location:', position);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        setErrorMsg('Error fetching location');
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 20000,
                        maximumAge: 1000,
                        distanceFilter: 500, // Update based on distance (e.g., every 500 meters)
                    }
                    );
                } catch (error) {
                    console.error('Location permission error:', error);
                    setErrorMsg('Failed to request location permission');
                }
            };
        
            requestLocationPermission();
        
            // Cleanup subscription when the component unmounts
            return () => {
              if (watchId !== null) {
                Geolocation.clearWatch(watchId);
              }
            };
        }, []);

        if (!location || !location.latitude || !location.longitude) {
            return <ActivityIndicator style={{ marginTop: 30 }} size="large" />;
        }

        // For Order coordinates
        // const userLocationCoords = {
        //     latitude: order.User.originLat,
        //     longitude: order.User.originLng,
        // };

        // Function to Change the Latitude and Longitude of MapDirection
        const getDestination=()=>{
            if (isPickedUp){
            return{
                latitude:order.User.destLat,
                longitude:order.User.destLng,
            }
            }return{
            latitude:order.User.originLat,
            longitude:order.User.originLng,
            }
        }

    return (
        <View style={styles.container}>
            <MapView
              ref={mapRef}
              style={{ width, height: height - 50 }}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
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
                {avaliableOrders.map(order => (
                    <Marker
                        key={order.id}
                        title={order.User.name}
                        description={order.User.address}
                        coordinate={{
                            latitude: order.User.originLat,
                            longitude: order.User.originLng,
                        }}
                    >
                        <View style={{ backgroundColor: '#04b831', padding: 5, borderRadius: 20 }}>
                            <Entypo name={'location-pin'} color={'white'} size={24} />
                        </View>
                    </Marker>
                ))}

                {/* Destination Marker */}
                {avaliableOrders.map(order => (
                    <Marker
                        key={order.id}
                        title={order.User.name}
                        description={'Destination Location'}
                        coordinate={{
                            latitude: order.User.destLat,
                            longitude: order.User.destLng,
                        }}
                    >
                        <View style={{ backgroundColor: 'red', padding: 5, borderRadius: 20 }}>
                            <Entypo name={'location-pin'} color={'white'} size={24} />
                        </View>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
}

export default OrderDeliveryMap;
