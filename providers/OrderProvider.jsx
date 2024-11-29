import { View, Text } from 'react-native'
import React, {useRef, useState, useEffect, useContext, createContext,} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

    // Save active orders to AsyncStorage
    const saveActiveOrders = async (orders) => {
      try {
        await AsyncStorage.setItem('activeOrders', JSON.stringify(orders));
      } catch (error) {
        console.error('Error saving active orders:', error);
      }
    };

    // Fetch active orders from backend
    const fetchActiveOrders = async () => {
      try {
        const activeOrdersFromBackend = await DataStore.query(Order, (o) =>
          o.and((c) => [
            c.status.ne('DELIVERED'), // Status should not be "DELIVERED"
            c.courierID.eq(dbUser?.id), // Must belong to the current courier
          ])
        );
        setActiveOrders(activeOrdersFromBackend);
        saveActiveOrders(activeOrdersFromBackend);
      } catch (error) {
        console.error('Error fetching active orders from backend:', error);
      }
    };

    // Load active orders from AsyncStorage
    const loadActiveOrders = async () => {
      try {
        const storedOrders = await AsyncStorage.getItem('activeOrders');
        if (storedOrders) {
          setActiveOrders(JSON.parse(storedOrders));
        } else {
          // If no data in AsyncStorage, fetch from backend
          await fetchActiveOrders();
        }
      } catch (error) {
        console.error('Error loading active orders:', error);
      }
    };

    // Call `loadActiveOrders` when provider is initialized
    useEffect(() => {
      if (dbUser) {
        loadActiveOrders();
      }
    }, [dbUser]);


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
  
       // Only consider active orders (not delivered)
      const activeExpressOrders = activeOrders.filter((o) =>
        ['Moto X', 'Micro X', 'Maxi'].includes(o.transportationType) &&
        o.status !== 'DELIVERED' // Exclude delivered orders
      );
  
      // Check batch order count
      const activeBatchOrdersCount = activeOrders.filter((o) =>
        ['Micro Batch', 'Moto Batch'].includes(o.transportationType) &&
        o.status !== 'DELIVERED' // Exclude delivered orders
      ).length;
  
      // Business Rules
      if (isExpress && (activeExpressOrders.length > 0 || activeBatchOrdersCount > 0)) {
        alert('You cannot accept any other deliveries while handling X/Maxi orders or batch deliveries.');
        return false;
      }
  
      if (isBatch && (activeExpressOrders.length > 0 || activeBatchOrdersCount >= 7)) {
        alert('You cannot accept beyond 7 batch orders or X deliveries.');
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
        setActiveOrders((prevOrders) => [...prevOrders, updatedOrder]);
        setOrder(updatedOrder); // Update the current order context
        return true;
      } catch (error) {
        console.error('Error accepting order:', error.message);
        return false;
      }
    };

    const pickUpOrder = async () => {
      try {
        const updatedOrder = await DataStore.save(
          Order.copyOf(order, (updated) => {
            updated.status = 'PICKEDUP';
          })
        );
        setOrder(updatedOrder);
      } catch (error) {
        console.error('Error picking up order:', error.message);
      }
    };

    const completeOrder = async (orderId) => {
      try {
        // Find the order to update
        const orderToComplete = activeOrders.find((o) => o.id === orderId);
    
        if (!orderToComplete) {
          console.error('Order not found');
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