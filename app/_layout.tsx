// import { useEffect, useState } from 'react';
// import { DataStore } from 'aws-amplify/datastore';
import { Stack } from "expo-router";
import ProfileProvider from '@/providers/ProfileProvider';
import AuthProvider from '@/providers/AuthProvider';
import OrderProvider from '@/providers/OrderProvider';
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import {
  withAuthenticator,
  useAuthenticator
} from '@aws-amplify/ui-react-native';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';

Amplify.configure(amplifyconfig);

const RootLayout = () => {
  
  // const [ready, setReady] = useState(false);

  // useEffect(() => {
  //   const resetDataStore = async () => {
  //     try {
  //       console.log('🧹 Clearing DataStore (one-time reset)');
  //       await DataStore.clear();
  //     } catch (err) {
  //       console.log('DataStore clear error:', err);
  //     } finally {
  //       setReady(true);
  //     }
  //   };

  //   resetDataStore();
  // }, []);

  // if (!ready) return null;

  return (
    <AuthProvider>
      <AutocompleteDropdownContextProvider>
      <ProfileProvider>
        <OrderProvider>
          <Stack screenOptions={{
            headerShown:false
          }}>
              <Stack.Screen name="(tabs)" />
          </Stack>
        </OrderProvider>
      </ProfileProvider>
      </AutocompleteDropdownContextProvider>
    </AuthProvider>
  );
}

export default RootLayout;