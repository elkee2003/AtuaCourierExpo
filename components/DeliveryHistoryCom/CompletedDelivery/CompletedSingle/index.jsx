import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles';

const CompletedDeliverySingle = ({item}) => {
  const courierPrice = Number(item.courierFee).toLocaleString();

  return (
    <View style={styles.card}>
        <Text style={styles.subHeader}>Order Origin:</Text>
        <Text style={styles.details}>{item.parcelOrigin}</Text>

        <Text style={styles.subHeader}>Order Destination:</Text>
        <Text style={styles.details}>{item.parcelDestination}</Text>

        <Text style={styles.subHeader}>Order Type:</Text>
        <Text style={styles.details}>{item.transportationType}</Text>

        <Text style={styles.subHeader}>Price:</Text>
        <Text style={styles.details}>₦{courierPrice}</Text>
    </View>
  )
}

export default CompletedDeliverySingle;