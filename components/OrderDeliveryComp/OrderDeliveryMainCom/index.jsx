import { View, Text, Pressable} from 'react-native'
import React, { useState, useRef, useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView,} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import OrderDeliveryMap from '../OrderDeliveryMap'
import OrderDetails from  '../OrderDetails'
import styles from './styles'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';


const ORDER_STATUSES ={
  READY_FOR_PICKUP:'Ready For Pickup',
  ACCEPTED:'Accepted',
  PICKEDUP: 'Picked Up',
  DELIVERED:'Delivered'
}

const OrderdeliveryMainCom = ({order, user}) => {
  
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(()=>['15%', '75%', '95%'], [])

  const [location, setLocation] = useState(null);
  const [totalMins, setTotalMins]=useState(0);
  const [totalKm, setTotalKm]=useState(0);
  const [deliveryStatus, setDeliveryStatus]= useState(ORDER_STATUSES.READY_FOR_PICKUP)
  const [isCourierclose, setIsCourierClose]= useState(false)
  const [isPickedUp, setIsPickedUp]= useState(false)

  const onRemoveOrder = (id)=>{
    const filteredOrder = avaliableOrders.filter((order)=> order.id !== id)
    setAvaliableOrders(filteredOrder)
  }

  // Function of the Button on OrderDetails Screen when pressed
  const onButtonPressed = ()=>{

    // if (!location || !location.latitude || !location.longitude) {
    //   console.error("Location or coordinates not available");
    //   return;
    // }
    
    console.log("There is location", location.latitude, location.longitude);

    console.log('This is the almighty location:', location)
  
    if(deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP){
      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      setDeliveryStatus(ORDER_STATUSES.ACCEPTED)
    }

    if(deliveryStatus === ORDER_STATUSES.ACCEPTED){
      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      setDeliveryStatus(ORDER_STATUSES.PICKEDUP)
      setIsPickedUp(true)
    }
    if(deliveryStatus === ORDER_STATUSES.PICKEDUP && isPickedUp){
      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      setDeliveryStatus(ORDER_STATUSES.DELIVERED)
      router.push('/home')
    }
  }

  // Function for Rendering button name in OrderDetails Screen
  const renderButtonTitle = ()=>{
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP){
      return 'Accept Order'
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED){
      return 'Picked Up Order'
    }
    if (deliveryStatus === ORDER_STATUSES.PICKEDUP){
      return 'Delivered!'
    }
  }

  // Function for Disabling the Button in OrderDetails Screen
  const isButtonDisabled =()=>{
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP){
      return false;
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED && isCourierclose){
      return false;
    }
    if (deliveryStatus === ORDER_STATUSES.PICKEDUP && isCourierclose){
      return false;
    }
    return true;
  }

  // Function to show in Order Details Screen
  // const deliveryAccepted = deliveryStatus === ORDER_STATUSES.ACCEPTED
  const deliveryPickedUp = deliveryStatus === ORDER_STATUSES.PICKEDUP

  return (
    <GestureHandlerRootView style={styles.container}>

      <OrderDeliveryMap 
      mapRef={mapRef}
      setTotalKm={setTotalKm} 
      setTotalMins={setTotalMins} 
      order={order}
      user={user}
      location={location}
      setLocation={setLocation}
      setIsCourierClose={setIsCourierClose}
      isPickedUp={isPickedUp}
      
      />

      {/* Back Button */}
      {
        deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP &&
        <Pressable onPress={()=>router.back()} style={styles.bckBtn}>
          <Ionicons name="arrow-back" style={styles.bckBtnIcon} />
        </Pressable>
      }

      <BottomSheet 
      ref={bottomSheetRef}
      snapPoints={snapPoints} 
      index={0} 
      topInset={0} // Ensure no inset from the top
      handleIndicatorStyle={{backgroundColor:'#666768', width:80}}>
        <BottomSheetScrollView>

          <View style={{alignItems:'center'}}>
            <View style={styles.pickUpInfo}>
              <Text style={styles.bottomText}>{totalMins.toFixed(0)} {""}min</Text>
              <View style={styles.userBackground}>
                <FontAwesome name={'user'} color={'white'} size={20}/>
              </View>
              <Text style={styles.bottomText}>{totalKm.toFixed(1)} km</Text>
            </View>
            <Text style={styles.bottomTextStat}>{ isPickedUp ? 'Dropping Parcel' : 'Picking Up Parcel of'} {user?.firstName.length > 10 ? `${user?.firstName.substring(0, 10)}...` : user?.firstName}</Text>
          </View>

          <OrderDetails
          order={order}
          user={user}
          deliveryPickedUp={deliveryPickedUp}
          isButtonDisabled={isButtonDisabled}
          renderButtonTitle={renderButtonTitle}
          onButtonPressed={onButtonPressed}
          />

        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  )
}

export default OrderdeliveryMainCom;