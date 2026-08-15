import { useAuthContext } from "@/providers/AuthProvider";
import { useProfileContext } from "@/providers/ProfileProvider";
import { Courier, Order, Transaction } from "@/src/models";

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
import TodayEarnings from "../TodayEarnings";

import styles from "./styles";

/*
============================================================
DISTANCE
============================================================
*/

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

/*
============================================================
HOME MAIN
============================================================
*/

const HomeComponent = () => {
  /*
  ==========================================================
  AUTH / PROFILE
  ==========================================================
  */

  const { dbCourier } = useAuthContext();

  const { isOnline, setIsOnline } = useProfileContext();

  /*
  ==========================================================
  ORDER STATE
  ==========================================================
  */

  const [location, setLocation] = useState(null);

  const [orders, setOrders] = useState([]);

  const [statsOrders, setStatsOrders] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    nearby: 0,
    batch: 0,
    express: 0,
  });

  /*
  ==========================================================
  GENERAL LOADING
  ==========================================================
  */

  const [loading, setLoading] = useState(true);

  /*
  ==========================================================
  TODAY'S EARNINGS
  ==========================================================
  */

  const [todayEarnings, setTodayEarnings] = useState(0);

  const [todayDeliveryCount, setTodayDeliveryCount] = useState(0);

  const [earningsLoading, setEarningsLoading] = useState(true);

  /*
  ==========================================================
  REFS
  ==========================================================
  */

  const soundRef = useRef(null);

  const prevOrderIdsRef = useRef(new Set());

  const bottomSheetRef = useRef(null);

  /*
  ==========================================================
  BOTTOM SHEET
  ==========================================================
  */

  const snapPoints = useMemo(() => ["27%", "65%", "85%"], []);

  /*
  ==========================================================
  GET TODAY'S DATE RANGE
  ==========================================================
  */

  const getTodayRange = () => {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    return {
      startOfToday,
      startOfTomorrow,
    };
  };

  /*
  ==========================================================
  FETCH TODAY'S EARNINGS
  ==========================================================
  
  We do NOT store today's earnings on Courier.

  The amount is calculated from the courier's Wallet
  transactions.

  Only:
    - CREDIT
    - COMPLETED
    - today's createdAt

  are counted.

  We also use transaction.orderID to count the number
  of unique deliveries that generated today's earnings.
  ==========================================================
  */

  const fetchTodayEarnings = async () => {
    if (!dbCourier?.walletID) {
      setTodayEarnings(0);
      setTodayDeliveryCount(0);
      setEarningsLoading(false);

      return;
    }

    setEarningsLoading(true);

    try {
      const { startOfToday, startOfTomorrow } = getTodayRange();

      /*
        ======================================================
        GET COURIER WALLET TRANSACTIONS
        ======================================================
        */

      const transactions = await DataStore.query(Transaction, (transaction) =>
        transaction.walletID.eq(dbCourier.walletID),
      );

      /*
        ======================================================
        FILTER TODAY'S COMPLETED CREDITS
        ======================================================
        */

      const todayTransactions = transactions.filter((transaction) => {
        if (!transaction) {
          return false;
        }

        if (transaction.type !== "CREDIT") {
          return false;
        }

        if (transaction.status !== "COMPLETED") {
          return false;
        }

        if (!transaction.createdAt) {
          return false;
        }

        const createdAt = new Date(transaction.createdAt);

        return createdAt >= startOfToday && createdAt < startOfTomorrow;
      });

      /*
        ======================================================
        CALCULATE TODAY'S EARNINGS
        ======================================================
        */

      const earnings = todayTransactions.reduce((total, transaction) => {
        return total + Number(transaction.amount || 0);
      }, 0);

      /*
        ======================================================
        COUNT TODAY'S DELIVERIES
        ======================================================

        We count unique order IDs instead of simply counting
        transactions.

        This prevents multiple transactions belonging to the
        same order from being counted as multiple deliveries.
        ======================================================
        */

      const orderIds = new Set();

      todayTransactions.forEach((transaction) => {
        if (transaction.orderID) {
          orderIds.add(transaction.orderID);
        }
      });

      setTodayEarnings(earnings);

      setTodayDeliveryCount(orderIds.size);
    } catch (error) {
      console.log("Today's earnings error:", error);

      setTodayEarnings(0);
      setTodayDeliveryCount(0);
    } finally {
      setEarningsLoading(false);
    }
  };

  /*
  ==========================================================
  LOAD TODAY'S EARNINGS
  ==========================================================
  */

  useEffect(() => {
    fetchTodayEarnings();
  }, [dbCourier?.id, dbCourier?.walletID]);

  /*
  ==========================================================
  GO ONLINE / OFFLINE
  ==========================================================
  */

  const onGoPress = async () => {
    if (!location || !dbCourier?.id) {
      return;
    }

    /*
      ======================================================
      BLOCK UNAPPROVED COURIERS
      ======================================================
      */

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

  /*
  ==========================================================
  SELECT ORDER
  ==========================================================
  */

  const onSelectOrder = (order) => {
    router.push(`/home/${order.id}`);
  };

  /*
  ==========================================================
  REMOVE ORDER
  ==========================================================
  */

  const onRemoveOrder = (id) => {
    const filteredOrders = orders.filter((order) => order.id !== id);

    setOrders(filteredOrders);
  };

  /*
  ==========================================================
  FETCH AVAILABLE ORDERS
  ==========================================================
  */

  const fetchOrders = async () => {
    if (!location || !dbCourier) {
      setLoading(false);

      return;
    }

    setLoading(true);

    try {
      const isMaxi = dbCourier.transportationType === "MAXI";

      let processedOrders = [];

      let availableOrders = [];

      /*
        ======================================================
        MAXI VEHICLE VALIDATION
        ======================================================
        */

      if (isMaxi && !dbCourier?.vehicleClass) {
        Alert.alert(
          "Vehicle Not Set",
          "Please complete your vehicle details to start receiving orders.",
        );

        return;
      }

      /*
        ======================================================
        MAXI
        ======================================================
        */

      if (isMaxi && dbCourier?.vehicleClass) {
        availableOrders = await DataStore.query(Order, (o) =>
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
        /*
          ====================================================
          MICRO / MOTO
          ====================================================
          */

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

      /*
        ======================================================
        DISTANCE GROUPING
        ======================================================
        */

      const nearbyOrders = [];

      const farOrders = [];

      availableOrders.forEach((order) => {
        const distance = getDistance(
          location.latitude,
          location.longitude,
          order.originLat,
          order.originLng,
        );

        /*
            Maxi = 80km
            Micro / Moto = 10km
            */

        const radius = isMaxi ? 80 : 10;

        if (distance <= radius) {
          nearbyOrders.push(order);
        } else {
          farOrders.push(order);
        }
      });

      /*
        ======================================================
        SORT NEARBY ORDERS
        ======================================================
        */

      nearbyOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      /*
        ======================================================
        SORT FAR ORDERS
        ======================================================
        */

      farOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      /*
        ======================================================
        COMBINE ORDERS
        ======================================================
        */

      processedOrders = [...nearbyOrders, ...farOrders];

      setOrders(processedOrders);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  /*
  ==========================================================
  PLAY NEW ORDER SOUND
  ==========================================================
  */

  const playNewOrderSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();

        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  /*
  ==========================================================
  LOAD NEW ORDER SOUND
  ==========================================================
  */

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

  /*
  ==========================================================
  DETECT NEW ORDERS
  ==========================================================
  */

  useEffect(() => {
    const newIds = new Set(orders.map((order) => order.id));

    let hasNew = false;

    for (const id of newIds) {
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

  /*
  ==========================================================
  STATS CALCULATION
  ==========================================================
  */

  useEffect(() => {
    if (!location) {
      return;
    }

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

  /*
  ==========================================================
  AUDIO MODE
  ==========================================================
  */

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
  }, []);

  /*
  ==========================================================
  FORCE UNAPPROVED COURIER OFFLINE
  ==========================================================
  */

  useEffect(() => {
    const forceOfflineIfNotApproved = async () => {
      if (!dbCourier?.id) {
        return;
      }

      if (dbCourier?.isApproved === false && dbCourier?.isOnline) {
        try {
          const freshUser = await DataStore.query(Courier, dbCourier.id);

          await DataStore.save(
            Courier.copyOf(freshUser, (updated) => {
              updated.isOnline = false;

              updated.statusKey = "OFFLINE#NOT_APPROVED";
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

  /*
  ==========================================================
  INITIAL ORDERS / STATS
  ==========================================================
  */

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

  /*
  ==========================================================
  REAL-TIME ORDER SUBSCRIPTION
  ==========================================================
  */

  useEffect(() => {
    if (!isOnline || !location || !dbCourier || !dbCourier.isApproved) {
      return;
    }

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

        if (!isRelevant) {
          return;
        }

        /*
          ==================================================
          UPDATE STATS
          ==================================================
          */

        setStatsOrders((prev) => {
          let updated = [...prev];

          if (opType === "INSERT") {
            if (!updated.find((order) => order.id === element.id)) {
              updated.push(element);
            }
          }

          if (opType === "UPDATE") {
            updated = updated.map((order) =>
              order.id === element.id ? element : order,
            );
          }

          if (opType === "DELETE") {
            updated = updated.filter((order) => order.id !== element.id);
          }

          updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          return updated;
        });

        /*
          ==================================================
          UPDATE VISIBLE ORDERS
          ==================================================
          */

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
            if (distance > radius) {
              return prev;
            }

            if (!updated.find((order) => order.id === element.id)) {
              updated.unshift(element);
            }
          }

          if (opType === "UPDATE") {
            updated = updated.map((order) =>
              order.id === element.id ? element : order,
            );
          }

          if (opType === "DELETE") {
            updated = updated.filter((order) => order.id !== element.id);
          }

          updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          return updated;
        });
      },
    );

    return () => subscription.unsubscribe();
  }, [isOnline, location, dbCourier]);

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading && isOnline) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (
    <SafeAreaView style={styles.container}>
      {/* ==================================================
          MAP
      ================================================== */}

      <HomeMap orders={orders} location={location} setLocation={setLocation} />

      {/* ==================================================
          TODAY'S EARNINGS
      ================================================== */}

      <TodayEarnings
        earnings={todayEarnings}
        deliveryCount={todayDeliveryCount}
        loading={earningsLoading}
      />

      {/* ==================================================
          BOTTOM SHEET
      ================================================== */}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        topInset={1}
        handleIndicatorStyle={{
          backgroundColor: "#666768",
          width: 80,
        }}
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

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {isOnline && orders.length === 0 && (
            <Text style={styles.emptyStateText}>
              No jobs nearby right now. Stay online
            </Text>
          )}

          {/* ==================================================
              AVAILABLE ORDERS
          ================================================== */}

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
