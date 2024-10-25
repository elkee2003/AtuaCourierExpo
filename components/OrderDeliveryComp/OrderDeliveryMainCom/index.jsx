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
import {useOrderContext} from '@/providers/OrderProvider'

const OrderdeliveryMainCom = ({order, user}) => {
  
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(()=>['15%', '75%', '95%'], [])

  const {acceptOrder, isPickedUp, setIsPickedUp, pickUpOrder, completeOrder} = useOrderContext()

  const [location, setLocation] = useState(null);
  const [totalMins, setTotalMins]=useState(0);
  const [totalKm, setTotalKm]=useState(0);
  const [isCourierclose, setIsCourierClose]= useState(false)


  // Function of the Button on OrderDetails Screen when pressed
  const onButtonPressed = async ()=>{

    if(order?.status === 'READY_FOR_PICKUP'){
      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      // setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
      acceptOrder();
    }

    if(order?.status === 'ACCEPTED'){
      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      // setDeliveryStatus(ORDER_STATUSES.PICKEDUP)
      pickUpOrder();
      setIsPickedUp(true)
    }

    if(order?.status === 'PICKEDUP' && isPickedUp){
      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      // setDeliveryStatus(ORDER_STATUSES.DELIVERED)
      await completeOrder ();
      router.push('/home')
    }
  }

  // Function for Rendering button name in OrderDetails Screen
  const renderButtonTitle = ()=>{

    if (order?.status === 'READY_FOR_PICKUP'){
      return 'Accept Order'
    }

    if (order?.status === 'ACCEPTED'){
      return 'Picked Up Order'
    }
      
    if (order?.status === 'PICKEDUP'){
      return 'Delivered!'
    }
  }

  // Function for Disabling the Button in OrderDetails Screen
  const isButtonDisabled =()=>{

    if (order?.status === 'READY_FOR_PICKUP'){
      return false;
    }

    if (order?.status === 'ACCEPTED' && isCourierclose){
      return false;
    }

    if (order?.status === 'PICKEDUP' && isCourierclose){
      return false;
    }
    return true;
  }

  // variable to show in Order Details Screen
  const deliveryPickedUp = order?.status === 'PICKEDUP';

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
        order?.status === 'READY_FOR_PICKUP' &&
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