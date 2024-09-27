import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'

const OrderHistoryCom = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <Text>Order: Adama</Text>
      <Text>Amount: ₦1500</Text>
    </View>
  )
}

export default OrderHistoryCom;