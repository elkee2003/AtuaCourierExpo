import { View, Text, Alert, FlatList } from 'react-native'
import React, {useState, useEffect} from 'react';
import styles from './styles';
import { DataStore } from 'aws-amplify/datastore';
import {  Order,} from '@/src/models';
import { useAuthContext } from '@/providers/AuthProvider';
// import { useProfileContext } from '@/providers/ProfileProvider';

const PendingDeliveryMain = () => {

  const {dbUser} = useAuthContext()
  // console.log('sub from ordrer:',sub)
  // const {firstName} = useProfileContext()

  const [orders, setOrders] = useState(null);
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () =>{
    setLoading(true);
    try{
      const fetchedOrders = await DataStore.query(Order,(o)=> o.orderCourierId.eq(dbUser.id));
      const sortedOrders = fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders)
      console.log('This is:',fetchedOrders)
    }catch(e){
      Alert.alert('Error', e.message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchOrders();
  },[])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Delivery</Text>
      <Text>hel</Text>
      <Text>Amount: ₦1500 (pending)</Text>
    </View>
  )
}

export default PendingDeliveryMain;