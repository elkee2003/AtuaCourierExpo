import { View, Text } from 'react-native'
import React from 'react'
import {orders} from '../../../assets/data/orders'

const Profile = () => {

  const order = orders[0]
  
  return (
    <View>
      <Text>{order.User.name}</Text>
    </View>
  )
}

export default Profile