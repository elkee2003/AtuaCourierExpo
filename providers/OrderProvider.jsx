import { useAuthContext } from "@/providers/AuthProvider";
import { Courier, Order, User } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const OrderContext = createContext({});

/**
 * =========================================================
 * DELIVERY FLOW
 * =========================================================
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
 * =========================================================
 * TERMINAL STATES
 * =========================================================
 *
 * Once an order reaches one of these states, it is no longer
 * consuming courier capacity.
 */

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "DISPUTED"];

/**
 * =========================================================
 * CAPACITY LIMITS
 * =========================================================
 */

const MAX_EXPRESS_ORDERS = 1;
const MAX_BATCH_ORDERS = 10;
const MAX_MAXI_ORDERS = 1;

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Determine whether an order is terminal.
 */
const isTerminalOrder = (status) => {
  return TERMINAL_STATUSES.includes(status);
};

/**
 * Determine order category.
 *
 * Examples:
 *
 * MOTO_EXPRESS
 * MICRO_EXPRESS
 * MOTO_BATCH
 * MICRO_BATCH
 * MAXI
 */
const getOrderCategory = (transportationType) => {
  if (!transportationType) return null;

  const type = transportationType.toUpperCase();

  if (type === "MAXI") {
    return "MAXI";
  }

  if (type.includes("EXPRESS")) {
    return "EXPRESS";
  }

  if (type.includes("BATCH")) {
    return "BATCH";
  }

  return null;
};

/**
 * =========================================================
 * PROVIDER
 * =========================================================
 */

