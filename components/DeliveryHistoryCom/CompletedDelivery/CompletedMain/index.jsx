import { View, Text, Alert, FlatList, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react';
import styles from './styles';
import { DataStore } from 'aws-amplify/datastore';
import {  Order,} from '@/src/models';
import { useAuthContext } from '@/providers/AuthProvider';
import CompletedSingle from '../CompletedSingle';

const CompletedDeliveryMain = () => {

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

      const filteredOrders = fetchedOrders.filter((order)=> order.status === 'DELIVERED').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // const sortedOrders = fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(filteredOrders)
    }catch(e){
      Alert.alert('Error', e.message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchOrders();

    const subscription = DataStore.observe(Order).subscribe(({opType})=>{
      if(opType === 'INSERT' || opType === 'UPDATE' || opType === 'DELETE'){
        fetchOrders();
      }
    });

    return () => subscription.unsubscribe();
  },[])

  if(loading){
    return <ActivityIndicator size={'large'} style={styles.loading}/>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Delivery</Text>
      {orders.length === 0 ? (
        <View style={styles.noCompletedOrdersCon}>
          <Text style={styles.noCompletedOrders}>
            No Completed Orders
          </Text>
        </View>
      ) :(
        <FlatList
          data={orders}
          showsVerticalScrollIndicator={false}
          keyExtractor = {(item, index)=>item.id.toString()}
          renderItem={({item})=><CompletedSingle item={item}/>}
        />
      )}
    </View>
  )
}

export default CompletedDeliveryMain;