navigator.geolocation = require('@react-native-community/geolocation');
import { Stack } from "expo-router";
import ProfileProvider from '../providers/ProfileProvider'

const RootLayout = () => {

  return (
    <ProfileProvider>
      <Stack screenOptions={{
        headerShown:false
      }}>
          <Stack.Screen name="(tabs)" />
      </Stack>
    </ProfileProvider>
  );
}

export default RootLayout;