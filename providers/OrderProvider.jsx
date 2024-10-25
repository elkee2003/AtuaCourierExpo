import { View, Text } from 'react-native'
import React, {useState, useEffect, useContext, createContext} from 'react'
import { DataStore } from 'aws-amplify/datastore';
import { Order, User } from '@/src/models';

const OrderContext = createContext({})

const OrderProvider = ({children}) => {

    const [location, setLocation] = useState(null);
    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async (id) => {
      try {
        setLoading(true);
        if (id) {
          const foundOrder = await DataStore.query(Order, id);
          if (foundOrder) {
            setOrder(foundOrder);
            const foundUser = await DataStore.query(User, foundOrder.userID);
            setUser(foundUser);
          }
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
      } finally {
        setLoading(false);
      }
    };
    

  return (
    <OrderContext.Provider value={{location, setLocation, order, user, fetchOrder, loading}}>
      {children}
    </OrderContext.Provider>
  )
}

export default OrderProvider;

export const useOrderContext = useContext(OrderContext);