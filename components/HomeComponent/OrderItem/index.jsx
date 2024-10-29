import { View, Text, Pressable, ScrollView } from 'react-native'
import React, {useState, useEffect} from 'react'
import styles from './styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { router } from 'expo-router'
import {DataStore} from 'aws-amplify/datastore';
import { User} from '@/src/models';


const OrderItem = ({order, onAccept, onRemoveOrder}) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const goToOrderDelivery= () =>{
        router.push(`/orders/${order.id}`)
    }

    // This fetchUser is incase I want to display something relating to a user
    const fetchUser = async ()=>{
        setLoading(true)
        try{
            const singleUser = await DataStore.query(User, order.userID)
            setUser(singleUser)

        }catch(e){
            Alert.alert('Error', e.message)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchUser()
    }, [])

  return (

        <View>
            <Pressable style={styles.orderContainer} onPress={goToOrderDelivery}>
            <View style={styles.detailsContainer}>
                <Text style={styles.header}>
                    Delivery Details:
                </Text>
                <ScrollView  style={styles.details}>
                    <Text style={styles.subHeader}>Transportation Type:{" "}</Text>   
                    <Text style={styles.txt}>
                        {order.transportationType}
                    </Text> 
                </ScrollView>
                <ScrollView style={styles.details}>
                    <Text style={styles.subHeader}>Address:{" "}</Text>
                    <Text style={styles.txt}>
                        {
                            order?.parcelOrigin?.length > 10 ?
                            `${order?.parcelOrigin?.substring(0,16)}...`
                            :
                            order?.parcelOrigin
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
                <Pressable  onPress={()=> onRemoveOrder(order?.id)} style={styles.thumbsDown}>
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