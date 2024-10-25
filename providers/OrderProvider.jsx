import { View, Text } from 'react-native'
import React, {useState, useEffect, useContext, createContext} from 'react';
import { DataStore } from 'aws-amplify/datastore';
import { Courier, Order, User } from '@/src/models';
import { useAuthContext } from './AuthProvider';

const OrderContext = createContext({})

const OrderProvider = ({children}) => {

  const {dbUser} = useAuthContext();
  const [order, setOrder] = useState()
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPickedUp, setIsPickedUp]= useState(false)
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

    // Function to accept order
    const acceptOrder = () => {
      // update the order, and change status, and assign the courier
      DataStore.save(
        Order.copyOf(order, (updated)=>{
          updated.status = "ACCEPTED",
          updated.Courier = dbUser
        })
      ).then(setOrder);
    };

    const pickUpOrder = () => {
      // update the order, and change status, and assign the courier
      DataStore.save(
        Order.copyOf(order, (updated)=>{
          updated.status = "PICKEDUP"
        })
      ).then(setOrder);
    };

    const completeOrder = () => {
      // update the order, and change status, and assign the courier
      DataStore.save(
        Order.copyOf(order, (updated)=>{
          updated.status = "DELIVERED"
        })
      ).then(setOrder);
    }

  return (
    <OrderContext.Provider value={{acceptOrder, pickUpOrder, completeOrder, order, user, loading,  fetchOrder, isPickedUp, setIsPickedUp, }}>
      {children}
    </OrderContext.Provider>
  )
}

export default OrderProvider;

export const useOrderContext = () => useContext(OrderContext);