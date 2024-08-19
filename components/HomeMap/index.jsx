import { View, Text, useWindowDimensions, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react'
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Entypo from '@expo/vector-icons/Entypo';
import styles from './styles'
import { orders } from '@/assets/data/orders';

const Map = () => {

  const {width, height} = useWindowDimensions()
  const [avaliableOrders, setAvaliableOrders]= useState (orders)
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if (!location){
    return <ActivityIndicator size={"large"}/>
  }

  return (
    <View style={styles.container}>
      <MapView
      style={{width, height:height-80}}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation
      followsUserLocation
      >
        {/* {
          avaliableOrders.map(order=>{
            return(
              <MapViewDirections
                key={order.id}
                origin={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                destination={{
                  latitude: order.User.originLat,
                  longitude: order.User.originLng
                }}
                apikey={'AIzaSyCpZgg6kdYXn8GD71Cfr3Hq3_F1IXH08dU'}
                timePrecision='now'
                strokeWidth={3}
                strokeColor= 'red'
              />
            )
          })
        } */}

        {
          avaliableOrders.map(order=>{
            return(
              <Marker 
              key={order.id}
              title={order.User.name} 
              description={order.User.address}
              coordinate={{
                latitude:order.User.originLat,
                longitude:order.User.originLng,
              }}>
                <View style={{backgroundColor:'#04b831', padding:5, borderRadius:20}}>
                  <Entypo name={'location-pin'} color={'white'} size={24}/>
                </View>
              </Marker>
            )
          })
        }
      </MapView>
    </View>
  )
}

export default Map