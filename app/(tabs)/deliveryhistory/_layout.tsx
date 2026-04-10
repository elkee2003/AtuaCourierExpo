import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import type {
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import React from "react";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTobTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const OrdersLayout = () => {
  return (
    <MaterialTobTabs
      screenOptions={{
        tabBarLabelStyle: { fontWeight: "bold", textTransform: "capitalize" },
        tabBarStyle: {
          // marginTop: 40,
          paddingTop: 20,
        },
        // tabBarIndicatorStyle: {
        //   height: 3,      // Indicator height, adjust if necessary
        //   borderRadius: 1.5,
        // },
      }}
    >
      <MaterialTobTabs.Screen name="index" options={{ title: "pending" }} />

      <MaterialTobTabs.Screen
        name="completedorders"
        options={{ title: "completed" }}
      />
    </MaterialTobTabs>
  );
};

export default OrdersLayout;
