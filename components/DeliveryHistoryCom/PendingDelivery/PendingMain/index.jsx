import { View, Text, Alert, FlatList, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react';
import styles from './styles';
import { DataStore } from 'aws-amplify/datastore';
import {  Order,} from '@/src/models';
import { useAuthContext } from '@/providers/AuthProvider';
import PendingSingle from '../PendingSingle';

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

      const filteredOrders = fetchedOrders.filter((order)=> order.status === 'ACCEPTED' || order.status === 'PICKEDUP').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      <Text style={styles.title}>Pending Delivery</Text>
      {orders.length === 0 ? (
        <View style={styles.noPendingOrdersCon}>
          <Text style={styles.noPendingOrders}>
            No Pending Orders
          </Text>
        </View>
      ) :(
        <FlatList
          data={orders}
          showsVerticalScrollIndicator={false}
          keyExtractor = {(item, index)=>item.id.toString()}
          renderItem={({item})=><PendingSingle item={item}/>}
        />
      )}
    </View>
  )
}

export default PendingDeliveryMain;