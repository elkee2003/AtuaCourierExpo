import { View, Text } from 'react-native'
import React, {useState, useEffect, useContext, createContext} from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { router } from 'expo-router';
import { DataStore, Predicates } from 'aws-amplify/datastore'
import { Courier } from '@/src/models'

const AuthContext = createContext({})

const AuthProvider = ({children}) => {

    // Amplify states
    const [authUser, setAuthUser] = useState(null);
    const [dbUser, setDbUser] = useState(null);
    const [sub, setSub] = useState(null);

    // Functions for useEffect
    const currentAuthenticatedUser = async () =>{
        try {
          const user = await getCurrentUser();
          setAuthUser(user)
          const subId = authUser?.userId;
          setSub(subId);
        } catch (err) {
          console.log(err);
        }
    }

    const dbCurrentUser = async () =>{
        try{
          const dbusercurrent = await DataStore.query(Courier, (courier)=>courier.sub.eq(sub))
        //   DataStore.delete(Courier, Predicates.ALL)
          // DataStore.clear()
          
          // If statement to check dbuser in the database
          if (dbusercurrent.length === 0) {
            // If no user data is found in the cloud, clear the local DataStore
            await DataStore.clear();
            setDbUser(null); // Set to null so the UI reflects it as blank
          } else {
            setDbUser(dbusercurrent[0]);
          }
          
          // I commented this out because it is the same with the else if you look above. It was part of the old code before the if statement, therefore if I remove the if statement, I should uncomment setDbUser(dbusercurrent[0])
          // setDbUser(dbusercurrent[0])
        }catch(error){
          console.error('Error getting dbuser: ', error)
        }
    }

    useEffect(()=>{
        currentAuthenticatedUser()
    },[sub]);

    // useEffect for autosign-in and auto sign-out
    useEffect(()=>{

      const listener = (data) => {
        const { event } = data.payload;
        if (event === 'signedIn') {
          currentAuthenticatedUser();
        } else if (event === 'signedOut') {
          setAuthUser(null); // Clear the authUser state
          setSub(null); // Clear the sub state
          router.push('/login'); // Navigate to the sign-in page
        }
      };
  
      // Start listening for authentication events
      const hubListener = Hub.listen('auth', listener);
  
      // Cleanup the listener when the component unmounts
      return () => hubListener(); // Stop listening for the events
    },[]);

    useEffect(()=>{
        if(!sub){
          return;
        }

        dbCurrentUser()
    }, [sub]);

    // Set up a subscription to listen to changes on the current user's Courier instance
    useEffect(() => {
      if (!dbUser) return;
  
      const subscription = DataStore.observe(Courier, dbUser.id).subscribe(
        ({ element, opType }) => {
          if (opType === 'UPDATE') {
            setDbUser(element);
          }
        }
      );
  
      return () => subscription.unsubscribe();
    }, [dbUser]);

    useEffect(() => {
      if (!dbUser) return;
    
      // Observe for deletion of the Realtor record
      const deleteSubscription = DataStore.observe(Courier).subscribe(
        ({ element, opType }) => {
          if (opType === 'DELETE' && element.id === dbUser.id) {
            setDbUser(null); // Clear dbUser when the record is deleted
          }
        }
      );
    
      return () => deleteSubscription.unsubscribe();
    }, [dbUser]);

  return (
    <AuthContext.Provider value={{
        authUser, dbUser, setDbUser, sub
    }}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
export const useAuthContext = () => useContext(AuthContext);
