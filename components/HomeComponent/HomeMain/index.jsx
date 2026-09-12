import { useAuthContext } from "@/providers/AuthProvider";
import { useProfileContext } from "@/providers/ProfileProvider";
import { Courier, Order, Transaction } from "@/src/models";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { DataStore } from "aws-amplify/datastore";

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

  MICRO / MOTO:
  ----------------------------------------------------------
  orders = ONLY OFFERED orders assigned to this courier.

  MAXI:
  ----------------------------------------------------------
  orders = MAXI orders within the 80km display radius.
  ==========================================================
  */

  const [orders, setOrders] = useState([]);

  /*
  ==========================================================
  STATS ORDERS
  ==========================================================

  MICRO / MOTO:
  ----------------------------------------------------------
  statsOrders = OFFERED orders assigned to this courier.

  MAXI:
  ----------------------------------------------------------
  statsOrders = ALL eligible MAXI marketplace orders.
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

  const isMaxi = dbCourier?.transportationType === "MAXI";

  /*
  ==========================================================
  MAXI DISPLAY RADIUS
  ==========================================================

  This controls what MAXI couriers SEE.

  It does NOT control the MAXI job count.
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
  ==========================================================
  LOAD EARNINGS
  ==========================================================
  */

  useEffect(() => {
    fetchTodayEarnings();
  }, [fetchTodayEarnings]);

  /*
  ==========================================================
  GO ONLINE / OFFLINE
  ==========================================================
  */

  const onGoPress = useCallback(async () => {
    if (!location || !dbCourier?.id) {
      return;
    }

    /*
    --------------------------------------------------------
    BLOCKED
    --------------------------------------------------------
    */

    if (dbCourier.isBlocked) {
      setIsOnline(false);

      Alert.alert(
        "Account Blocked",
        "Your account has been blocked. You cannot go online or receive delivery requests. Please contact Atua support for assistance.",
      );

      return;
    }

    /*
    --------------------------------------------------------
    NOT APPROVED
    --------------------------------------------------------
    */

    if (!dbCourier.isApproved) {
      setIsOnline(false);

      Alert.alert(
        "Account Not Approved",
        "Your account is still under review. You cannot go online yet.",
      );

      return;
    }

    try {
      const freshCourier = await DataStore.query(Courier, dbCourier.id);

      if (!freshCourier) {
        return;
      }

      /*
      ------------------------------------------------------
      CHECK BLOCK AGAIN
      ------------------------------------------------------
      */

      if (freshCourier.isBlocked) {
        if (freshCourier.isOnline) {
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

        Alert.alert(
          "Account Blocked",
          "Your account has been blocked. You cannot go online or receive delivery requests. Please contact Atua support for assistance.",
        );

        return;
      }

      /*
      ------------------------------------------------------
      CHECK APPROVAL AGAIN
      ------------------------------------------------------
      */

      if (!freshCourier.isApproved) {
        if (freshCourier.isOnline) {
          await DataStore.save(
            Courier.copyOf(freshCourier, (updated) => {
              updated.isOnline = false;
              updated.statusKey = "OFFLINE#NOT_APPROVED";
            }),
          );
        }

        setIsOnline(false);
        setOrders([]);
        setStatsOrders([]);

        Alert.alert(
          "Account Not Approved",
          "Your account is still under review. You cannot go online yet.",
        );

        return;
      }

      /*
      ------------------------------------------------------
      TOGGLE ONLINE STATUS
      ------------------------------------------------------
      */

      const newStatus = !Boolean(freshCourier.isOnline);

      await DataStore.save(
        Courier.copyOf(freshCourier, (updated) => {
          updated.isOnline = newStatus;

          updated.statusKey = newStatus
            ? "ONLINE#APPROVED"
            : "OFFLINE#APPROVED";
        }),
      );

      setIsOnline(newStatus);

      /*
      ------------------------------------------------------
      CLEAR JOBS WHEN GOING OFFLINE
      ------------------------------------------------------
      */

      if (!newStatus) {
        setOrders([]);
        setStatsOrders([]);
      }
    } catch (error) {
      console.log("Online status error:", error);

      Alert.alert(
        "Error",
        error?.message || "Unable to update your online status.",
      );
    }
  }, [
    dbCourier?.id,
    dbCourier?.isApproved,
    dbCourier?.isBlocked,
    location,
    setIsOnline,
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
  FETCH OFFERED ORDERS
  ==========================================================

  IMPORTANT:

  The dispatch Lambda does:

      READY_FOR_PICKUP
              ↓
      find eligible courier
              ↓
      assignedCourierId = courier
              ↓
      assignmentStatus = OFFERED
              ↓
      courier sees offer

  The courier must therefore look for OFFERED,
  NOT PENDING.

  PENDING is NOT the state used for an active offer.
  ==========================================================
  */

  const fetchAssignedOrders = useCallback(async () => {
    if (
      !dbCourier?.id ||
      !isOnline ||
      dbCourier.isBlocked ||
      !dbCourier.isApproved
    ) {
      setOrders([]);
      setStatsOrders([]);
      return;
    }

    try {
      const offeredOrders = await DataStore.query(Order, (order) =>
        order.and((o) => [
          /*
          ----------------------------------------------------
          MUST BELONG TO THIS COURIER
          ----------------------------------------------------
          */

          o.assignedCourierId.eq(dbCourier.id),

          /*
          ----------------------------------------------------
          ACTIVE OFFER ONLY
          ----------------------------------------------------

          This is the key change.

          Lambda creates:

              assignmentStatus = OFFERED

          so the courier app must query OFFERED.
          */

          o.assignmentStatus.eq("OFFERED"),

          /*
          ----------------------------------------------------
          ORDER MUST STILL BE READY
          ----------------------------------------------------
          */

          o.status.eq("READY_FOR_PICKUP"),
        ]),
      );

      const sortedOrders = [...offeredOrders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setOrders(sortedOrders);
      setStatsOrders(sortedOrders);
    } catch (error) {
      console.log("Offered orders error:", error);

      setOrders([]);
      setStatsOrders([]);
    }
  }, [dbCourier?.id, dbCourier?.isApproved, dbCourier?.isBlocked, isOnline]);

  /*
  ==========================================================
  MAXI
  FETCH ALL MAXI ORDERS
  ==========================================================

  MAXI remains a marketplace.

  statsOrders:
      ALL eligible MAXI jobs.

  orders:
      ONLY MAXI jobs within 80km.
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
      if (isMaxi) {
        await fetchMaxiOrders();
      } else {
        await fetchAssignedOrders();
      }
    } catch (error) {
      console.log("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  }, [dbCourier, isOnline, isMaxi, fetchMaxiOrders, fetchAssignedOrders]);

  /*
  ==========================================================
  LOAD SOUND
  ==========================================================
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
  ==========================================================
  AUDIO MODE
  ==========================================================
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
  ==========================================================
  PLAY NEW ORDER SOUND
  ==========================================================
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
  }, [orders, playNewOrderSound]);

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

      if (dbCourier.isApproved === false && dbCourier.isOnline) {
        try {
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
  ==========================================================
  FORCE BLOCKED COURIER OFFLINE
  ==========================================================
  */

  useEffect(() => {
    const forceOfflineIfBlocked = async () => {
      if (!dbCourier?.id) {
        return;
      }

      if (dbCourier.isBlocked === true) {
        try {
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
  ==========================================================
  INITIAL / REFRESH ORDER LOAD
  ==========================================================
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
    isMaxi,
    fetchOrders,
  ]);

  /*
  ==========================================================
  REAL-TIME ORDER SUBSCRIPTION
  ==========================================================
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
        // ==========================================================
        // DEBUG: CONFIRM WHETHER THE COURIER APP RECEIVES THE
        // REALTIME ORDER EVENT FROM DATASTORE
        // ==========================================================

        console.log("🚨 ORDER_REALTIME_EVENT_RECEIVED", {
          opType,
          orderId: element?.id || null,
          assignedCourierId: element?.assignedCourierId || null,
          myCourierId: dbCourier?.id || null,
          assignmentStatus: element?.assignmentStatus || null,
          status: element?.status || null,
          transportationType: element?.transportationType || null,
          hasNewOffer: element?.hasNewOffer ?? null,
          userID: element?.userID || null,
          version: element?._version ?? null,
          lastChangedAt: element?._lastChangedAt ?? null,
        });

        if (!element) {
          console.log("🚨 ORDER_REALTIME_EVENT_WITHOUT_ELEMENT", {
            opType,
          });

          return;
        }

        /*
        ====================================================
        MICRO / MOTO
        ====================================================
        */

        if (!isMaxi) {
          /*
          --------------------------------------------------
          DOES THIS ORDER BELONG TO THIS COURIER?
          --------------------------------------------------
          */

          const belongsToCourier = element.assignedCourierId === dbCourier.id;

          /*
          --------------------------------------------------
          ACTIVE OFFER
          --------------------------------------------------

          IMPORTANT:

          Lambda uses:

              OFFERED

          not PENDING.
          */

          const isOffered = element.assignmentStatus === "OFFERED";

          /*
          --------------------------------------------------
          ORDER MUST STILL BE READY
          --------------------------------------------------
          */

          const isReadyForPickup = element.status === "READY_FOR_PICKUP";

          /*
          --------------------------------------------------
          FINAL OFFER CHECK
          --------------------------------------------------
          */

          const isMyOffer = belongsToCourier && isOffered && isReadyForPickup;

          /*
          ==================================================
          INSERT
          ==================================================
          */

          if (opType === "INSERT") {
            if (!isMyOffer) {
              return;
            }

            setOrders((prev) => {
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
          ==================================================
          UPDATE
          ==================================================
          */

          if (opType === "UPDATE") {
            /*
            ------------------------------------------------
            ORDER NO LONGER AN ACTIVE OFFER
            ------------------------------------------------

            Examples:

                OFFERED → ACCEPTED
                OFFERED → TIMEOUT
                OFFERED → REJECTED
                OFFERED → CANCELLED
                courier changed
                order no longer READY_FOR_PICKUP

            Remove it from the offer list.
            ------------------------------------------------
            */

            if (!isMyOffer) {
              setOrders((prev) =>
                prev.filter((order) => order.id !== element.id),
              );

              setStatsOrders((prev) =>
                prev.filter((order) => order.id !== element.id),
              );

              return;
            }

            /*
            ------------------------------------------------
            ACTIVE OFFER UPDATED
            ------------------------------------------------
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
          ==================================================
          DELETE
          ==================================================
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
        ====================================================
        MAXI
        ====================================================

        MAXI is still a marketplace.

        ALL eligible MAXI jobs:
            statsOrders

        MAXI jobs within 80km:
            orders
        ====================================================
        */

        const isRelevantMaxi =
          element.transportationType === "MAXI" &&
          element.vehicleClass === dbCourier.vehicleClass &&
          (element.status === "READY_FOR_PICKUP" ||
            element.status === "BIDDING");

        /*
        ----------------------------------------------------
        DELETE / NO LONGER RELEVANT
        ----------------------------------------------------
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
        ----------------------------------------------------
        UPDATE ALL MAXI STATS
        ----------------------------------------------------
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
        ----------------------------------------------------
        DELETE
        ----------------------------------------------------
        */

        if (opType === "DELETE") {
          setOrders((prev) => prev.filter((order) => order.id !== element.id));

          setStatsOrders((prev) =>
            prev.filter((order) => order.id !== element.id),
          );

          return;
        }

        /*
        ----------------------------------------------------
        LOCATION REQUIRED FOR DISPLAY
        ----------------------------------------------------
        */

        if (
          !location ||
          typeof element.originLat !== "number" ||
          typeof element.originLng !== "number"
        ) {
          return;
        }

        /*
        ----------------------------------------------------
        CHECK 80KM DISPLAY RADIUS
        ----------------------------------------------------
        */

        const distance = getDistance(
          location.latitude,
          location.longitude,
          element.originLat,
          element.originLng,
        );

        /*
        ----------------------------------------------------
        OUTSIDE 80KM

        Remains in statsOrders,
        but not visible in orders.
        ----------------------------------------------------
        */

        if (distance > MAXI_RADIUS) {
          setOrders((prev) => prev.filter((order) => order.id !== element.id));

          return;
        }

        /*
        ----------------------------------------------------
        WITHIN 80KM
        ----------------------------------------------------
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

    return () => subscription.unsubscribe();
  }, [
    isOnline,
    isMaxi,
    location,
    dbCourier?.id,
    dbCourier?.vehicleClass,
    dbCourier?.isApproved,
    dbCourier?.isBlocked,
  ]);

  /*
  ==========================================================
  STATS CALCULATION
  ==========================================================
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

    statsOrders contains only this courier's
    currently OFFERED jobs.
    */

    if (!isMaxi) {
      total = statsOrders.length;

      statsOrders.forEach((order) => {
        /*
        -----------------------------------------------
        BATCH
        -----------------------------------------------
        */

        if (
          order.transportationType === "MICRO_BATCH" ||
          order.transportationType === "MOTO_BATCH"
        ) {
          batch++;
        }

        /*
        -----------------------------------------------
        EXPRESS
        -----------------------------------------------
        */

        if (
          order.transportationType === "MICRO_EXPRESS" ||
          order.transportationType === "MOTO_EXPRESS"
        ) {
          express++;
        }

        /*
        -----------------------------------------------
        NEARBY

        Informational only.

        Lambda has already selected the courier.
        -----------------------------------------------
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

          /*
          Keep your existing 15km informational
          nearby threshold.
          */

          if (distance <= 15) {
            nearby++;
          }
        }
      });
    }

    /*
    ==========================================================
    MAXI
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

    setStats({
      total,
      nearby,
      batch,
      express,
    });
  }, [statsOrders, location, isMaxi]);

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
                : "No delivery offers right now. Stay online."}
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
