import { View, Text, Pressable, Alert, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useRef, useMemo} from 'react'
import BottomSheet, { BottomSheetView, BottomSheetFlatList} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import styles from './styles';
import HomeMap from '../HomeMap'
import BottomContainer from '../BottomContainer'
import OrderItem from '../OrderItem';
import { useAuthContext } from '@/providers/AuthProvider';
import { useProfileContext } from '@/providers/ProfileProvider';
import {DataStore} from 'aws-amplify/datastore';
import { Order, Courier } from '@/src/models';

const HomeComponent = () => {

  const {dbUser} = useAuthContext();
  const {isOnline, setIsOnline} = useProfileContext();
  // useState Hooks
  const [location, setLocation] = useState(null);
  const [orders, setOrders]= useState ([])
  const [loading, setLoading] = useState(true);

  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(()=>['15%', '85%', '100%'], [])

  // Refferenced functions
  const onGoPress = async () => {
    if (!location) {
      setIsOnline(false);
      return;
    }
  
    try {
      // Toggle the isOnline state in local state
      const newStatus = !isOnline;
      setIsOnline(newStatus);
  
      // Update the isOnline field in DataStore
      await DataStore.save(
        Courier.copyOf(dbUser, updated => {
          updated.isOnline = newStatus;
        })
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  // Remove Order
  const onRemoveOrder = (id)=>{
    const filteredOrder = orders.filter((order)=> order.id !== id)
    setOrders(filteredOrder)
  }

  const fetchOrders = async () =>{
    setLoading(true)
    try{
      const availableOrders = await DataStore.query(Order, (o)=> o.status.eq("READY_FOR_PICKUP"))
      const sortedAvailableOrders = availableOrders.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedAvailableOrders);
    }catch(e){
      Alert.alert('Error', e.message)
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchOrders();

    const subscription = DataStore.observe(Order).subscribe(({opType})=>{
      if(opType === "UPDATE"){
        fetchOrders();
      }
    });

    return () => subscription.unsubscribe();
  },[])

  if(loading){
    return <ActivityIndicator size={'large'} style={styles.loading}/>
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      
      {/* later check if availableorder prop is necessary */}
      <HomeMap orders={orders} location={location} setLocation={setLocation}/>

      {/* Money Balance */}
      {/* Will show when I find out how to display the price of courier */}
      
      {/* <View style={styles.balance}>
        <Text style={styles.balanceText}>
          <Text style={{color:'green'}}>₦</Text>
          {" "}
          0.00
        </Text>
      </View> */}


      {/* Go/End button */}
      {isOnline ?
        <Pressable onPress={onGoPress} style={styles.endButton}>
          <Text style={styles.endButtonText}>
            END
          </Text>
        </Pressable>
        :
        <Pressable onPress={onGoPress} style={styles.goButton}>
          <Text style={styles.goButtonText}>
            GO
          </Text>
        </Pressable>
      }
      <BottomSheet ref={bottomSheetRef}
      snapPoints={snapPoints} 
      index={0} 
      topInset={0} // Ensure no inset from the top
      handleIndicatorStyle={{backgroundColor:'#666768', width:80}}>
        <BottomContainer isOnline={isOnline} orders={orders}/>

        {/* Different Orders */}
        {isOnline && 
        <BottomSheetFlatList
        data={orders}
        renderItem={({item})=><OrderItem 
            order={item} 
            // onAccept={onAccept}
            onRemoveOrder={onRemoveOrder}
        />}
        />
        }
      </BottomSheet>  
    </GestureHandlerRootView>
  )
}

export default HomeComponent;