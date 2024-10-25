import { View, Text, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import React, {useState, useEffect} from 'react';
import { useLocalSearchParams } from 'expo-router';
import OrderDeliveryMainCom from '../../components/OrderDeliveryComp/OrderDeliveryMainCom';
import {useOrderContext} from '@/providers/OrderProvider';

const OrderDeliveryScreen = () => {

    const {id} = useLocalSearchParams()
    const { order, user, loading, fetchOrder } = useOrderContext();


    useEffect(()=>{
      fetchOrder(id);
    },[id])

    if (loading) {
      return (
        <SafeAreaView>
          <ActivityIndicator size="large" color='#3cff00'/>
        </SafeAreaView>
      );
    }

    if(!order || !user){
      return(
        <View style={{top:'50%', justifyContent:'center', alignItems:'center'}}>
          {/* <Text style={{fontSize:30, fontWeight:'bold', color:'#afadad'}}>
            No Order Found
          </Text> */}
          <ActivityIndicator size="large" color='#3cff00'/>
        </View>
      )
    }
    
  return (
    <View style={{flex:1}}>
      <OrderDeliveryMainCom order={order} user={user}/>
    </View>
  )
}

export default OrderDeliveryScreen;