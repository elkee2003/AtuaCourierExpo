import { useAuthContext } from "@/providers/AuthProvider";
import { useProfileContext } from "@/providers/ProfileProvider";
import { Courier, Order, Transaction } from "@/src/models";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { DataStore } from "aws-amplify/datastore";

import {
  hasRequiredLocationPermissions,
  requestLocationPermissions,
} from "@/src/location/locationPermissions";

import {
  startCourierLocationTracking,
  stopCourierLocationTracking,
} from "@/src/location/courierLocationService";

import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ActivityIndicator, Alert, Linking, Text } from "react-native";

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

Calculates the distance between two latitude/longitude
coordinates in kilometres.

For Micro/Moto marketplace matching, this distance is:

    COURIER LOCATION
            ↓
    ORDER PICKUP / ORIGIN

NOT the destination.
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
HOME COMPONENT
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
  LOCATION
  ==========================================================
  */

  const [location, setLocation] = useState(null);

  /*
  ==========================================================
  ORDERS
  ==========================================================

  MICRO / MOTO
  ----------------------------------------------------------
  These are now MARKETPLACE orders.

  The courier does NOT need:

      assignedCourierId === dbCourier.id

  and does NOT need:

      assignmentStatus === "OFFERED"

  Instead, Micro/Moto orders are shown when they are:

      READY_FOR_PICKUP
      +
      PAID
      +
      unassigned
      +
      correct transportation type
      +
      within the courier's pickup radius.

  MICRO:
      MICRO_EXPRESS
      MICRO_BATCH
      5km radius

  MOTO:
      MOTO_EXPRESS
      MOTO_BATCH
      10km radius


  MAXI
  ----------------------------------------------------------
  Existing Maxi marketplace logic remains separate and
  continues to use its existing 80km display radius and
  vehicleClass matching.
  ==========================================================
  */

  const [orders, setOrders] = useState([]);

  /*
  ==========================================================
  STATS ORDERS
  ==========================================================

  For Micro/Moto:

      statsOrders = currently available marketplace orders
                    visible to this courier.

  For Maxi:

      statsOrders = existing eligible Maxi marketplace orders.

  ==========================================================
  */

  const [statsOrders, setStatsOrders] = useState([]);

  /*
  ==========================================================
  STATS
  ==========================================================
  */

  const [stats, setStats] = useState({
    total: 0,
    nearby: 0,
    batch: 0,
    express: 0,
  });

  /*
  ==========================================================
  LOADING
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
  COURIER TYPE
  ==========================================================
  */

  /*
  IMPORTANT:

  Courier category comes from the Courier record:

      MICRO
      MOTO
      MAXI

  The Order transportationType is different:

      MICRO_EXPRESS
      MICRO_BATCH
      MOTO_EXPRESS
      MOTO_BATCH
      MAXI

  ==========================================================
  */

  const isMaxi = dbCourier?.transportationType === "MAXI";

  const isMicro = dbCourier?.transportationType === "MICRO";

  const isMoto = dbCourier?.transportationType === "MOTO";

  /*
  ==========================================================
  MICRO / MOTO PICKUP RADII
  ==========================================================

  These are the actual marketplace visibility radii.

  MICRO:
      5km

  MOTO:
      10km

  The distance is measured from the courier's current
  location to the order's origin/pickup location.
  ==========================================================
  */

  const MICRO_RADIUS = 5;

  const MOTO_RADIUS = 10;

  /*
  ==========================================================
  MAXI DISPLAY RADIUS
  ==========================================================

  IMPORTANT:

  This is existing Maxi logic.

  DO NOT use the Micro/Moto radius values for Maxi.

  Maxi continues to use its existing 80km marketplace
  display radius.
  ==========================================================
  */

  const MAXI_RADIUS = 80;

  /*
  ==========================================================
  GET TODAY RANGE
  ==========================================================
  */

  const getTodayRange = useCallback(() => {
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
  }, []);

  /*
  ==========================================================
  TODAY'S EARNINGS
  ==========================================================
  */

  const fetchTodayEarnings = useCallback(async () => {
    if (!dbCourier?.walletID) {
      setTodayEarnings(0);
      setTodayDeliveryCount(0);
      setEarningsLoading(false);
      return;
    }

    setEarningsLoading(true);

    try {
      const { startOfToday, startOfTomorrow } = getTodayRange();

      const transactions = await DataStore.query(Transaction, (transaction) =>
        transaction.walletID.eq(dbCourier.walletID),
      );

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

      const earnings = todayTransactions.reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );

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
  }, [dbCourier?.walletID, getTodayRange]);

  /*
============================================================
LOAD EARNINGS
============================================================
*/

  useEffect(() => {
    fetchTodayEarnings();
  }, [fetchTodayEarnings]);

  /*
============================================================
REAL-TIME TODAY'S EARNINGS
============================================================

Today's Earnings is calculated from Transaction records.

The calculation uses:

    walletID === dbCourier.walletID
    +
    type === CREDIT
    +
    status === COMPLETED
    +
    createdAt is today

This subscription watches Transaction changes in
real time.

Therefore:

    NEW CREDIT TRANSACTION
            ↓
    Transaction INSERT event
            ↓
    fetchTodayEarnings()
            ↓
    today's earnings recalculated
            ↓
    TodayEarnings updates automatically


It also handles:

    UPDATE
    DELETE

This is important because a transaction could change from:

    PENDING → COMPLETED

or potentially be removed/reconciled.

No schema change is required.

No `todayEarnings` field is required on Courier.

============================================================
*/

  useEffect(() => {
    /*
  ----------------------------------------------------------
  BASIC CHECK
  ----------------------------------------------------------

  We cannot subscribe specifically to a wallet until we know
  which wallet belongs to this courier.
  ----------------------------------------------------------
  */

    if (!dbCourier?.walletID) {
      return;
    }

    console.log("💰 TODAY_EARNINGS_REALTIME_SUBSCRIPTION_STARTED", {
      courierId: dbCourier?.id || null,
      walletID: dbCourier.walletID,
    });

    /*
  ----------------------------------------------------------
  CREATE TRANSACTION SUBSCRIPTION
  ----------------------------------------------------------

  DataStore.observe(Transaction) listens for realtime
  DataStore/AppSync changes to Transaction records.

  We filter locally because the transaction model's
  walletID identifies the courier wallet.
  ----------------------------------------------------------
  */

    const subscription = DataStore.observe(Transaction).subscribe(
      ({ opType, element }) => {
        /*
      ========================================================
      DEBUG
      ========================================================

      Keep this while testing.

      It lets us confirm that the Courier app is actually
      receiving realtime Transaction events.
      ========================================================
      */

        console.log("💰 TRANSACTION_REALTIME_EVENT_RECEIVED", {
          opType,
          transactionId: element?.id || null,
          walletID: element?.walletID || null,
          courierWalletID: dbCourier?.walletID || null,
          type: element?.type || null,
          status: element?.status || null,
          amount: element?.amount ?? null,
          orderID: element?.orderID || null,
          createdAt: element?.createdAt || null,
        });

        /*
      ========================================================
      IGNORE TRANSACTIONS BELONGING TO OTHER WALLETS
      ========================================================
      */

        if (!element) {
          return;
        }

        if (element.walletID !== dbCourier.walletID) {
          return;
        }

        /*
      ========================================================
      THIS TRANSACTION BELONGS TO OUR COURIER
      ========================================================

      Recalculate Today's Earnings.

      We deliberately call the existing
      `fetchTodayEarnings()` function instead of duplicating
      the earnings calculation here.

      This means there is still only ONE source of truth for
      Today's Earnings calculation.
      ========================================================
      */

        fetchTodayEarnings();
      },
    );

    /*
  ==========================================================
  CLEANUP
  ==========================================================

  When:

      - courier changes
      - wallet changes
      - HomeComponent unmounts

  unsubscribe from the previous Transaction subscription.

  This prevents:

      - duplicate listeners
      - multiple earnings recalculations
      - memory leaks
      - old wallet listeners remaining active
  ==========================================================
  */

    return () => {
      console.log("💰 TODAY_EARNINGS_REALTIME_SUBSCRIPTION_STOPPED", {
        courierId: dbCourier?.id || null,
        walletID: dbCourier?.walletID || null,
      });

      subscription.unsubscribe();
    };
  }, [dbCourier?.id, dbCourier?.walletID, fetchTodayEarnings]);

  /*
  ==========================================================
  GO ONLINE / OFFLINE
  ==========================================================
  */

  const showBackgroundLocationAlert = useCallback(() => {
    Alert.alert(
      "Background location required",
      "Atua Courier requires 'Allow all the time' location permission. " +
        "This allows your location to update when your phone is locked " +
        "or when Atua Courier is running in the background.",
      [
        {
          text: "Open Settings",
          onPress: () => {
            Linking.openSettings();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  }, []);

  const onGoPress = useCallback(async () => {
    /*
    ----------------------------------------------------------
    BASIC COURIER CHECK
    ----------------------------------------------------------
    */

    if (!dbCourier?.id) {
      return;
    }

    /*
    ----------------------------------------------------------
    BLOCKED CHECK
    ----------------------------------------------------------
    */

    if (dbCourier.isBlocked) {
      setIsOnline(false);

      /*
      Always stop background tracking for blocked couriers.
      */

      try {
        await stopCourierLocationTracking();
      } catch (error) {
        console.log("Unable to stop tracking for blocked courier:", error);
      }

      Alert.alert(
        "Account Blocked",
        "Your account has been blocked. You cannot go online or receive delivery requests. Please contact Atua support for assistance.",
      );

      return;
    }

    /*
    ----------------------------------------------------------
    APPROVAL CHECK
    ----------------------------------------------------------
    */

    if (!dbCourier.isApproved) {
      setIsOnline(false);

      /*
      Always stop background tracking for unapproved couriers.
      */

      try {
        await stopCourierLocationTracking();
      } catch (error) {
        console.log("Unable to stop tracking for unapproved courier:", error);
      }

      Alert.alert(
        "Account Not Approved",
        "Your account is still under review. You cannot go online yet.",
      );

      return;
    }

    try {
      /*
      --------------------------------------------------------
      GET THE FRESHEST COURIER RECORD
      --------------------------------------------------------
      */

      const freshCourier = await DataStore.query(Courier, dbCourier.id);

      if (!freshCourier) {
        Alert.alert("Error", "Unable to find your courier account.");

        return;
      }

      /*
      --------------------------------------------------------
      CHECK BLOCK STATUS AGAIN
      --------------------------------------------------------
      */

      if (freshCourier.isBlocked) {
        setIsOnline(false);

        try {
          await stopCourierLocationTracking();
        } catch (error) {
          console.log("Unable to stop tracking for blocked courier:", error);
        }

        if (freshCourier.isOnline) {
          await DataStore.save(
            Courier.copyOf(freshCourier, (updated) => {
              updated.isOnline = false;
              updated.statusKey = "OFFLINE#BLOCKED";
            }),
          );
        }

        setOrders([]);
        setStatsOrders([]);

        Alert.alert(
          "Account Blocked",
          "Your account has been blocked. You cannot go online or receive delivery requests. Please contact Atua support for assistance.",
        );

        return;
      }

      /*
      --------------------------------------------------------
      CHECK APPROVAL STATUS AGAIN
      --------------------------------------------------------
      */

      if (!freshCourier.isApproved) {
        setIsOnline(false);

        try {
          await stopCourierLocationTracking();
        } catch (error) {
          console.log("Unable to stop tracking for unapproved courier:", error);
        }

        if (freshCourier.isOnline) {
          await DataStore.save(
            Courier.copyOf(freshCourier, (updated) => {
              updated.isOnline = false;
              updated.statusKey = "OFFLINE#NOT_APPROVED";
            }),
          );
        }

        setOrders([]);
        setStatsOrders([]);

        Alert.alert(
          "Account Not Approved",
          "Your account is still under review. You cannot go online yet.",
        );

        return;
      }

      /*
      --------------------------------------------------------
      CALCULATE THE NEW ONLINE STATUS
      --------------------------------------------------------
      */

      const newStatus = !Boolean(freshCourier.isOnline);

      /*
      --------------------------------------------------------
      GOING OFFLINE
      --------------------------------------------------------
      */

      if (!newStatus) {
        /*
        Stop tracking before saving the courier as offline.
        */

        await stopCourierLocationTracking();

        await DataStore.save(
          Courier.copyOf(freshCourier, (updated) => {
            updated.isOnline = false;
            updated.statusKey = "OFFLINE#APPROVED";
          }),
        );

        setIsOnline(false);

        setOrders([]);
        setStatsOrders([]);

        return;
      }

      /*
      --------------------------------------------------------
      GOING ONLINE:
      CHECK EXISTING PERMISSIONS FIRST
      --------------------------------------------------------
      */

      const alreadyHasRequiredPermissions =
        await hasRequiredLocationPermissions();

      /*
      --------------------------------------------------------
      REQUEST PERMISSIONS IF NOT ALREADY GRANTED
      --------------------------------------------------------
      */

      if (!alreadyHasRequiredPermissions) {
        const permissionResult = await requestLocationPermissions();

        if (!permissionResult.granted) {
          /*
          Do not start tracking.
          Do not update the backend to online.
          Do not update the local state to online.
          */

          setIsOnline(false);

          if (permissionResult.foregroundGranted === false) {
            Alert.alert(
              "Location permission required",
              "Atua Courier needs location permission to receive and manage delivery requests.",
            );
          } else {
            showBackgroundLocationAlert();
          }

          return;
        }
      }

      /*
      --------------------------------------------------------
      START BACKGROUND LOCATION TRACKING
      --------------------------------------------------------

      Tracking must start successfully before the courier
      is saved as online.
      */

      await startCourierLocationTracking(freshCourier.id);

      /*
      --------------------------------------------------------
      SAVE ONLINE STATUS
      --------------------------------------------------------
      */

      await DataStore.save(
        Courier.copyOf(freshCourier, (updated) => {
          updated.isOnline = true;
          updated.statusKey = "ONLINE#APPROVED";
        }),
      );

      /*
      --------------------------------------------------------
      UPDATE LOCAL ONLINE STATE
      --------------------------------------------------------
      */

      setIsOnline(true);
    } catch (error) {
      console.log("Online/offline error:", error);

      /*
      If anything fails, keep the courier offline locally.
      */

      setIsOnline(false);

      /*
      Stop tracking as a safety fallback.
      */

      try {
        await stopCourierLocationTracking();
      } catch (trackingError) {
        console.log(
          "Unable to stop tracking after online status failure:",
          trackingError,
        );
      }

      Alert.alert(
        "Error",
        error?.message || "Unable to update your online status.",
      );
    }
  }, [
    dbCourier?.id,
    dbCourier?.isApproved,
    dbCourier?.isBlocked,
    setIsOnline,
    showBackgroundLocationAlert,
  ]);

  /*
  ==========================================================
  SELECT ORDER
  ==========================================================
  */

  const onSelectOrder = useCallback((order) => {
    router.push(`/home/${order.id}`);
  }, []);

  /*
  ==========================================================
  REMOVE ORDER FROM LOCAL UI
  ==========================================================
  */

  const onRemoveOrder = useCallback((id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));

    setStatsOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  /*
  ==========================================================
  MICRO / MOTO
  FETCH AVAILABLE MARKETPLACE ORDERS
  ==========================================================

  IMPORTANT:

  This replaces the old automatic-assignment dependency.

  OLD FLOW:

      READY_FOR_PICKUP
              ↓
      assignOrder Lambda
              ↓
      assignedCourierId
              ↓
      assignmentStatus = OFFERED
              ↓
      courier sees order


  NEW FLOW:

      READY_FOR_PICKUP
              +
          paymentStatus = PAID
              +
      assignedCourierId = empty
              ↓
      Courier Home finds eligible order
              ↓
      Distance check
              ↓
      Courier sees order


  NO assignmentStatus === "OFFERED" requirement exists here.

  ==========================================================
  */

  const fetchAvailableMicroMotoOrders = useCallback(async () => {
    if (
      !dbCourier?.id ||
      !isOnline ||
      dbCourier.isBlocked ||
      !dbCourier.isApproved ||
      (!isMicro && !isMoto)
    ) {
      setOrders([]);
      setStatsOrders([]);
      return;
    }

    /*
    ----------------------------------------------------------
    LOCATION IS REQUIRED
    ----------------------------------------------------------

    Micro/Moto availability depends on the distance from the
    courier to the order pickup location.

    If we do not have a current courier location, we cannot
    safely determine which orders are within 5km / 10km.
    ----------------------------------------------------------
    */

    if (
      !location ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      setOrders([]);
      setStatsOrders([]);
      return;
    }

    try {
      /*
      --------------------------------------------------------
      FETCH READY + PAID ORDERS
      --------------------------------------------------------

      We deliberately do NOT filter by assignedCourierId here.

      Instead, we fetch the marketplace candidates and then
      verify that the order is currently unassigned.

      This is important because:

          assignedCourierId = null

      is part of the availability condition.
      --------------------------------------------------------
      */

      const readyPaidOrders = await DataStore.query(Order, (order) =>
        order.and((o) => [
          o.status.eq("READY_FOR_PICKUP"),
          o.paymentStatus.eq("PAID"),
        ]),
      );

      /*
      --------------------------------------------------------
      DETERMINE COURIER-SPECIFIC SETTINGS
      --------------------------------------------------------
      */

      let allowedTransportationTypes = [];
      let pickupRadius = 0;

      if (isMicro) {
        allowedTransportationTypes = ["MICRO_EXPRESS", "MICRO_BATCH"];

        pickupRadius = MICRO_RADIUS;
      }

      if (isMoto) {
        allowedTransportationTypes = ["MOTO_EXPRESS", "MOTO_BATCH"];

        pickupRadius = MOTO_RADIUS;
      }

      /*
      --------------------------------------------------------
      FILTER MARKETPLACE ORDERS
      --------------------------------------------------------

      Every order must satisfy ALL of these:

      1. READY_FOR_PICKUP
      2. PAID
      3. Not already assigned
      4. Correct transportation category
      5. Valid pickup coordinates
      6. Within the courier's pickup radius
      --------------------------------------------------------
      */

      const availableOrders = readyPaidOrders.filter((order) => {
        /*
          ----------------------------------------------------
          MUST STILL BE UNASSIGNED
          ----------------------------------------------------

          Another courier may have accepted the order between
          the time it was queried and now.

          Therefore the parent screen never treats an already
          assigned order as available.
          ----------------------------------------------------
          */

        if (order.assignedCourierId) {
          return false;
        }

        /*
          ----------------------------------------------------
          MUST BE THE CORRECT ORDER TYPE
          ----------------------------------------------------
          */

        if (!allowedTransportationTypes.includes(order.transportationType)) {
          return false;
        }

        /*
          ----------------------------------------------------
          PICKUP COORDINATES REQUIRED
          ----------------------------------------------------
          */

        if (
          typeof order.originLat !== "number" ||
          typeof order.originLng !== "number"
        ) {
          return false;
        }

        /*
          ----------------------------------------------------
          CALCULATE DISTANCE

          Courier:
              location.latitude
              location.longitude

          Order pickup:
              order.originLat
              order.originLng
          ----------------------------------------------------
          */

        const distance = getDistance(
          location.latitude,
          location.longitude,
          order.originLat,
          order.originLng,
        );

        /*
          ----------------------------------------------------
          APPLY MICRO / MOTO RADIUS
          ----------------------------------------------------
          */

        return distance <= pickupRadius;
      });

      /*
      --------------------------------------------------------
      SORT BY PICKUP DISTANCE
      --------------------------------------------------------

      Closest pickup first.

      This is only a display ordering.

      It does NOT assign the order to the courier.
      --------------------------------------------------------
      */

      const sortedOrders = [...availableOrders].sort((a, b) => {
        const distanceA = getDistance(
          location.latitude,
          location.longitude,
          a.originLat,
          a.originLng,
        );

        const distanceB = getDistance(
          location.latitude,
          location.longitude,
          b.originLat,
          b.originLng,
        );

        return distanceA - distanceB;
      });

      /*
      --------------------------------------------------------
      SAVE AVAILABLE ORDERS
      --------------------------------------------------------
      */

      setOrders(sortedOrders);

      setStatsOrders(sortedOrders);
    } catch (error) {
      console.log("Available Micro/Moto orders error:", error);

      setOrders([]);
      setStatsOrders([]);
    }
  }, [
    dbCourier?.id,
    dbCourier?.isApproved,
    dbCourier?.isBlocked,
    isOnline,
    isMicro,
    isMoto,
    location,
  ]);

  /*
  ==========================================================
  MAXI
  FETCH ALL MAXI ORDERS
  ==========================================================

  IMPORTANT:

  THIS IS THE EXISTING MAXI LOGIC.

  It is intentionally preserved.

  MAXI remains a marketplace.

  statsOrders:
      ALL eligible MAXI jobs.

  orders:
      ONLY MAXI jobs within 80km.

  vehicleClass matching remains unchanged.

  ==========================================================
  */

  const fetchMaxiOrders = useCallback(async () => {
    if (
      !dbCourier?.id ||
      !isOnline ||
      dbCourier.isBlocked ||
      !dbCourier.isApproved ||
      !dbCourier.vehicleClass
    ) {
      setOrders([]);
      setStatsOrders([]);
      return;
    }

    try {
      /*
      ------------------------------------------------------
      FETCH ALL ELIGIBLE MAXI ORDERS
      ------------------------------------------------------
      */

      const allMaxiOrders = await DataStore.query(Order, (order) =>
        order.and((o) => [
          o.transportationType.eq("MAXI"),

          o.vehicleClass.eq(dbCourier.vehicleClass),

          o.or((status) => [
            status.status.eq("READY_FOR_PICKUP"),
            status.status.eq("BIDDING"),
          ]),
        ]),
      );

      /*
      ------------------------------------------------------
      ALL MAXI ORDERS = STATS
      ------------------------------------------------------
      */

      setStatsOrders(allMaxiOrders);

      /*
      ------------------------------------------------------
      LOCATION REQUIRED FOR DISPLAY
      ------------------------------------------------------
      */

      if (!location) {
        setOrders([]);
        return;
      }

      /*
      ------------------------------------------------------
      FILTER 80KM DISPLAY RADIUS
      ------------------------------------------------------
      */

      const nearbyMaxiOrders = allMaxiOrders.filter((order) => {
        if (
          typeof order.originLat !== "number" ||
          typeof order.originLng !== "number"
        ) {
          return false;
        }

        const distance = getDistance(
          location.latitude,
          location.longitude,
          order.originLat,
          order.originLng,
        );

        return distance <= MAXI_RADIUS;
      });

      /*
      ------------------------------------------------------
      SORT BY DISTANCE
      ------------------------------------------------------
      */

      nearbyMaxiOrders.sort((a, b) => {
        const distanceA = getDistance(
          location.latitude,
          location.longitude,
          a.originLat,
          a.originLng,
        );

        const distanceB = getDistance(
          location.latitude,
          location.longitude,
          b.originLat,
          b.originLng,
        );

        return distanceA - distanceB;
      });

      setOrders(nearbyMaxiOrders);
    } catch (error) {
      console.log("MAXI orders error:", error);

      setOrders([]);
      setStatsOrders([]);
    }
  }, [
    dbCourier?.id,
    dbCourier?.vehicleClass,
    dbCourier?.isApproved,
    dbCourier?.isBlocked,
    isOnline,
    location,
  ]);

  /*
  ==========================================================
  FETCH ORDERS
  ==========================================================

  IMPORTANT:

  We branch here.

  MAXI:
      Existing Maxi function remains.

  MICRO / MOTO:
      New manual marketplace function.
  ==========================================================
  */

  const fetchOrders = useCallback(async () => {
    if (
      !dbCourier ||
      !isOnline ||
      dbCourier.isBlocked ||
      !dbCourier.isApproved
    ) {
      setOrders([]);
      setStatsOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      /*
      --------------------------------------------------------
      MAXI
      --------------------------------------------------------

      Existing Maxi marketplace logic is preserved.
      --------------------------------------------------------
      */

      if (isMaxi) {
        await fetchMaxiOrders();
      } else {
        /*
        ------------------------------------------------------
        MICRO / MOTO

        NEW MANUAL MARKETPLACE LOGIC
        ------------------------------------------------------
        */

        await fetchAvailableMicroMotoOrders();
      }
    } catch (error) {
      console.log("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  }, [
    dbCourier,
    isOnline,
    isMaxi,
    fetchMaxiOrders,
    fetchAvailableMicroMotoOrders,
  ]);

  /*
============================================================
LOAD SOUND
============================================================
*/

  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/new-order.mp3"),
        );

        if (mounted) {
          soundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (error) {
        console.log("Load sound error:", error);
      }
    };

    loadSound();

    return () => {
      mounted = false;

      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  /*
============================================================
AUDIO MODE
============================================================
*/

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    }).catch((error) => {
      console.log("Audio mode error:", error);
    });
  }, []);

  /*
============================================================
PLAY NEW ORDER SOUND
============================================================
*/

  const playNewOrderSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();

        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }
    } catch (error) {
      console.log("Sound error:", error);
    }
  }, []);

  /*
============================================================
DETECT NEW ORDERS
============================================================

Whenever a new order enters the local `orders` array,
play the notification sound and haptic feedback.

This works for both:

    Micro/Moto marketplace orders
    Existing Maxi marketplace orders
============================================================
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
  }, [orders, playNewOrderSound]);

  /*
============================================================
FORCE UNAPPROVED COURIER OFFLINE
============================================================
*/

  useEffect(() => {
    const forceOfflineIfNotApproved = async () => {
      if (!dbCourier?.id) {
        return;
      }

      if (dbCourier.isApproved === false && dbCourier.isOnline) {
        try {
          await stopCourierLocationTracking();

          const freshCourier = await DataStore.query(Courier, dbCourier.id);

          if (!freshCourier) {
            return;
          }

          await DataStore.save(
            Courier.copyOf(freshCourier, (updated) => {
              updated.isOnline = false;
              updated.statusKey = "OFFLINE#NOT_APPROVED";
            }),
          );

          setIsOnline(false);

          setOrders([]);
          setStatsOrders([]);

          Alert.alert(
            "Account Not Approved",
            "You have been taken offline because your account is not approved.",
          );
        } catch (error) {
          console.log("Force offline error:", error);
        }
      }
    };

    forceOfflineIfNotApproved();
  }, [dbCourier?.id, dbCourier?.isApproved, dbCourier?.isOnline, setIsOnline]);

  /*
============================================================
FORCE BLOCKED COURIER OFFLINE
============================================================
*/

  useEffect(() => {
    const forceOfflineIfBlocked = async () => {
      if (!dbCourier?.id) {
        return;
      }

      if (dbCourier.isBlocked === true) {
        try {
          await stopCourierLocationTracking();

          const freshCourier = await DataStore.query(Courier, dbCourier.id);

          if (!freshCourier) {
            return;
          }

          const wasOnline = Boolean(freshCourier.isOnline);

          if (wasOnline) {
            await DataStore.save(
              Courier.copyOf(freshCourier, (updated) => {
                updated.isOnline = false;
                updated.statusKey = "OFFLINE#BLOCKED";
              }),
            );
          }

          setIsOnline(false);

          setOrders([]);
          setStatsOrders([]);

          if (wasOnline) {
            Alert.alert(
              "Account Blocked",
              "Your account has been blocked and you have been taken offline. Please contact Atua support for assistance.",
            );
          }
        } catch (error) {
          console.log("Blocked courier error:", error);
        }
      }
    };

    forceOfflineIfBlocked();
  }, [dbCourier?.id, dbCourier?.isBlocked, dbCourier?.isOnline, setIsOnline]);

  /*
============================================================
INITIAL / REFRESH ORDER LOAD
============================================================

When:

    - courier goes online
    - location becomes available
    - courier approval changes
    - courier blocking changes
    - courier type changes

we reload the appropriate marketplace.

IMPORTANT:

    MAXI
        → existing fetchMaxiOrders()

    MICRO / MOTO
        → new fetchAvailableMicroMotoOrders()
============================================================
*/

  useEffect(() => {
    if (
      !isOnline ||
      !location ||
      !dbCourier ||
      !dbCourier.isApproved ||
      dbCourier.isBlocked
    ) {
      setOrders([]);
      setStatsOrders([]);
      setLoading(false);

      return;
    }

    fetchOrders();
  }, [
    isOnline,
    location,
    dbCourier?.id,
    dbCourier?.isApproved,
    dbCourier?.isBlocked,
    dbCourier?.vehicleClass,
    dbCourier?.transportationType,
    fetchOrders,
  ]);

  /*
============================================================
REAL-TIME ORDER SUBSCRIPTION
============================================================

This is the most important part of the new manual flow.

MICRO / MOTO:

The courier does NOT wait for:

    assignedCourierId
    assignmentStatus = OFFERED

Instead, the app watches all Order changes and determines
whether the order is currently available to this courier.

Availability:

    READY_FOR_PICKUP
    +
    PAID
    +
    unassigned
    +
    correct transportationType
    +
    within pickup radius

MAXI:

The existing Maxi marketplace logic remains separate.
============================================================
*/

  useEffect(() => {
    if (
      !isOnline ||
      !dbCourier ||
      !dbCourier.isApproved ||
      dbCourier.isBlocked
    ) {
      return;
    }

    const subscription = DataStore.observe(Order).subscribe(
      ({ opType, element }) => {
        /*
      ========================================================
      DEBUG
      ========================================================

      Keep this logging while testing the new realtime flow.

      It lets us verify that the Courier app is actually
      receiving AppSync/DataStore events.
      ========================================================
      */

        console.log("🚨 ORDER_REALTIME_EVENT_RECEIVED", {
          opType,
          orderId: element?.id || null,
          assignedCourierId: element?.assignedCourierId || null,
          myCourierId: dbCourier?.id || null,
          assignmentStatus: element?.assignmentStatus || null,
          status: element?.status || null,
          paymentStatus: element?.paymentStatus || null,
          transportationType: element?.transportationType || null,
          hasNewOffer: element?.hasNewOffer ?? null,
          userID: element?.userID || null,
          version: element?._version ?? null,
          lastChangedAt: element?._lastChangedAt || null,
        });

        if (!element) {
          console.log("🚨 ORDER_REALTIME_EVENT_WITHOUT_ELEMENT", {
            opType,
          });

          return;
        }

        /*
      ========================================================
      MICRO / MOTO
      ========================================================
      */

        if (!isMaxi) {
          /*
        ------------------------------------------------------
        DETERMINE ALLOWED TRANSPORTATION TYPES
        ------------------------------------------------------

        Courier category:

            MICRO
            MOTO

        Order types:

            MICRO_EXPRESS
            MICRO_BATCH
            MOTO_EXPRESS
            MOTO_BATCH
        ------------------------------------------------------
        */

          let allowedTransportationTypes = [];
          let pickupRadius = 0;

          if (isMicro) {
            allowedTransportationTypes = ["MICRO_EXPRESS", "MICRO_BATCH"];

            pickupRadius = MICRO_RADIUS;
          }

          if (isMoto) {
            allowedTransportationTypes = ["MOTO_EXPRESS", "MOTO_BATCH"];

            pickupRadius = MOTO_RADIUS;
          }

          /*
        ------------------------------------------------------
        DETERMINE WHETHER THIS ORDER IS AVAILABLE
        ------------------------------------------------------
        */

          const isReadyForPickup = element.status === "READY_FOR_PICKUP";

          const isPaid = element.paymentStatus === "PAID";

          const isUnassigned = !element.assignedCourierId;

          const isCorrectTransportationType =
            allowedTransportationTypes.includes(element.transportationType);

          /*
        ------------------------------------------------------
        LOCATION CHECK
        ------------------------------------------------------
        */

          let isWithinPickupRadius = false;

          if (
            location &&
            typeof location.latitude === "number" &&
            typeof location.longitude === "number" &&
            typeof element.originLat === "number" &&
            typeof element.originLng === "number"
          ) {
            const distance = getDistance(
              location.latitude,
              location.longitude,
              element.originLat,
              element.originLng,
            );

            isWithinPickupRadius = distance <= pickupRadius;

            console.log("📍 MICRO/MOTO_ORDER_DISTANCE_CHECK", {
              orderId: element.id,
              transportationType: element.transportationType,
              courierType: dbCourier?.transportationType,
              distanceKm: Number(distance.toFixed(2)),
              allowedRadiusKm: pickupRadius,
              withinRadius: isWithinPickupRadius,
            });
          }

          /*
        ------------------------------------------------------
        FINAL AVAILABILITY CHECK
        ------------------------------------------------------

        IMPORTANT:

        There is deliberately NO:

            assignedCourierId === dbCourier.id

        and NO:

            assignmentStatus === "OFFERED"

        because this is now a marketplace.
        ------------------------------------------------------
        */

          const isAvailableOrder =
            isReadyForPickup &&
            isPaid &&
            isUnassigned &&
            isCorrectTransportationType &&
            isWithinPickupRadius;

          /*
        ======================================================
        INSERT
        ======================================================
        */

          if (opType === "INSERT") {
            if (!isAvailableOrder) {
              return;
            }

            setOrders((prev) => {
              /*
            Avoid duplicate entries.
            */

              if (prev.some((order) => order.id === element.id)) {
                return prev;
              }

              return [element, ...prev];
            });

            setStatsOrders((prev) => {
              if (prev.some((order) => order.id === element.id)) {
                return prev;
              }

              return [element, ...prev];
            });

            return;
          }

          /*
        ======================================================
        UPDATE
        ======================================================
        */

          if (opType === "UPDATE") {
            /*
          ----------------------------------------------------
          ORDER NO LONGER AVAILABLE
          ----------------------------------------------------

          Examples:

              READY_FOR_PICKUP → ACCEPTED
              PAID → FAILED
              assignedCourierId becomes populated
              transportation type changes
              courier moves outside radius
              order is cancelled
              order is otherwise no longer eligible
          ----------------------------------------------------
          */

            if (!isAvailableOrder) {
              setOrders((prev) =>
                prev.filter((order) => order.id !== element.id),
              );

              setStatsOrders((prev) =>
                prev.filter((order) => order.id !== element.id),
              );

              return;
            }

            /*
          ----------------------------------------------------
          ORDER IS STILL AVAILABLE

          Update it in the local list.
          ----------------------------------------------------
          */

            setOrders((prev) => {
              const exists = prev.some((order) => order.id === element.id);

              if (!exists) {
                return [element, ...prev];
              }

              return prev.map((order) =>
                order.id === element.id ? element : order,
              );
            });

            setStatsOrders((prev) => {
              const exists = prev.some((order) => order.id === element.id);

              if (!exists) {
                return [element, ...prev];
              }

              return prev.map((order) =>
                order.id === element.id ? element : order,
              );
            });

            return;
          }

          /*
        ======================================================
        DELETE
        ======================================================
        */

          if (opType === "DELETE") {
            setOrders((prev) =>
              prev.filter((order) => order.id !== element.id),
            );

            setStatsOrders((prev) =>
              prev.filter((order) => order.id !== element.id),
            );
          }

          return;
        }

        /*
      ========================================================
      MAXI
      ========================================================

      IMPORTANT:

      EXISTING MAXI REAL-TIME LOGIC.

      We are deliberately keeping this separate from the
      Micro/Moto marketplace logic above.
      ========================================================
      */

        const isRelevantMaxi =
          element.transportationType === "MAXI" &&
          element.vehicleClass === dbCourier.vehicleClass &&
          (element.status === "READY_FOR_PICKUP" ||
            element.status === "BIDDING");

        /*
      --------------------------------------------------------
      DELETE / NO LONGER RELEVANT
      --------------------------------------------------------
      */

        if (!isRelevantMaxi) {
          if (opType === "UPDATE" || opType === "DELETE") {
            setOrders((prev) =>
              prev.filter((order) => order.id !== element.id),
            );

            setStatsOrders((prev) =>
              prev.filter((order) => order.id !== element.id),
            );
          }

          return;
        }

        /*
      --------------------------------------------------------
      UPDATE ALL MAXI STATS
      --------------------------------------------------------
      */

        setStatsOrders((prev) => {
          const exists = prev.some((order) => order.id === element.id);

          if (opType === "INSERT" && !exists) {
            return [element, ...prev];
          }

          if (opType === "UPDATE") {
            if (!exists) {
              return [element, ...prev];
            }

            return prev.map((order) =>
              order.id === element.id ? element : order,
            );
          }

          return prev;
        });

        /*
      --------------------------------------------------------
      DELETE
      --------------------------------------------------------
      */

        if (opType === "DELETE") {
          setOrders((prev) => prev.filter((order) => order.id !== element.id));

          setStatsOrders((prev) =>
            prev.filter((order) => order.id !== element.id),
          );

          return;
        }

        /*
      --------------------------------------------------------
      LOCATION REQUIRED FOR DISPLAY
      --------------------------------------------------------
      */

        if (
          !location ||
          typeof element.originLat !== "number" ||
          typeof element.originLng !== "number"
        ) {
          return;
        }

        /*
      --------------------------------------------------------
      CHECK 80KM DISPLAY RADIUS
      --------------------------------------------------------
      */

        const distance = getDistance(
          location.latitude,
          location.longitude,
          element.originLat,
          element.originLng,
        );

        /*
      --------------------------------------------------------
      OUTSIDE 80KM

      Remains in statsOrders,
      but not visible in orders.
      --------------------------------------------------------
      */

        if (distance > MAXI_RADIUS) {
          setOrders((prev) => prev.filter((order) => order.id !== element.id));

          return;
        }

        /*
      --------------------------------------------------------
      WITHIN 80KM
      --------------------------------------------------------
      */

        setOrders((prev) => {
          const exists = prev.some((order) => order.id === element.id);

          if (opType === "INSERT" && !exists) {
            return [element, ...prev];
          }

          if (opType === "UPDATE") {
            if (!exists) {
              return [element, ...prev];
            }

            return prev.map((order) =>
              order.id === element.id ? element : order,
            );
          }

          return prev;
        });
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [
    isOnline,
    isMaxi,
    isMicro,
    isMoto,
    location,
    dbCourier?.id,
    dbCourier?.vehicleClass,
    dbCourier?.transportationType,
    dbCourier?.isApproved,
    dbCourier?.isBlocked,
  ]);

  /*
============================================================
STATS CALCULATION
============================================================

MICRO / MOTO:

    statsOrders contains the currently available marketplace
    orders for this courier.

MAXI:

    Existing Maxi statistics remain based on statsOrders.
============================================================
*/

  useEffect(() => {
    let total = 0;
    let nearby = 0;
    let batch = 0;
    let express = 0;

    /*
  ==========================================================
  MICRO / MOTO
  ==========================================================
  */

    if (!isMaxi) {
      /*
    --------------------------------------------------------
    TOTAL AVAILABLE ORDERS
    --------------------------------------------------------
    */

      total = statsOrders.length;

      statsOrders.forEach((order) => {
        /*
      ------------------------------------------------------
      BATCH
      ------------------------------------------------------
      */

        if (
          order.transportationType === "MICRO_BATCH" ||
          order.transportationType === "MOTO_BATCH"
        ) {
          batch++;
        }

        /*
      ------------------------------------------------------
      EXPRESS
      ------------------------------------------------------
      */

        if (
          order.transportationType === "MICRO_EXPRESS" ||
          order.transportationType === "MOTO_EXPRESS"
        ) {
          express++;
        }

        /*
      ------------------------------------------------------
      NEARBY
      ------------------------------------------------------

      For the new marketplace flow, every order already
      satisfies the courier's actual 5km/10km radius.

      Therefore, every order currently in statsOrders is
      considered nearby.

      This avoids the old 15km informational threshold,
      which no longer represents the marketplace rules.
      ------------------------------------------------------
      */

        if (
          location &&
          typeof order.originLat === "number" &&
          typeof order.originLng === "number"
        ) {
          const distance = getDistance(
            location.latitude,
            location.longitude,
            order.originLat,
            order.originLng,
          );

          const radius = isMicro ? MICRO_RADIUS : isMoto ? MOTO_RADIUS : 0;

          if (distance <= radius) {
            nearby++;
          }
        }
      });
    }

    /*
  ==========================================================
  MAXI
  ==========================================================

  Existing Maxi statistics logic is preserved.
  ==========================================================
  */

    if (isMaxi) {
      total = statsOrders.length;

      statsOrders.forEach((order) => {
        if (
          location &&
          typeof order.originLat === "number" &&
          typeof order.originLng === "number"
        ) {
          const distance = getDistance(
            location.latitude,
            location.longitude,
            order.originLat,
            order.originLng,
          );

          if (distance <= MAXI_RADIUS) {
            nearby++;
          }
        }
      });
    }

    /*
  ==========================================================
  SAVE STATS
  ==========================================================
  */

    setStats({
      total,
      nearby,
      batch,
      express,
    });
  }, [statsOrders, location, isMaxi, isMicro, isMoto]);

  /*
============================================================
LOADING
============================================================
*/

  if (loading && isOnline) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  /*
============================================================
RENDER
============================================================
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
          {/* ==================================================
            STATUS / STATS
        ================================================== */}

          <BottomContainer
            isOnline={isOnline}
            isApproved={dbCourier?.isApproved}
            isBlocked={dbCourier?.isBlocked}
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
              {isMaxi
                ? "No Maxi jobs within 80km right now."
                : "No delivery orders available nearby right now."}
            </Text>
          )}

          {/* ==================================================
            ORDER LIST
        ================================================== */}

          {isOnline &&
            !dbCourier?.isBlocked &&
            orders.map((item) => (
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
