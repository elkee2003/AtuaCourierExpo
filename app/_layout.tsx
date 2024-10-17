navigator.geolocation = require('@react-native-community/geolocation');
import { Stack } from "expo-router";
import ProfileProvider from '@/providers/ProfileProvider';
import AuthProvider from '@/providers/AuthProvider'

const RootLayout = () => {

  return (
    <AuthProvider>
      <ProfileProvider>
        <Stack screenOptions={{
          headerShown:false
        }}>
            <Stack.Screen name="(tabs)" />
        </Stack>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default RootLayout;