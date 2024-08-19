import { View, Text, Pressable, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { router } from 'expo-router'


const OrderItem = ({order, onAccept, onRemoveOrder}) => {

    // const goToOrderDelivery = ()=>{
    //     navigation.navigate("OrderDeliveryMap", {id: order.id})
    // }

    const goToTestOrder= () =>{
        router.push(`/orders/${order.User.id}`)
    }


  return (

        <View>
            <Pressable style={styles.orderContainer} onPress={goToTestOrder}>
            <View style={styles.detailsContainer}>
                <Text style={styles.header}>
                    Delivery Details:
                </Text>
                <ScrollView  style={styles.details}>
                    <Text style={styles.subHeader}>Name:{" "}</Text>   
                    <Text style={styles.txt}>
                        {
                            order.User.name.length > 10 ?
                            `${order.User.name.substring(0,16)}...`
                            :
                            order.User.name
                        }
                    </Text> 
                </ScrollView>
                <ScrollView style={styles.details}>
                    <Text style={styles.subHeader}>Address:{" "}</Text>
                    <Text style={styles.txt}>
                        {
                            order.User.address.length > 10 ?
                            `${order.User.address.substring(0,16)}...`
                            :
                            order.User.address
                        }
                    </Text> 
                </ScrollView>
            </View>

            <View style={styles.thumbs}>
                <Pressable
                //   onPress={goToOrderDelivery} 
                style={styles.thumbsUp}>
                    <FontAwesome 
                    name={'thumbs-up'} 
                    size={30} color={'white'}/>    
                </Pressable>
                <Pressable  onPress={()=> onRemoveOrder(order.User.id)} style={styles.thumbsDown}>
                    <FontAwesome 
                    name={'thumbs-down'} 
                    size={30} color={'white'}/>    
                </Pressable>
            </View>
            </Pressable>
            
        </View>
  )
}

export default OrderItem;