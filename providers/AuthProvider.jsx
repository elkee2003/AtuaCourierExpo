import { View, Text } from 'react-native'
import React, {useState, useEffect, useContext, createContext} from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
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
    const [userMail, setUserMail] = useState(null);

    // ✅ Function to handle full logout and cleanup
    const handleUserDeleted = async () => {
      console.log('User deleted from Cognito — clearing session...');
      try {
        await signOut({ global: true }); // clears all sessions
        await DataStore.clear(); // clears cached data
        await DataStore.start(); 
      } catch (err) {
        console.log('Error clearing session:', err);
      } finally {
        setAuthUser(null);
        setDbUser(null);
        setSub(null);
        router.push('/login'); // navigate back to login
      }
    };

    // Functions for useEffect
    const currentAuthenticatedUser = async () =>{
        try {
          const user = await getCurrentUser();
          setAuthUser(user)
          // const subId = authUser?.userId;
          // setSub(subId);
          setSub(user.userId);
          const email = authUser?.signInDetails?.loginId;
          setUserMail(email);
        } catch (err) {
          console.log('Auth check failed:', err.name);

          // Handle deleted / invalid / expired user session
          if (
            err.name === 'UserNotFoundException' ||
            err.name === 'NotAuthorizedException' ||
            err.name === 'InvalidSignatureException'
          ) {
            await handleUserDeleted();
          }
        }
    };

    const dbCurrentUser = async () =>{
        try{
          const dbusercurrent = await DataStore.query(Courier, (courier)=>courier.sub.eq(sub))
        //   DataStore.delete(Courier, Predicates.ALL)
          // DataStore.clear()
          
          // If statement to check dbuser in the database
          if (dbusercurrent.length > 0) {
            setDbUser(dbusercurrent[0]);
          } else {
            // DO NOTHING — wait for sync
            console.log('Waiting for DataStore sync...');
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
        async ({ element, opType }) => {
          if (opType === 'DELETE' && element.id === dbUser.id) {
            await DataStore.clear();
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
