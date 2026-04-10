import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";
import styles from "./styles";

const PendingDeliverySingle = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const goToTracking = () => {
    router.push(`/screens/orderTrackingScreen/${item.id}`);
  };

  const goToDetails = () => {
    router.push(`/screens/orderdetails/${item.id}`);
  };

  const getStatusColor = () => {
    switch (item.status) {
      case "IN_TRANSIT":
        return styles.statusBlue;
      case "ARRIVED_PICKUP":
      case "ARRIVED_DROPOFF":
        return styles.statusPurple;
      case "LOADING":
      case "UNLOADING":
        return styles.statusOrange;
      default:
        return styles.statusGray;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.card}
      onPress={toggleExpand}
    >
      {/* Header */}
      <View style={styles.topRow}>
        <Text style={styles.date}>{item?.createdAt?.substring(0, 10)}</Text>

        <View style={[styles.statusBadge, getStatusColor()]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {/* COLLAPSED VIEW */}
      <Text style={styles.address} numberOfLines={1}>
        📍 {item.originAddress}
      </Text>

      <Text style={styles.address} numberOfLines={1}>
        📦 {item.destinationAddress}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={styles.price}>₦{item?.totalPrice?.toLocaleString()}</Text>

        <Text style={styles.vehicle}>{item.vehicleClass}</Text>
      </View>

      <Text style={styles.expandHint}>
        {expanded ? "Tap to collapse ▲" : "Tap to expand ▼"}
      </Text>

      {/* EXPANDED */}
      <Collapsible collapsed={!expanded}>
        <View style={styles.expanded}>
          <Text style={styles.details}>{item.orderDetails}</Text>

          <View style={styles.divider} />

          {/* BUTTONS */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={(e) => {
                e.stopPropagation();
                goToTracking();
              }}
            >
              <Text style={styles.primaryText}>Track</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={(e) => {
                e.stopPropagation();
                goToDetails();
              }}
            >
              <Text style={styles.secondaryText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Collapsible>
    </TouchableOpacity>
  );
};

export default PendingDeliverySingle;
