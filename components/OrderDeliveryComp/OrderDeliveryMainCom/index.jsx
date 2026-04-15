import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import BottomSheetHeader from "../BottomSheetOrderHeader";
import OrderDeliveryMap from "../OrderDeliveryMap";
import OrderDetails from "../OrderDetails";
import styles from "./styles";

import { useOrderContext } from "@/providers/OrderProvider";

/**
 * 🚀 DELIVERY FLOW (SINGLE SOURCE)
 */
const DELIVERY_FLOW = {
  DEFAULT: [
    "ACCEPTED",
    "ARRIVED_PICKUP",
    "PICKED_UP",
    "IN_TRANSIT",
    "ARRIVED_DROPOFF",
    "DELIVERED",
  ],
  MAXI: [
    "ACCEPTED",
    "ARRIVED_PICKUP",
    "LOADING",
    "PICKED_UP",
    "IN_TRANSIT",
    "ARRIVED_DROPOFF",
    "UNLOADING",
    "DELIVERED",
  ],
};

/**
 * 🎯 BUTTON TITLES
 */
const getStatusConfig = (isMaxi) => {
  if (isMaxi) {
    return {
      READY_FOR_PICKUP: { title: "Waiting for acceptance" },
      ACCEPTED: { title: "Arrived at Pickup" },
      ARRIVED_PICKUP: { title: "Start Loading" },
      LOADING: { title: "Confirm Loaded" },
      PICKED_UP: { title: "Start Trip" },
      IN_TRANSIT: { title: "Arrived at Dropoff" },
      ARRIVED_DROPOFF: { title: "Start Unloading" },
      UNLOADING: { title: "Finish Delivery" },
      DELIVERED: { title: "Completed" },
    };
  }

  // ✅ MOTO / MICRO FLOW
  return {
    READY_FOR_PICKUP: { title: "Waiting for acceptance" },
    ACCEPTED: { title: "Arrived at Pickup" },
    ARRIVED_PICKUP: { title: "Pick Up Package" }, // ✅ FIX
    PICKED_UP: { title: "Start Trip" },
    IN_TRANSIT: { title: "Arrived at Dropoff" },
    ARRIVED_DROPOFF: { title: "Confirm Delivery" }, // ✅ FIX
    DELIVERED: { title: "Completed" },
  };
};

const OrderdeliveryMainCom = ({ order, user }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["30%", "75%", "90%"], []);

  const {
    mapRef,
    location,
    isCourierclose,
    updateOrderStatus,
    completeOrder,
    totalMins,
  } = useOrderContext();

  /**
   * 🧠 FLOW
   */
  const isMaxi = order?.transportationType === "MAXI";

  const flow = useMemo(() => {
    return isMaxi ? DELIVERY_FLOW.MAXI : DELIVERY_FLOW.DEFAULT;
  }, [isMaxi]);

  /**
   * 🎯 NEXT STATUS
   */
  const nextStatus = useMemo(() => {
    if (!order?.status) return null;

    const index = flow.indexOf(order.status);
    if (index === -1) return null;

    return flow[index + 1] || null;
  }, [order?.status, flow]);

  /**
   * 🗺 Animate
   */
  const animateToUser = () => {
    if (!location) return;

    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  /**
   * 🔥 MAIN ACTION
   */
  const onButtonPressed = async () => {
    if (!order || loadingAction || !nextStatus) return;

    setLoadingAction(true);

    try {
      console.log("CURRENT:", order.status);
      console.log("NEXT:", nextStatus);

      if (nextStatus === "DELIVERED") {
        const success = await completeOrder(order.id);

        if (success) {
          router.replace("/home");
        }
      } else {
        await updateOrderStatus(order.id, nextStatus);
      }

      bottomSheetRef.current?.collapse();
      animateToUser();
    } catch (e) {
      console.error("Action error:", e);
    } finally {
      setLoadingAction(false);
    }
  };

  /**
   * 🔒 DISABLE BUTTON
   */
  const isButtonDisabled = useMemo(() => {
    if (!isMapLoaded || loadingAction) return true;

    if (order?.status === "READY_FOR_PICKUP") return true;

    const proximityRequired = ["ACCEPTED", "ARRIVED_PICKUP", "ARRIVED_DROPOFF"];

    if (proximityRequired.includes(order?.status)) {
      return !isCourierclose;
    }

    return false;
  }, [order?.status, isCourierclose, isMapLoaded, loadingAction]);

  /**
   * 📦 PICKED STATE
   */
  const deliveryPickedUp = useMemo(() => {
    return ["PICKED_UP", "IN_TRANSIT", "ARRIVED_DROPOFF", "UNLOADING"].includes(
      order?.status,
    );
  }, [order?.status]);

  /**
   * 🎯 BUTTON TEXT
   */
  const statusConfig = getStatusConfig(isMaxi);

  const buttonTitle = statusConfig[order?.status]?.title || "Continue";

  if (!order) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* MAP */}
      <OrderDeliveryMap
        order={order}
        user={user}
        onMapReady={() => setIsMapLoaded(true)}
      />

      {/* BACK */}
      {order?.status === "READY_FOR_PICKUP" && (
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" style={styles.backIcon} />
        </Pressable>
      )}

      {/* SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enablePanDownToClose={false}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: 250 }}
          keyboardShouldPersistTaps="handled"
        >
          <BottomSheetHeader />

          <OrderDetails
            order={order}
            user={user}
            deliveryPickedUp={deliveryPickedUp}
            isButtonDisabled={isButtonDisabled}
            buttonTitle={buttonTitle}
            onButtonPressed={onButtonPressed}
            loading={loadingAction}
            totalMins={totalMins}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default OrderdeliveryMainCom;
