import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './styles'
import {orders} from '../../assets/data/orders'



const BottomContainer = ({isOnline,}) => {

    const renderBottomStatus = () =>{
        if(isOnline){
            return(
                <TouchableOpacity>
                <Text style={styles.bottomText}>You're online</Text>
                <Text style={styles.pendingOrderText}>
                    {orders.length}{" "}Pending Orders
                </Text>
                </TouchableOpacity>
            )
        }else{
            return <Text style={styles.bottomTextOffline}>You're offline</Text>
        }
    }
    
  return (
    <View>
      <View style={isOnline ? {...styles.bottomContainer, backgroundColor:'#10c05f'} :styles.bottomContainer}>
        
        {renderBottomStatus()}
      
      </View>
    </View>
  )
}

export default BottomContainer