import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'
import { useAuthContext } from '@/providers/AuthProvider'
import { useProfileContext } from '@/providers/ProfileProvider'

const OrderHistoryCom = () => {

  const {sub, dbUser, trial} = useAuthContext()
  console.log('sub from ordrer:',sub)
  const {firstName} = useProfileContext()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <Text>Order: Adama</Text>
      <Text>Amount: ₦1500</Text>
      <Text>{dbUser.firstName}</Text>
      <Text>This is state:{firstName}</Text>
      <Text>{sub}</Text>
    </View>
  )
}

export default OrderHistoryCom;