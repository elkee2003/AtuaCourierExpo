import { View, Text } from 'react-native'
import React from 'react'


const Orders = () => {
  return (
    <View style={{flex:1}}>
      <Text style={{fontSize:50, textAlign:'center'}}>
        Order History
      </Text>
      <Text style={{fontSize:20,}}>Name of Placer: Adama</Text>
      <Text>Number: 2840223522232</Text>
    </View>
  )
}

export default Orders