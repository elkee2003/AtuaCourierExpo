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
 * 🚀 SINGLE SOURCE OF TRUTH
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
 * ❗ TERMINAL STATES (NEW)
 */
const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "DISPUTED"];

const OrderProvider = ({ children }) => {
  const { dbCourier } = useAuthContext();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);

  const [totalMins, setTotalMins] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [isCourierclose, setIsCourierClose] = useState(false);

  const [activeOrders, setActiveOrders] = useState([]);

  /**
   * ✅ DERIVED STATE
   */
  const isPickedUp = useMemo(() => {
    return ["PICKED_UP", "IN_TRANSIT", "ARRIVED_DROPOFF", "UNLOADING"].includes(
      order?.status,
    );
  }, [order?.status]);

  /**
   * ✅ CURRENT FLOW
   */
  const currentFlow = useMemo(() => {
    if (!order) return [];
    return order.transportationType === "MAXI"
      ? DELIVERY_FLOW.MAXI
      : DELIVERY_FLOW.DEFAULT;
  }, [order]);

  /**
   * =========================
   * 🔹 FETCH ORDER
   * =========================
   */
  const fetchOrder = async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const foundOrder = await DataStore.query(Order, id);
      if (!foundOrder) return;

      setOrder(foundOrder);

      if (foundOrder.userID) {
        const foundUser = await DataStore.query(User, foundOrder.userID);
        setUser(foundUser);
      }
    } catch (e) {
      console.error("Error fetching order:", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * =========================
   * 🔹 REALTIME
   * =========================
   */
  useEffect(() => {
    if (!order?.id) return;

    const sub = DataStore.observe(Order, order.id).subscribe(
      ({ opType, element }) => {
        if (opType === "UPDATE") {
          setOrder(element);
        }
      },
    );

    return () => sub.unsubscribe();
  }, [order?.id]);

  /**
   * =========================
   * 🔥 STRICT FLOW UPDATE + CANCEL/DISPUTE SUPPORT
   * =========================
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const current = await DataStore.query(Order, orderId);
      if (!current) return false;

      // ❗ If already terminal → block everything
      if (TERMINAL_STATUSES.includes(current.status)) {
        console.log("❌ Order already finished:", current.status);
        return false;
      }

      const now = new Date().toISOString();

      /**
       * ✅ ALLOW CANCEL / DISPUTE FROM ANY STATE
       */
      if (newStatus === "CANCELLED" || newStatus === "DISPUTED") {
        const updated = await DataStore.save(
          Order.copyOf(current, (u) => {
            u.status = newStatus;
          }),
        );

        setOrder(updated);
        setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));

        return true;
      }

      /**
       * 🔒 NORMAL FLOW (STRICT)
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

      if (newStatus !== nextStatus) {
        console.log("❌ Invalid transition:", current.status, "→", newStatus);
        return false;
      }

      const updated = await DataStore.save(
        Order.copyOf(current, (u) => {
          u.status = newStatus;

          if (newStatus === "ACCEPTED") u.acceptedAt = now;
          if (newStatus === "ARRIVED_PICKUP") u.arrivedPickupAt = now;
          if (newStatus === "LOADING") u.loadingStartedAt = now;
          if (newStatus === "PICKED_UP") u.tripStartedAt = now;
          if (newStatus === "ARRIVED_DROPOFF") u.arrivedDropoffAt = now;
          if (newStatus === "DELIVERED") u.unloadingCompletedAt = now;
        }),
      );

      setOrder(updated);
      return true;
    } catch (e) {
      console.error("Status update error:", e);
      return false;
    }
  };

  /**
   * =========================
   * 🔹 COMPLETE (RESPECT FLOW)
   * =========================
   */
  const completeOrder = async (orderId) => {
    try {
      const current = await DataStore.query(Order, orderId);
      if (!current) return false;

      if (TERMINAL_STATUSES.includes(current.status)) {
        console.log("❌ Already completed/cancelled");
        return false;
      }

      const flow =
        current.transportationType === "MAXI"
          ? DELIVERY_FLOW.MAXI
          : DELIVERY_FLOW.DEFAULT;

      const lastStep = flow[flow.length - 1];

      if (current.status !== lastStep) {
        console.log("❌ Cannot complete before final step");
        return false;
      }

      const updated = await DataStore.save(
        Order.copyOf(current, (u) => {
          u.status = "DELIVERED";
          u.unloadingCompletedAt = new Date().toISOString();
        }),
      );

      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
      setOrder(updated);

      if (current.transportationType === "MAXI" && dbCourier?.id) {
        const courier = await DataStore.query(Courier, dbCourier.id);

        if (courier) {
          await DataStore.save(
            Courier.copyOf(courier, (c) => {
              c.currentMaxiCount = 0;
            }),
          );
        }
      }

      return true;
    } catch (e) {
      console.error("Complete error:", e);
      return false;
    }
  };

  /**
   * =========================
   * 🔹 ACTIVE ORDERS
   * =========================
   */
  useEffect(() => {
    if (!dbCourier?.id) return;

    const fetchActiveOrders = async () => {
      try {
        const orders = await DataStore.query(Order, (o) =>
          o.assignedCourierId.eq(dbCourier.id),
        );

        setActiveOrders(
          orders.filter((o) => !TERMINAL_STATUSES.includes(o.status)),
        );
      } catch (e) {
        console.error(e);
      }
    };

    fetchActiveOrders();
  }, [dbCourier?.id]);

  return (
    <OrderContext.Provider
      value={{
        order,
        user,
        loading,

        fetchOrder,
        updateOrderStatus,
        completeOrder,

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

        activeOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
export const useOrderContext = () => useContext(OrderContext);
