import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import * as Clipboard from 'expo-clipboard';
import styles from './styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useOrderContext} from '@/providers/OrderProvider';

const OrderDetails = ({
  onButtonPressed, 
  isButtonDisabled,
  statusTitle,
  // renderButtonTitle,
  deliveryPickedUp,
  order,
  user,
}) => {

  const { activeOrders } = useOrderContext();

  const handleCopyRecipientNumber = async () => {
    if (order.recipientNumber) {
      await Clipboard.setStringAsync(order.recipientNumber);
      Alert.alert('Phone Number Copied', 'You can paste it into the dialer to make a call.');
    }
  };

  const handleCopyUserNumber = async () => {
    if (user.phoneNumber) {
      await Clipboard.setStringAsync(user.phoneNumber);
      Alert.alert('Phone Number Copied', 'You can paste it into the dialer to make a call.');
    }
  };

  return (
    <View style={styles.container}>

        {/* If delivery is picked up */}
        {deliveryPickedUp && (
          <>
            <View style={ styles.receipientCard}>
              <Text style={styles.recipientHeader}>Recipient Details:</Text>

              {/* Recipients name */}
              <View style={styles.details}>
                <View style={styles.rIcon}>
                  <FontAwesome name={'user'} size={30} color={'#021d46'}/>
                </View>
                <Text style={styles.tDetails}>
                  {order.recipientName}
                </Text>
              </View>

              {/* Recipient details */}
              <View style={styles.details}>
                <View style={styles.rIcon}>
                  <Ionicons name={'call'} size={40} color={'#021d46'}/>
                </View>
                <TouchableOpacity onPress={handleCopyRecipientNumber}>
                  <Text style={styles.tDetails}>
                    {order.recipientNumber}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Parcel destination */}
              <View style={styles.details}>
                <View style={styles.rIcon}>
                  <Entypo name={'location'} size={40} color={'#021d46'}/>
                </View>
                <Text style={styles.tDetails}>
                  {order.parcelDestination}
                </Text>
              </View>

              {/* Order details */}
              <View style={styles.details}>
                <View style={styles.rIcon}>
                  <MaterialIcons name={'details'} size={40} color={'#021d46'}/>
                </View>            
                  <Text style={styles.tDetails}>
                    {order.orderDetails}
                  </Text>
              </View>
            </View>

             {/* Divider */}
            <View style={styles.divider}/>
          </>
        )}

        {/* Normal sender's details */}
        <View style={styles.receipientCard}>

          {/* User Name */}
          <View style={styles.details}>
            <View style={styles.icon}>
              <FontAwesome name={'user'} size={30} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {user?.firstName}
            </Text>
          </View>

          {/* Phone Number */}
          <View style={styles.details}>
            <View style={styles.icon}>
              <Ionicons name={'call'} size={30} color={'#021d46'}/>
            </View>
            <TouchableOpacity onPress={handleCopyUserNumber}>
              <Text style={styles.tDetails}>
                {user.phoneNumber}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transportation Type */}
          <View style={styles.details}>
            <Text style={styles.tDetails}>
              {order.transportationType}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.details}>
            <View style={styles.icon}>
              <Entypo name={'location'} size={30} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {order.parcelOrigin}
            </Text>
          </View>
        </View>

        
        {/* Buttons */}
        <TouchableOpacity 
        onPress={onButtonPressed} 
        disabled={isButtonDisabled()}
        style={{...styles.acceptBtn, backgroundColor: isButtonDisabled() ? '#bbbbbb' : '#6bff08'}}>
          <Text style={{...styles.tBtn, color: isButtonDisabled() ? '#727272' : '#222222'}}>{statusTitle[order.status]}</Text>
        </TouchableOpacity>
    </View>
  )
}

export default OrderDetails;