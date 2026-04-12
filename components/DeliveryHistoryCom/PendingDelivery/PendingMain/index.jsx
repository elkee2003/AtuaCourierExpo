import { useAuthContext } from "@/providers/AuthProvider";
import { Order } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PendingDeliverySingle from "../PendingSingle";
import styles from "./styles";

const ACTIVE_STATUSES = [
  "ACCEPTED",
  "ARRIVED_PICKUP",
  "LOADING",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DROPOFF",
  "UNLOADING",
];

const PendingDeliveryMain = () => {
  const { dbCourier } = useAuthContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!dbCourier?.id) return;

    setLoading(true);

    try {
      const fetchedOrders = await DataStore.query(Order, (o) =>
        o.assignedCourierId.eq(dbCourier.id),
      );

      const filteredOrders = fetchedOrders
        .filter((order) => ACTIVE_STATUSES.includes(order.status))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setOrders(filteredOrders);
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const subscription = DataStore.observe(Order).subscribe(() => {
      fetchOrders();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.header}>Active Orders</Text>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Active Orders</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PendingDeliverySingle item={item} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default PendingDeliveryMain;
