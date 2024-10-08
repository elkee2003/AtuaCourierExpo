import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './styles'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const OrderDetails = ({
  onButtonPressed, 
  isButtonDisabled,
  renderButtonTitle,
  deliveryPickedUp,
  order,
}) => {

  return (
    <View style={styles.container}>
        <View style={styles.senderDetails}>
          <View style={styles.details}>
            <View style={styles.icon}>
              <FontAwesome name={'user'} size={30} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {order.User.name}
            </Text>
          </View>
          <View style={styles.details}>
            <View style={styles.icon}>
              <Ionicons name={'call'} size={30} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {order.User.phoneNumber}
            </Text>
          </View>
          <View style={styles.details}>
            <View style={styles.icon}>
              <Entypo name={'location'} size={30} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {order.User.address}
            </Text>
          </View>
        </View>

        {deliveryPickedUp && <View style={styles.recipientDetails}>
          <Text style={styles.recipientHeader}>Recipient Details:</Text>
          <View style={styles.details}>
            <View style={styles.rIcon}>
              <FontAwesome name={'user'} size={30} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {order.Order.recipientName}
            </Text>
          </View>
          <View style={styles.details}>
            <View style={styles.rIcon}>
              <Ionicons name={'call'} size={40} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {order.Order.recipientNumber}
            </Text>
            
          </View>
          <View style={styles.details}>
            <View style={styles.rIcon}>
              <Entypo name={'location'} size={40} color={'#021d46'}/>
            </View>
            <Text style={styles.tDetails}>
              {order.Order.recipientAddress}
            </Text>
          </View>
          <View style={styles.details}>
            <View style={styles.rIcon}>
              <MaterialIcons name={'details'} size={40} color={'#021d46'}/>
            </View>            
              <Text style={styles.tDetails}>
                {order.Order.detailsOfOrder}
              </Text>
          </View>
        </View>}
      
      <TouchableOpacity 
      onPress={onButtonPressed} 
      disabled={isButtonDisabled()}
      style={{...styles.acceptBtn, backgroundColor: isButtonDisabled() ? 'grey' : '#6bff08'}}>
        <Text style={styles.tBtn}>{renderButtonTitle()}</Text>
       </TouchableOpacity>
    </View>
  )
}

export default OrderDetails;