import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import * as Clipboard from 'expo-clipboard';
import styles from './styles'
import { router } from 'expo-router';

const PendingDeliverySingle = ({item}) => {

  const courierPrice = Number(item.courierFee).toLocaleString();

  const handleCopyRecipientNumber = async () => {
    if (item.recipientNumber) {
      await Clipboard.setStringAsync(item.recipientNumber);
      Alert.alert('Phone Number Copied', 'You can paste it into the dialer to make a call.');
    }
  };

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
      <TouchableOpacity onPress={handleCopyRecipientNumber}>
        <Text style={styles.details}>{item.recipientNumber}</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Order Details:</Text>
      <Text style={styles.details}>{item.orderDetails}</Text>

      <Text style={styles.subHeader}>Price:</Text>
      <Text style={styles.details}>₦{courierPrice}</Text>
    </TouchableOpacity>
  )
}

export default PendingDeliverySingle;