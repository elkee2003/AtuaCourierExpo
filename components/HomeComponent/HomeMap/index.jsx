import { View,  useWindowDimensions, ActivityIndicator, Alert } from 'react-native'
import React, {useState, useEffect} from 'react'
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import * as Location from 'expo-location';
import Feather from '@expo/vector-icons/Feather';
import styles from './styles';
import {useAuthContext} from '@/providers/AuthProvider';
import { DataStore } from 'aws-amplify/datastore';
import {Order, Courier} from '@/src/models';


const Map = ({location, setLocation}) => {

  const {width, height} = useWindowDimensions();
  
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [orders, setOrders] = useState([]);
  const {dbUser} = useAuthContext();


  const fetchOrders = async () =>{
    try{
      const availableOrders = await DataStore.query(Order)
      setOrders(availableOrders);
    }catch(e){
      Alert.alert('Error', e.message)
    }
  }

  useEffect(()=>{
    fetchOrders();
  },[])

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Failed to fetch location');
      }
    })();
  }, []);

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
      >
        {orders.map((order)=>{
          return <Marker 
                  key={order.id}
                  coordinate={{latitude: order.parcelOriginLat, longitude:order.parcelOriginLng}}>
                    <Feather name="box" size={30} color="black" />
                </Marker>
        })}
      </MapView>
    </View>
  )
}

export default Map;
