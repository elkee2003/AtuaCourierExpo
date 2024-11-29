import { View, Text, Pressable} from 'react-native'
import React, { useRef, useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView,} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import OrderDeliveryMap from '../OrderDeliveryMap';
import BottomSheetHeader from '../BottomSheetOrderHeader';
import OrderDetails from  '../OrderDetails';
import styles from './styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import {useOrderContext} from '@/providers/OrderProvider';

// Variable to show button name in OrderDetails Screen
const STATUS_TO_TITLE = {
  READY_FOR_PICKUP: 'Accept Order',
  ACCEPTED: 'Picked Up Order',
  PICKEDUP: 'Delivered!'
}

const OrderdeliveryMainCom = ({order, user}) => {
  
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(()=>['15%', '75%', '95%'], [])

  const {mapRef, location,isCourierclose, isPickedUp, setIsPickedUp, acceptOrder, pickUpOrder, completeOrder} = useOrderContext();

  // Function of the Button on OrderDetails Screen when pressed
  const onButtonPressed = async ()=>{

    if (!order) {
      console.warn("Order not available");
      return;
    }

    if(order?.status === 'READY_FOR_PICKUP'){
      const accepted = await acceptOrder(order);

      if (!accepted) return; // If order was not accepted due to restrictions, exit function

      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      
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
      await pickUpOrder();
      setIsPickedUp(true);
    }

    if(order?.status === 'PICKEDUP' && isPickedUp){
      bottomSheetRef.current?.collapse()
      mapRef.current.animateToRegion({
        latitude: location?.latitude,
        longitude:location?.longitude,
        latitudeDelta:0.01,
        longitudeDelta:0.01
      })
      await completeOrder(order.id);
      router.push('/home');
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
        order={order}
        user={user}
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

          <BottomSheetHeader/>

          <OrderDetails
          order={order}
          user={user}
          deliveryPickedUp={deliveryPickedUp}
          isButtonDisabled={isButtonDisabled}
          statusTitle = {STATUS_TO_TITLE}
          // renderButtonTitle={renderButtonTitle}
          onButtonPressed={onButtonPressed}
          />

        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  )
}

export default OrderdeliveryMainCom;