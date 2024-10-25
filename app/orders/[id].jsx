import { View, Text, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import React, {useState, useEffect} from 'react';
import { useLocalSearchParams } from 'expo-router';
import OrderDeliveryMainCom from '../../components/OrderDeliveryComp/OrderDeliveryMainCom';
import {DataStore} from 'aws-amplify/datastore';
import { Order, User } from '@/src/models';

const OrderDeliveryScreen = () => {

    const {id} = useLocalSearchParams()
    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch the Order data based on the id
    const fetchOrder = async () =>{
      try{
        if(id){
          const foundOrder = await DataStore.query(Order, id);
          
          if (foundOrder){
            setOrder(foundOrder);

            // Fetch the User related to the Order
            const foundUser = await DataStore.query(User, foundOrder.userID);
            setUser(foundUser)
          }
        }
      }catch(e){
        console.error('Error fetching Order', e.message);
      }finally{
        setLoading(false);
      }
    };

    useEffect(()=>{
      fetchOrder();
    },[id])

    if (loading) {
      return (
        <SafeAreaView>
          <ActivityIndicator size="large" color='#3cff00'/>
        </SafeAreaView>
      );
    }

    if(!order){
      return(
        <View style={{top:'50%', justifyContent:'center', alignItems:'center'}}>
          {/* <Text style={{fontSize:30, fontWeight:'bold', color:'#afadad'}}>
            No Order Found
          </Text> */}
          <ActivityIndicator size="large" color='#3cff00'/>
        </View>
      )
    }
    
  return (
    <View style={{flex:1}}>
      <OrderDeliveryMainCom order={order} user={user}/>
    </View>
  )
}

export default OrderDeliveryScreen;