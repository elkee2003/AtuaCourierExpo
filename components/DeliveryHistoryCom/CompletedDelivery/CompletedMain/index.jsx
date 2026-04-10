import { useAuthContext } from "@/providers/AuthProvider";
import { Order } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import CompletedDeliverySingle from "../CompletedSingle";
import styles from "./styles";

const COMPLETED_STATUSES = [
  "DELIVERED",
  "HANDOVER_TO_LOGISTICS",
  "CANCELLED",
  "DISPUTED",
];

const CompletedDeliveryMain = () => {
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
        .filter((order) => COMPLETED_STATUSES.includes(order.status))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setOrders(filteredOrders);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const sub = DataStore.observe(Order).subscribe(() => {
      fetchOrders();
    });

    return () => sub.unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Completed Orders</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Completed Orders</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CompletedDeliverySingle item={item} />}
        />
      )}
    </View>
  );
};

export default CompletedDeliveryMain;
