import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import {orders} from '../../assets/data/orders'
import OrderDeliveryMapCom from '../../components/OrderDeliveryMapCom'

const OrderDeliveryMap = () => {

    const {id} = useLocalSearchParams()
    const order = orders.find(item => item.id === id)

  return (
    <View style={{flex:1}}>
      <OrderDeliveryMapCom order={order}/>
    </View>
  )
}

export default OrderDeliveryMap