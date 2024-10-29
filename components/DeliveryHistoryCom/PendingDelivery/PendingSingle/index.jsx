import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import styles from './styles'
import { router } from 'expo-router';

const PendingDeliverySingle = ({item}) => {

  const deductedFixedFee = item.price - 300;
  const formattedCourierPrice= (deductedFixedFee * 0.85).toFixed(2);
  const courierPrice = Number(formattedCourierPrice).toLocaleString();

  const goToOrderDelivery= () =>{
    router.push(`/orders/${item.id}`)
  }
 
  return (
    <TouchableOpacity style={styles.card} onPress={goToOrderDelivery}>
      <Text style={styles.subHeader}>Order Origin:</Text>
      <Text style={styles.details}>
        {
          item?.parcelOrigin?.length > 10 ?
          `${item?.parcelOrigin?.substring(0,60)}...`
          :
          item?.parcelOrigin
        }
      </Text>

      <Text style={styles.subHeader}>Order Destination:</Text>
      <Text style={styles.details}>
        {
          item?.parcelDestination?.length > 10 ?
          `${item?.parcelDestination?.substring(0,60)}...`
          :
          item?.parcelDestination
        }
      </Text>

      <Text style={styles.subHeader}>Order Type:</Text>
      <Text style={styles.details}>{item.transportationType}</Text>

      <Text style={styles.subHeader}>Recipient Number:</Text>
      <Text style={styles.details}>{item.recipientNumber}</Text>

      <Text style={styles.subHeader}>Order Details:</Text>
      <Text style={styles.details}>{item.orderDetails}</Text>

      <Text style={styles.subHeader}>Price:</Text>
      <Text style={styles.details}>₦{courierPrice}</Text>
    </TouchableOpacity>
  )
}

export default PendingDeliverySingle;