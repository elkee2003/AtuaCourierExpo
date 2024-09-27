import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'
import { useProfileContext } from '../../../providers/ProfileProvider'

const TransportationTypeCom = () => {

  const {transportationType, setTransportationType} = useProfileContext()

  return (
    <View style={styles.container}>
      <Text>TransportationTypeCom</Text>
    </View>
  )
}

export default TransportationTypeCom