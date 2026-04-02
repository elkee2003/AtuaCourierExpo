import { useAuthContext } from "@/providers/AuthProvider";
import { useProfileContext } from "@/providers/ProfileProvider";
import { Courier, Order } from "@/src/models";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { DataStore } from "aws-amplify/datastore";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomContainer from "../BottomContainer";
import HomeMap from "../HomeMap";
import OrderItem from "../OrderItem";
import styles from "./styles";

// To get distance:
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const HomeComponent = () => {
  const { dbUser } = useAuthContext();
  const { isOnline, setIsOnline } = useProfileContext();
  // useState Hooks
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "85%", "100%"], []);

  // Refferenced functions
  const onGoPress = async () => {
    if (!location) {
      setIsOnline(false);
      return;
    }

    try {
      // Toggle the isOnline state in local state
      const newStatus = !isOnline;
      setIsOnline(newStatus);

      // Update the isOnline field in DataStore
      await DataStore.save(
        Courier.copyOf(dbUser, (updated) => {
          updated.isOnline = newStatus;
        }),
      );
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  // Accept Order:
  const onAccept = async (order) => {
    try {
      await DataStore.save(
        Order.copyOf(order, (updated) => {
          updated.status = "ACCEPTED";
        }),
      );

      // navigate immediately
      router.push(`/orders/${order.id}`);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  // Remove Order
  const onRemoveOrder = (id) => {
    const filteredOrder = orders.filter((order) => order.id !== id);
    setOrders(filteredOrder);
  };

  const fetchOrders = async () => {
    if (!location || !dbUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const isMaxi = dbUser.transportationType === "MAXI";

      const availableOrders = await DataStore.query(Order, (o) =>
        o.and((o2) => [
          o2.status.eq("READY_FOR_PICKUP"),

          isMaxi
            ? o2.transportationType.eq("MAXI")
            : o2.or((o3) => [
                o3.transportationType.eq("MICRO_EXPRESS"),
                o3.transportationType.eq("MOTO_EXPRESS"),
                o3.transportationType.eq("MICRO_BATCH"),
                o3.transportationType.eq("MOTO_BATCH"),
              ]),
        ]),
      );

      // 👇 we will filter by distance next
      const nearbyOrders = availableOrders.filter((order) => {
        const distance = getDistance(
          location.latitude,
          location.longitude,
          order.originLat,
          order.originLng,
        );

        return distance <= 10;
      });

      setOrders(nearbyOrders);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const playNewOrderSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/new-order.mp3"),
      );
      await sound.playAsync();
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  useEffect(() => {
    if (!isOnline || !location || !dbUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    fetchOrders();

    const subscription = DataStore.observe(Order).subscribe(({ opType }) => {
      if (opType === "INSERT") {
        playNewOrderSound();
        fetchOrders();
      }

      if (opType === "UPDATE") {
        fetchOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, [isOnline]);

  if (loading && isOnline) {
    return <ActivityIndicator size={"large"} style={styles.loading} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* later check if availableorder prop is necessary */}
      <HomeMap
        orders={orders}
        location={location}
        setLocation={setLocation}
        selectedOrder={selectedOrder}
      />

      {/* Money Balance */}
      {/* Will show when I find out how to display the price of courier */}

      {/* <View style={styles.balance}>
        <Text style={styles.balanceText}>
          <Text style={{color:'green'}}>₦</Text>
          {" "}
          0.00
        </Text>
      </View> */}

      {/* Go/End Floating button */}
      {/* {isOnline ? (
        <Pressable onPress={onGoPress} style={styles.endButton}>
          <Text style={styles.endButtonText}>END</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onGoPress} style={styles.goButton}>
          <Text style={styles.goButtonText}>GO</Text>
        </Pressable>
      )} */}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        topInset={1} // Ensure no inset from the top
        handleIndicatorStyle={{ backgroundColor: "#666768", width: 80 }}
      >
        <BottomSheetScrollView>
          <BottomContainer
            isOnline={isOnline}
            orders={orders}
            onRefresh={fetchOrders}
            onToggleOnline={onGoPress}
          />

          {/* ✅ EMPTY STATE */}
          {isOnline && orders.length === 0 && (
            <Text style={styles.emptyStateText}>
              No jobs nearby right now. Stay online
            </Text>
          )}

          {isOnline &&
            orders.map((item) => (
              <OrderItem
                key={item.id}
                order={item}
                onAccept={onAccept}
                onRemoveOrder={onRemoveOrder}
                onSelect={setSelectedOrder}
              />
            ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default HomeComponent;
