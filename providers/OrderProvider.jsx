import { View, Text, Alert } from 'react-native'
import React, {useRef, useState, useEffect, useContext, createContext,} from 'react';
import { DataStore } from 'aws-amplify/datastore';
import { Courier, Order, User } from '@/src/models';
import { useAuthContext } from './AuthProvider';

const OrderContext = createContext({})

const OrderProvider = ({children}) => {

  const {dbUser} = useAuthContext();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPickedUp, setIsPickedUp]= useState(false)
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [totalMins, setTotalMins]=useState(0);
  const [totalKm, setTotalKm]=useState(0);
  const [isCourierclose, setIsCourierClose]= useState(false);
  const [activeOrders, setActiveOrders] = useState([]);

    // Fetch Order and User
    const fetchOrder = async (id) =>{
      setLoading(true);
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

    // useEffect to observe updates
    useEffect(()=>{
      if(!order){
        return;
      }

      const subscription = DataStore.observe(Order, order.id).subscribe(({opType, element})=>{
        if(opType === 'UPDATE'){
          fetchOrder(element.id);
        }
      });

      return () => subscription.unsubscribe();
    },[order?.id])

    // Function to accept order
    // const acceptOrder = async () => {
    //   try {
    //     const updatedOrder = await DataStore.save(
    //       Order.copyOf(order, (updated) => {
    //         updated.status = 'ACCEPTED';
    //         updated.Courier = dbUser; 
    //       })
    //     );
    //     setOrder(updatedOrder);
    //   } catch (error) {
    //     console.error('Error accepting order:', error.message);
    //   }  
    // };

    // New accept order
    const acceptOrder = async (order) => {
      const { transportationType } = order;
  
      const isExpress = ['Moto X', 'Micro X', 'Maxi'].includes(transportationType);

      const isBatch = ['Micro Batch', 'Moto Batch'].includes(transportationType);

      const pickedUpExpressOrders = activeOrders.filter((o) =>
        ['Moto X', 'Micro X', 'Maxi'].includes(o.transportationType)
      );
  
      const pickedUpBatchOrdersCount = activeOrders.filter((o) =>
        ['Micro Batch', 'Moto Batch'].includes(o.transportationType)
      ).length;

      // Business Rules
      if (isExpress && (pickedUpExpressOrders.length > 0 || pickedUpBatchOrdersCount > 0)) {
        Alert.alert('Error', 'You cannot accept any other deliveries while handling X/Maxi delivery or batch deliveries.');
        return false;
      }
  
      if (isBatch && (pickedUpExpressOrders.length > 0 || pickedUpBatchOrdersCount >= 7)) {
        Alert.alert('Error', 'You cannot accept beyond 7 batch deliveries or X deliveries.');
        return false;
      }
  
      try {
        // Update the order in the database
        const updatedOrder = await DataStore.save(
          Order.copyOf(order, (updated) => {
            updated.status = 'ACCEPTED';
            updated.Courier = dbUser; // Assign to the current courier
          })
        );
    
        // Update the local state
        const newPickedUpOrders = [...activeOrders, updatedOrder];
        setActiveOrders(newPickedUpOrders);
        setOrder(updatedOrder);
      return true;
      } catch (error) {
        console.error('Error accepting order:', error.message);
        return false;
      }
    };

    // Pick up order function
    const pickUpOrder = async () => {
      try {
        const updatedOrder = await DataStore.save(
          Order.copyOf(order, (updated) => {
            updated.status = 'PICKEDUP';
          })
        );
        const newPickedUpOrders = [...activeOrders, updatedOrder];
        setActiveOrders(newPickedUpOrders);
        setOrder(updatedOrder);
      } catch (error) {
        console.error('Error picking up order:', error.message);
      }
    };

    const completeOrder = async (orderId) => {
      try {

        // Fetch the latest order instance from DataStore
        const orderToComplete = await DataStore.query(Order, orderId);

        if (!orderToComplete) {
            console.error("Order not found in DataStore:", orderId);
            return false;
        }
    
        // Update the order's status in the database
        const updatedOrder = await DataStore.save(
          Order.copyOf(orderToComplete, (updated) => {
            updated.status = "DELIVERED"; // Update the status to "DELIVERED"
          })
        );
    
        // Update the activeOrders state by removing the completed order
        console.log("Before completing the order:", activeOrders);
        setActiveOrders((prevOrders) =>
          prevOrders.filter((o) => o.id !== orderId)
        );
        console.log("After completing the order:", activeOrders);
    
        console.log("Order completed:", updatedOrder);
        return true;
      } catch (error) {
        console.error("Error completing order:", error);
        return false;
      }    
    };

  return (
    <OrderContext.Provider value={{acceptOrder, pickUpOrder, completeOrder, order, user, loading,  fetchOrder, isPickedUp, setIsPickedUp, mapRef, location, setLocation, totalMins, setTotalMins, totalKm, setTotalKm, isCourierclose, setIsCourierClose }}>
      {children}
    </OrderContext.Provider>
  )
}

export default OrderProvider;

export const useOrderContext = () => useContext(OrderContext);