const OrderProvider = ({ children }) => {
  const { dbCourier } = useAuthContext();

  // ========================================================
  // EVIDENCE STATE
  // ========================================================

  const [courierPreTransferPhotos, setCourierPreTransferPhotos] = useState([]);

  const [courierPreTransferVideo, setCourierPreTransferVideo] = useState("");

  const [courierPostLoadingPhotos, setCourierPostLoadingPhotos] = useState([]);

  const [courierPostLoadingVideo, setCourierPostLoadingVideo] = useState("");

  const [dropoffArrivalPhotos, setDropoffArrivalPhotos] = useState([]);

  const [dropoffArrivalVideo, setDropoffArrivalVideo] = useState("");

  const [uploadProgress, setUploadProgress] = useState({
    PRE_TRANSFER: 0,
    POST_LOADING: 0,
    DROPOFF: 0,
  });

  // ========================================================
  // ORDER STATE
  // ========================================================

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================================
  // MAP / LOCATION
  // ========================================================

  const mapRef = useRef(null);

  const [location, setLocation] = useState(null);

  const [totalMins, setTotalMins] = useState(0);
  const [totalKm, setTotalKm] = useState(0);

  const [isCourierclose, setIsCourierClose] = useState(false);

  // ========================================================
  // ACTIVE ORDERS
  // ========================================================

  const [activeOrders, setActiveOrders] = useState([]);

  /**
   * ========================================================
   * DERIVED MAP STATE
   * ========================================================
   */

  const isPickedUp = useMemo(() => {
    return [
      "ACCEPTED",
      "PICKED_UP",
      "IN_TRANSIT",
      "ARRIVED_DROPOFF",
      "UNLOADING",
    ].includes(order?.status);
  }, [order?.status]);

  /**
   * ========================================================
   * CURRENT DELIVERY FLOW
   * ========================================================
   */

  const currentFlow = useMemo(() => {
    if (!order) return [];

    return order.transportationType === "MAXI"
      ? DELIVERY_FLOW.MAXI
      : DELIVERY_FLOW.DEFAULT;
  }, [order]);

  /**
   * ========================================================
   * FETCH ORDER
   * ========================================================
   */

  const fetchOrder = async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const foundOrder = await DataStore.query(Order, id);

      if (!foundOrder) {
        console.log("❌ Order not found:", id);
        setOrder(null);
        return;
      }

      setOrder(foundOrder);

      if (foundOrder.userID) {
        const foundUser = await DataStore.query(User, foundOrder.userID);

        setUser(foundUser);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("❌ Error fetching order:", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ========================================================
   * RELEASE COURIER CAPACITY
   * ========================================================
   *
   * IMPORTANT:
   *
   * This function is only called when an order reaches a
   * terminal state.
   *
   * DELIVERED
   * CANCELLED
   * DISPUTED
   *
   * Capacity is released according to the transportation
   * category.
   *
   * EXPRESS:
   * currentExpressCount - 1
   *
   * BATCH:
   * currentBatchCount - 1
   *
   * MAXI:
   * currentMaxiCount - 1
   *
   * We NEVER allow the counters to go below zero.
   */

  const releaseCourierCapacity = async (completedOrder) => {
    try {
      if (!completedOrder) {
        console.log("⚠️ releaseCourierCapacity called without order");
        return false;
      }

      if (!completedOrder.assignedCourierId) {
        console.log("ℹ️ No assigned courier. Nothing to release.");

        return true;
      }

      const courierId = completedOrder.assignedCourierId;

      const category = getOrderCategory(completedOrder.transportationType);

      console.log("🔓 Releasing courier capacity:", {
        orderId: completedOrder.id,
        courierId,
        transportationType: completedOrder.transportationType,
        category,
        status: completedOrder.status,
      });

      const courier = await DataStore.query(Courier, courierId);

      if (!courier) {
        console.error("❌ Courier not found:", courierId);

        return false;
      }

      /**
       * EXPRESS
       */

      if (category === "EXPRESS") {
        const current = courier.currentExpressCount || 0;

        const next = Math.max(0, current - 1);

        console.log("📦 EXPRESS capacity:", {
          courierId,
          before: current,
          after: next,
        });

        await DataStore.save(
          Courier.copyOf(courier, (c) => {
            c.currentExpressCount = next;
          }),
        );

        return true;
      }

      /**
       * BATCH
       */

      if (category === "BATCH") {
        const current = courier.currentBatchCount || 0;

        const next = Math.max(0, current - 1);

        console.log("📦 BATCH capacity:", {
          courierId,
          before: current,
          after: next,
        });

        await DataStore.save(
          Courier.copyOf(courier, (c) => {
            c.currentBatchCount = next;

            /**
             * If no batch orders remain, clear the
             * batch assignment timestamp.
             */
            if (next === 0) {
              c.lastBatchAssignedAt = null;
            }
          }),
        );

        return true;
      }

      /**
       * MAXI
       */

      if (category === "MAXI") {
        const current = courier.currentMaxiCount || 0;

        const next = Math.max(0, current - 1);

        console.log("🚚 MAXI capacity:", {
          courierId,
          before: current,
          after: next,
        });

        await DataStore.save(
          Courier.copyOf(courier, (c) => {
            c.currentMaxiCount = next;
          }),
        );

        return true;
      }

      /**
       * UNKNOWN TRANSPORTATION TYPE
       */

      console.log(
        "⚠️ Unknown transportation type. No capacity released:",
        completedOrder.transportationType,
      );

      return false;
    } catch (error) {
      console.error("❌ Failed to release courier capacity:", error);

      return false;
    }
  };

  /**
   * ========================================================
   * REALTIME ORDER OBSERVER
   * ========================================================
   */

  useEffect(() => {
    if (!order?.id) return;

    const sub = DataStore.observe(Order, order.id).subscribe(
      ({ opType, element }) => {
        if (opType === "UPDATE") {
          setOrder(element);

          /**
           * If order becomes terminal, remove it
           * from active orders immediately.
           */
          if (isTerminalOrder(element.status)) {
            setActiveOrders((prev) => prev.filter((o) => o.id !== element.id));
          }
        }
      },
    );

    return () => sub.unsubscribe();
  }, [order?.id]);

  /**
   * ========================================================
   * UPDATE ORDER STATUS
   * ========================================================
   */

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const current = await DataStore.query(Order, orderId);

      if (!current) {
        console.error("❌ Order not found:", orderId);

        return false;
      }

      /**
       * ====================================================
       * TERMINAL ORDER PROTECTION
       * ====================================================
       */

      if (isTerminalOrder(current.status)) {
        console.log("❌ Order already terminal:", current.status);

        return false;
      }

      const now = new Date().toISOString();

      /**
       * ====================================================
       * CANCEL / DISPUTE
       * ====================================================
       *
       * These can happen from any active state.
       */

      if (newStatus === "CANCELLED" || newStatus === "DISPUTED") {
        const updated = await DataStore.save(
          Order.copyOf(current, (u) => {
            u.status = newStatus;
          }),
        );

        /**
         * Release courier capacity.
         */
        await releaseCourierCapacity(updated);

        /**
         * Update local state.
         */
        setOrder(updated);

        setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));

        return true;
      }

      /**
       * ====================================================
       * NORMAL DELIVERY FLOW
       * ====================================================
       */

      const flow =
        current.transportationType === "MAXI"
          ? DELIVERY_FLOW.MAXI
          : DELIVERY_FLOW.DEFAULT;

      const currentIndex = flow.indexOf(current.status);

      if (currentIndex === -1) {
        console.log("❌ Status not in flow:", current.status);

        return false;
      }

      const nextStatus = flow[currentIndex + 1];

      /**
       * Make sure the courier cannot skip a step.
       */

      if (newStatus !== nextStatus) {
        console.log("❌ Invalid transition:", {
          current: current.status,
          requested: newStatus,
          expected: nextStatus,
        });

        return false;
      }

      /**
       * ====================================================
       * SAVE STATUS
       * ====================================================
       */

      const updated = await DataStore.save(
        Order.copyOf(current, (u) => {
          u.status = newStatus;

          if (newStatus === "ACCEPTED") {
            u.acceptedAt = now;
          }

          if (newStatus === "ARRIVED_PICKUP") {
            u.arrivedPickupAt = now;
          }

          if (newStatus === "LOADING") {
            u.loadingStartedAt = now;
          }

          if (newStatus === "PICKED_UP") {
            u.tripStartedAt = now;
          }

          if (newStatus === "ARRIVED_DROPOFF") {
            u.arrivedDropoffAt = now;
          }

          if (newStatus === "DELIVERED") {
            u.unloadingCompletedAt = now;
          }
        }),
      );

      /**
       * ====================================================
       * DELIVERED
       * ====================================================
       *
       * This is the important part.
       *
       * Once an order becomes DELIVERED, release the
       * courier's capacity.
       */

      if (newStatus === "DELIVERED") {
        console.log("✅ ORDER DELIVERED:", updated.id);

        await releaseCourierCapacity(updated);

        setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        /**
         * Keep active order in local state.
         */

        setActiveOrders((prev) => {
          const exists = prev.some((o) => o.id === updated.id);

          if (exists) {
            return prev.map((o) => (o.id === updated.id ? updated : o));
          }

          return [...prev, updated];
        });
      }

      setOrder(updated);

      return true;
    } catch (e) {
      console.error("❌ Status update error:", e);

      return false;
    }
  };

  /**
   * ========================================================
   * COMPLETE ORDER
   * ========================================================
   *
   * This is used when the courier reaches the final
   * completion action.
   *
   * IMPORTANT:
   *
   * It uses the SAME releaseCourierCapacity()
   * function as updateOrderStatus().
   */

  const completeOrder = async (orderId) => {
    try {
      const current = await DataStore.query(Order, orderId);

      if (!current) {
        console.error("❌ Order not found:", orderId);

        return false;
      }

      /**
       * Already terminal.
       */

      if (isTerminalOrder(current.status)) {
        console.log("❌ Already completed/cancelled:", current.status);

        return false;
      }

      /**
       * Determine correct flow.
       */

      const flow =
        current.transportationType === "MAXI"
          ? DELIVERY_FLOW.MAXI
          : DELIVERY_FLOW.DEFAULT;

      const beforeLastStep = flow[flow.length - 2];

      const lastStep = flow[flow.length - 1];

      /**
       * Only allow completion from the step immediately
       * before DELIVERED.
       */

      if (current.status !== beforeLastStep) {
        console.log("❌ Cannot complete order.");

        console.log("CURRENT:", current.status);

        console.log("EXPECTED:", beforeLastStep);

        return false;
      }

      const now = new Date().toISOString();

      /**
       * Save DELIVERED.
       */

      const updated = await DataStore.save(
        Order.copyOf(current, (u) => {
          u.status = lastStep;
          u.unloadingCompletedAt = now;
        }),
      );

      console.log("✅ Order completed:", {
        orderId: updated.id,
        transportationType: updated.transportationType,
        status: updated.status,
      });

      /**
       * ====================================================
       * RELEASE CAPACITY
       * ====================================================
       */

      await releaseCourierCapacity(updated);

      /**
       * Remove from active orders.
       */

      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));

      setOrder(updated);

      return true;
    } catch (e) {
      console.error("❌ Complete error:", e);

      return false;
    }
  };

  /**
   * ========================================================
   * FETCH ACTIVE ORDERS
   * ========================================================
   */

  useEffect(() => {
    if (!dbCourier?.id) {
      setActiveOrders([]);
      return;
    }

    const fetchActiveOrders = async () => {
      try {
        const orders = await DataStore.query(Order, (o) =>
          o.assignedCourierId.eq(dbCourier.id),
        );

        /**
         * Only active orders.
         *
         * DELIVERED
         * CANCELLED
         * DISPUTED
         *
         * are excluded.
         */

        const active = orders.filter((o) => !isTerminalOrder(o.status));

        console.log(
          "📦 Active courier orders:",
          active.map((o) => ({
            id: o.id,
            transportationType: o.transportationType,
            status: o.status,
          })),
        );

        setActiveOrders(active);
      } catch (e) {
        console.error("❌ Failed to fetch active orders:", e);
      }
    };

    fetchActiveOrders();
  }, [dbCourier?.id]);

  /**
   * ========================================================
   * REALTIME ACTIVE ORDER REFRESH
   * ========================================================
   *
   * Watch all Order changes belonging to this courier.
   *
   * This ensures that when an order changes to DELIVERED,
   * the activeOrders list immediately removes it.
   */

  useEffect(() => {
    if (!dbCourier?.id) return;

    const sub = DataStore.observe(Order).subscribe(
      async ({ opType, element }) => {
        if (element.assignedCourierId !== dbCourier.id) {
          return;
        }

        /**
         * Terminal → remove.
         */

        if (isTerminalOrder(element.status)) {
          setActiveOrders((prev) => prev.filter((o) => o.id !== element.id));

          return;
        }

        /**
         * Active → insert/update.
         */

        setActiveOrders((prev) => {
          const exists = prev.some((o) => o.id === element.id);

          if (exists) {
            return prev.map((o) => (o.id === element.id ? element : o));
          }

          return [...prev, element];
        });
      },
    );

    return () => sub.unsubscribe();
  }, [dbCourier?.id]);

  /**
   * ========================================================
   * PROVIDER
   * ========================================================
   */

  return (
    <OrderContext.Provider
      value={{
        // ==================================================
        // EVIDENCE
        // ==================================================

        courierPreTransferPhotos,
        setCourierPreTransferPhotos,

        courierPreTransferVideo,
        setCourierPreTransferVideo,

        courierPostLoadingPhotos,
        setCourierPostLoadingPhotos,

        courierPostLoadingVideo,
        setCourierPostLoadingVideo,

        dropoffArrivalPhotos,
        setDropoffArrivalPhotos,

        dropoffArrivalVideo,
        setDropoffArrivalVideo,

        uploadProgress,
        setUploadProgress,

        // ==================================================
        // ORDER
        // ==================================================

        order,
        user,
        loading,

        fetchOrder,

        updateOrderStatus,

        completeOrder,

        activeOrders,

        // ==================================================
        // MAP
        // ==================================================

        isPickedUp,
        currentFlow,

        mapRef,

        location,
        setLocation,

        totalMins,
        setTotalMins,

        totalKm,
        setTotalKm,

        isCourierclose,
        setIsCourierClose,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;

export const useOrderContext = () => useContext(OrderContext);
