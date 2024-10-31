import { View, Text } from 'react-native'
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
  const [isCourierclose, setIsCourierClose]= useState(false)

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
    const acceptOrder = async () => {
      // update the order, and change status, and assign the courier
      const updatedOrder = await DataStore.save(
        Order.copyOf(order, (updated)=>{
          updated.status = "ACCEPTED",
          updated.Courier = dbUser
        })
      );
      setOrder(updatedOrder);
    };

    const pickUpOrder = async () => {
      const updatedOrder = await DataStore.save(
        Order.copyOf(order, (updated)=>{
          updated.status = "PICKEDUP"
        })
      );
      setOrder(updatedOrder);
    };

    const completeOrder = async () => {
        const updatedOrder = await DataStore.save(
        Order.copyOf(order, (updated)=>{
          updated.status = "DELIVERED"
        })
      );
      setOrder(updatedOrder);
    }

  return (
    <OrderContext.Provider value={{acceptOrder, pickUpOrder, completeOrder, order, user, loading,  fetchOrder, isPickedUp, setIsPickedUp, mapRef, location, setLocation, totalMins, setTotalMins, totalKm, setTotalKm, isCourierclose, setIsCourierClose }}>
      {children}
    </OrderContext.Provider>
  )
}

export default OrderProvider;

export const useOrderContext = () => useContext(OrderContext);