import AuthProvider, { useAuthContext } from "@/providers/AuthProvider";
import OrderProvider from "@/providers/OrderProvider";
import ProfileProvider from "@/providers/ProfileProvider";
import { resumeCourierPendingUploads } from "@/utils/resumeCourierPendingUploads";
import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import amplifyconfig from "../src/amplifyconfiguration.json";

Amplify.configure(amplifyconfig);

/**
 * ✅ INNER COMPONENT (has access to AuthContext)
 */
const AppInitializer = () => {
  const { dbCourier } = useAuthContext();

  useEffect(() => {
    if (!dbCourier?.id) return;

    resumeCourierPendingUploads(dbCourier.id);
  }, [dbCourier?.id]);

  return null;
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AutocompleteDropdownContextProvider>
          <ProfileProvider>
            <OrderProvider>
              {/* ✅ THIS IS WHERE IT SHOULD BE */}
              <AppInitializer />

              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(tabs)" />
              </Stack>
            </OrderProvider>
          </ProfileProvider>
        </AutocompleteDropdownContextProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
