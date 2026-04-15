import { useAuthContext } from "@/providers/AuthProvider";
import { useProfileContext } from "@/providers/ProfileProvider";
import { Courier, Order } from "@/src/models";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { DataStore } from "aws-amplify/datastore";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
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
  const { dbCourier } = useAuthContext();
  const { isOnline, setIsOnline } = useProfileContext();
  // useState Hooks
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statsOrders, setStatsOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    nearby: 0,
    batch: 0,
    express: 0,
  });
  const [loading, setLoading] = useState(true);

  const soundRef = useRef(null);
  const prevOrderIdsRef = useRef(new Set());

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["27%", "65%", "85%"], []);

  // Refferenced functions
  const onGoPress = async () => {
    if (!location || !dbCourier?.id) return;

    // 🚫 BLOCK if not approved
    if (!dbCourier?.isApproved) {
      Alert.alert(
        "Account Not Approved",
        "Your account is still under review. You cannot go online yet.",
      );
      return;
    }

    try {
      const freshUser = await DataStore.query(Courier, dbCourier.id);

      const newStatus = !freshUser.isOnline;

      await DataStore.save(
        Courier.copyOf(freshUser, (updated) => {
          updated.isOnline = newStatus;

          updated.statusKey = `${newStatus ? "ONLINE" : "OFFLINE"}#${
            freshUser.isApproved ? "APPROVED" : "NOT_APPROVED"
          }`;
        }),
      );

      setIsOnline(newStatus);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  // Accept Order:
  const onSelectOrder = (order) => {
    router.push(`/home/${order.id}`);
  };

  // Remove Order
  const onRemoveOrder = (id) => {
    const filteredOrder = orders.filter((order) => order.id !== id);
    setOrders(filteredOrder);
  };

  const fetchOrders = async () => {
    if (!location || !dbCourier) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const isMaxi = dbCourier.transportationType === "MAXI";

      let processedOrders = [];
      let nearbyCount = 0;

      let availableOrders = [];

      if (isMaxi && !dbCourier?.vehicleClass) {
        Alert.alert(
          "Vehicle Not Set",
          "Please complete your vehicle details to start receiving orders.",
        );
        return;
      }

      if (isMaxi && dbCourier?.vehicleClass) {
        availableOrders = await DataStore.query(Order, (o) =>
          o.and((o2) => [
            o2.transportationType.eq("MAXI"),
            o2.vehicleClass.eq(dbCourier.vehicleClass), // ✅ STRICT MATCH
            o2.or((o3) => [
              o3.status.eq("READY_FOR_PICKUP"),
              o3.status.eq("BIDDING"),
            ]),
          ]),
        );
      } else {
        // NON-MAXI (unchanged)
        availableOrders = await DataStore.query(Order, (o) =>
          o.and((o2) => [
            o2.status.eq("READY_FOR_PICKUP"),
            o2.or((o3) => [
              o3.transportationType.eq("MICRO_EXPRESS"),
              o3.transportationType.eq("MOTO_EXPRESS"),
              o3.transportationType.eq("MICRO_BATCH"),
              o3.transportationType.eq("MOTO_BATCH"),
            ]),
          ]),
        );
      }

      // This else statement below is what will work with my backend lambda function. it is meant to asssign and be visible to one courier, as opposed to before, when it was visible to all couriers. However, I think it will not show the different order counts like available orders, nearby orders, batch orders, express orders, like I would want it to show. Later I will see how I can make it possible, together with the lambda function

      // else {
      //   // ✅ ONLY assigned orders
      //   availableOrders = await DataStore.query(Order, (o) =>
      //     o.assignedCourierId.eq(dbCourier.id)
      //   );
      // }

      const nearbyOrders = [];
      const farOrders = [];

      availableOrders.forEach((order) => {
        const distance = getDistance(
          location.latitude,
          location.longitude,
          order.originLat,
          order.originLng,
        );

        // Maxi radius should be 80km. Micro & Moto should be 10
        const radius = isMaxi ? 80 : 10;

        if (distance <= radius) {
          nearbyOrders.push(order);
          nearbyCount++;
        } else {
          farOrders.push(order);
        }
      });

      // sort
      nearbyOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      farOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      processedOrders = [...nearbyOrders, ...farOrders];

      // ✅ MUST be inside try
      setOrders(processedOrders);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const playNewOrderSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
        // for vibration
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  // useEffect for Alert Sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/new-order.mp3"),
        );
        soundRef.current = sound;
      } catch (e) {
        console.log("Load sound error:", e);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // useEffect for previous Alert Orders
  useEffect(() => {
    const newIds = new Set(orders.map((o) => o.id));

    let hasNew = false;

    for (let id of newIds) {
      if (!prevOrderIdsRef.current.has(id)) {
        hasNew = true;
        break;
      }
    }

    if (hasNew) {
      playNewOrderSound();
    }

    prevOrderIdsRef.current = newIds;
  }, [orders]);

  // STATS CALCULATION USEEFFECT
  useEffect(() => {
    if (!location) return;

    const isMaxi = dbCourier?.transportationType === "MAXI";

    let total = 0;
    let nearby = 0;
    let batch = 0;
    let express = 0;

    statsOrders.forEach((order) => {
      total++;

      const distance = getDistance(
        location.latitude,
        location.longitude,
        order.originLat,
        order.originLng,
      );

      const radius = isMaxi ? 80 : 10;

      if (distance <= radius) {
        nearby++;
      }

      if (!isMaxi) {
        if (
          order.transportationType === "MICRO_BATCH" ||
          order.transportationType === "MOTO_BATCH"
        ) {
          batch++;
        }

        if (
          order.transportationType === "MICRO_EXPRESS" ||
          order.transportationType === "MOTO_EXPRESS"
        ) {
          express++;
        }
      }
    });

    setStats({
      total,
      nearby,
      batch,
      express,
    });
  }, [statsOrders, location, dbCourier?.transportationType]);

  // to play sound even when phone is silent
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
  }, []);

  // useEffect to force unapproved offline
  useEffect(() => {
    const forceOfflineIfNotApproved = async () => {
      if (!dbCourier?.id) return;

      // 🚫 If not approved but currently online → force offline
      if (dbCourier?.isApproved === false && dbCourier?.isOnline) {
        try {
          const freshUser = await DataStore.query(Courier, dbCourier.id);

          await DataStore.save(
            Courier.copyOf(freshUser, (updated) => {
              updated.isOnline = false;

              updated.statusKey = `OFFLINE#NOT_APPROVED`;
            }),
          );

          setIsOnline(false);

          Alert.alert(
            "Account Not Approved",
            "You have been taken offline because your account is not approved.",
          );
        } catch (e) {
          console.log("Force offline error:", e);
        }
      }
    };

    forceOfflineIfNotApproved();
  }, [dbCourier?.isApproved]);

  // useEffect to handle subscription
  useEffect(() => {
    if (!isOnline || !location || !dbCourier || !dbCourier.isApproved) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const loadInitialStats = async () => {
      const isMaxi = dbCourier.transportationType === "MAXI";

      let initialStatsOrders = [];

      if (isMaxi) {
        initialStatsOrders = await DataStore.query(Order, (o) =>
          o.and((o2) => [
            o2.transportationType.eq("MAXI"),
            o2.vehicleClass.eq(dbCourier.vehicleClass),
            o2.or((o3) => [
              o3.status.eq("READY_FOR_PICKUP"),
              o3.status.eq("BIDDING"),
            ]),
          ]),
        );
      } else {
        initialStatsOrders = await DataStore.query(Order, (o) =>
          o.and((o2) => [
            o2.status.eq("READY_FOR_PICKUP"),
            o2.or((o3) => [
              o3.transportationType.eq("MICRO_EXPRESS"),
              o3.transportationType.eq("MOTO_EXPRESS"),
              o3.transportationType.eq("MICRO_BATCH"),
              o3.transportationType.eq("MOTO_BATCH"),
            ]),
          ]),
        );
      }

      setStatsOrders(initialStatsOrders);
    };

    fetchOrders();
    loadInitialStats();
  }, [
    isOnline,
    location,
    dbCourier?.transportationType,
    dbCourier?.isApproved,
  ]);

  // REAL-TIME STATS SUBSCRIPTION
  useEffect(() => {
    if (!isOnline || !location || !dbCourier || !dbCourier.isApproved) return;

    const isMaxi = dbCourier.transportationType === "MAXI";

    const subscription = DataStore.observe(Order).subscribe(
      ({ opType, element }) => {
        const isRelevant = isMaxi
          ? element.transportationType === "MAXI" &&
            element.vehicleClass === dbCourier.vehicleClass &&
            (element.status === "READY_FOR_PICKUP" ||
              element.status === "BIDDING")
          : element.status === "READY_FOR_PICKUP" &&
            [
              "MICRO_EXPRESS",
              "MOTO_EXPRESS",
              "MICRO_BATCH",
              "MOTO_BATCH",
            ].includes(element.transportationType);

        if (!isRelevant) return;

        // ✅ UPDATE STATS (real-time, no refetch)
        setStatsOrders((prev) => {
          let updated = [...prev];

          if (opType === "INSERT") {
            // ❌ Prevent duplicates
            if (!updated.find((o) => o.id === element.id)) {
              updated.push(element);
            }
          }

          if (opType === "UPDATE") {
            updated = updated.map((o) => (o.id === element.id ? element : o));
          }

          if (opType === "DELETE") {
            updated = updated.filter((o) => o.id !== element.id);
          }

          updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          return updated;
        });

        // ✅ UPDATE UI ORDERS (real-time)
        setOrders((prev) => {
          let updated = [...prev];

          const distance = getDistance(
            location.latitude,
            location.longitude,
            element.originLat,
            element.originLng,
          );

          const radius = isMaxi ? 80 : 10;

          if (opType === "INSERT") {
            // ❌ Ignore far orders
            if (distance > radius) return prev;

            // ❌ Prevent duplicates
            if (!updated.find((o) => o.id === element.id)) {
              updated.unshift(element);
            }
          }

          if (opType === "UPDATE") {
            updated = updated.map((o) => (o.id === element.id ? element : o));
          }

          if (opType === "DELETE") {
            updated = updated.filter((o) => o.id !== element.id);
          }

          // ✅ Always keep sorted
          updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          return updated;
        });
      },
    );

    return () => subscription.unsubscribe();
  }, [isOnline, location, dbCourier]);

  if (loading && isOnline) {
    return <ActivityIndicator size={"large"} style={styles.loading} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <HomeMap orders={orders} location={location} setLocation={setLocation} />

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
            isApproved={dbCourier?.isApproved}
            orders={orders}
            stats={stats}
            onRefresh={fetchOrders}
            onToggleOnline={onGoPress}
            transportationType={dbCourier?.transportationType}
          />

          {/* ✅ EMPTY STATE */}
          {isOnline && orders.length === 0 && (
            <Text style={styles.emptyStateText}>
              No jobs nearby right now. Stay online
            </Text>
          )}

          {isOnline &&
            [...orders].map((item) => (
              <OrderItem
                key={item.id}
                order={item}
                onRemoveOrder={onRemoveOrder}
                onSelect={onSelectOrder}
              />
            ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default HomeComponent;
