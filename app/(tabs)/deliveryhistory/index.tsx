import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'
import { useAuthContext } from '@/providers/AuthProvider'
import PendingMain from '../../../components/DeliveryHistoryCom/PendingDelivery/PendingMain';

const PendingOrdersScreen = () => {

  const {dbUser} = useAuthContext()

  useEffect(()=>{
    if(!dbUser){
      router.replace('/profile')
    }
  }, [dbUser])

  if(!dbUser){
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Text style={{fontSize:20, fontWeight:'bold', color:'#afadad'}}>Kindly Fill in Your Data in Proile screen</Text>
      </View>
    )
  }

  return (
    <View style={{flex:1}}>
      <PendingMain/>
    </View>
  )
}

export default PendingOrdersScreen;