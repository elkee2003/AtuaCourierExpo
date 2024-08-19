import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const OrdersLayout = () => {
  return (
    <Stack screenOptions={{
        headerShown:false,
    }}>
      <Stack.Screen name='[id]' options={{
        presentation: 'modal',
        headerShown:false,
        title:'Contact Details'
      }}/>
    </Stack>
  )
}

export default OrdersLayout