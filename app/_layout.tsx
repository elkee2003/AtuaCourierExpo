import { Stack } from "expo-router";
import ProfileProvider from '@/providers/ProfileProvider';
import AuthProvider from '@/providers/AuthProvider';
import OrderProvider from '@/providers/OrderProvider';
const RootLayout = () => {

  return (
    <AuthProvider>
      <ProfileProvider>
        <OrderProvider>
          <Stack screenOptions={{
            headerShown:false
          }}>
              <Stack.Screen name="(tabs)" />
          </Stack>
        </OrderProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default RootLayout;