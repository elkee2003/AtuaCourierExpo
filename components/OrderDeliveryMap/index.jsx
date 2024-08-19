import { View, Text, useWindowDimensions, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, } from 'react';
import MapView, { Marker } from 'react-native-maps';
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
            let foregroundSubscription;

            (async () => {
                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        setErrorMsg('Permission to access location was denied');
                        return;
                    }

                    let currentLocation = await Location.getCurrentPositionAsync({});
                    console.log("Initial location:", currentLocation);

                    if (currentLocation && currentLocation.coords) {
                        setLocation({
                            coords: {
                                latitude: currentLocation.coords.latitude,
                                longitude: currentLocation.coords.longitude
                            }
                        });

                        foregroundSubscription = await Location.watchPositionAsync(
                            {
                                accuracy: Location.Accuracy.High,
                                distanceInterval: 500,
                                timeInterval: 10000,
                            },
                            (updatedLocation) => {
                                console.log("Updated location:", updatedLocation);

                                if (updatedLocation && updatedLocation.coords) {
                                    setLocation({
                                        coords: {
                                            latitude: updatedLocation.coords.latitude,
                                            longitude: updatedLocation.coords.longitude,
                                        }
                                    });
                                } else {
                                    console.error("Updated location is undefined or missing coords");
                                }
                            }
                        );

                        if (!foregroundSubscription) {
                            console.error("Location subscription failed.");
                        }
                    } else {
                        console.error("Initial location is undefined or missing coords");
                    }
                } catch (error) {
                    console.error("Error fetching location:", error);
                    setErrorMsg("Error fetching location. Please try again.");
                }
            })();

            return () => {
                if (foregroundSubscription) {
                    foregroundSubscription.remove();
                }
            };
        }, []);

        if (!location || !location.coords.latitude || !location.coords.longitude) {
            return <ActivityIndicator style={{ marginTop: 30 }} size={"large"} />;
        }

        // For Order coordinates
        const userLocationCoords = {
            latitude: order.User.originLat,
            longitude: order.User.originLng,
        };

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
              initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
              }}
              showsUserLocation
              followsUserLocation
            >
                <MapViewDirections
                    origin={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }}
                    destination={getDestination()}
                    apikey={'AIzaU'}
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
