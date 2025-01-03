import { Tabs } from 'expo-router';
import { Entypo, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import NotificationProvider from '@/providers/NotificationProvider';
// import ProfileProvider from '@/providers/ProfileProvider';
// import AuthProvider from '@/providers/AuthProvider'
import {
  withAuthenticator,
  useAuthenticator
} from '@aws-amplify/ui-react-native';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../src/amplifyconfiguration.json'

Amplify.configure(amplifyconfig);

const TabsLayout = () => {
  return (
    // <AuthProvider>
      <NotificationProvider>
        {/* <ProfileProvider> */}
          <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
              name="home"
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />
              }}
            />
            <Tabs.Screen
              name="deliveryhistory"
              options={{
                tabBarLabel: 'Delivery History',
                tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-list" size={24} color={color} />
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                tabBarLabel: 'Profile',
                tabBarIcon: ({ color }) => <Ionicons name="person-sharp" size={24} color={color} />
              }}
            />
          </Tabs>
        {/* </ProfileProvider> */}
      </NotificationProvider>
    // </AuthProvider>
  );
};

// export default withAuthenticator(TabsLayout);
export default TabsLayout;