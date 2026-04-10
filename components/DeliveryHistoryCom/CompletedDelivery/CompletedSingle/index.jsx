import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";
import styles from "./styles";

const STATUS_COLORS = {
  DELIVERED: "#10b981",
  HANDOVER_TO_LOGISTICS: "#6366f1",
  CANCELLED: "#ef4444",
  DISPUTED: "#f59e0b",
};

const STATUS_STEPS = [
  "ACCEPTED",
  "ARRIVED_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DROPOFF",
];

const getStepLabel = (status) => {
  switch (status) {
    case "IN_TRANSIT":
      return "IN";
    case "ARRIVED_PICKUP":
    case "ARRIVED_DROPOFF":
      return "ARRIVED";
    default:
      return status.split("_")[0];
  }
};

const formatStatus = (status) => {
  return status?.replace(/_/g, " ");
};

const CompletedDeliverySingle = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const goToOrder = () => {
    router.push(`/orders/${item.id}`);
  };

  const isMaxi = item?.transportationType === "MAXI";

  const displayPrice = isMaxi
    ? (item?.totalPrice ?? item?.currentOfferPrice ?? item?.initialOfferPrice)
    : item?.courierEarnings;

  const price = Number(displayPrice || 0).toLocaleString();

  const currentStep = STATUS_STEPS.indexOf(item.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={toggleExpand}
      activeOpacity={0.95}
    >
      {/* HEADER */}
      <View style={styles.rowBetween}>
        <Text style={styles.price}>₦{price}</Text>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] || "#999" },
          ]}
        >
          <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
        </View>
      </View>

      {/* ROUTE */}
      <View style={styles.routeContainer}>
        <Text style={styles.label}>FROM</Text>
        <Text numberOfLines={1} style={styles.address}>
          {item.originAddress}
        </Text>

        <Text style={[styles.label, { marginTop: 6 }]}>TO</Text>
        <Text numberOfLines={1} style={styles.address}>
          {item.destinationAddress}
        </Text>
      </View>

      {/* PROGRESS */}
      <View style={styles.progressContainer}>
        {STATUS_STEPS.map((step, index) => (
          <View key={index} style={styles.progressItem}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: index <= currentStep ? "#9ca3af" : "#e5e7eb",
                },
              ]}
            />
            <Text style={styles.progressText}>{getStepLabel(step)}</Text>
          </View>
        ))}
      </View>

      {/* HINT */}
      <Text style={styles.expandHint}>
        {expanded ? "Tap to collapse ▲" : "Tap to expand ▼"}
      </Text>

      {/* EXPANDED */}
      <Collapsible collapsed={!expanded}>
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* META */}
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              🚚 {item.transportationType || "N/A"}
            </Text>
            <Text style={styles.meta}>📦 {item.vehicleClass || "N/A"}</Text>
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={(e) => {
              e.stopPropagation();
              goToOrder();
            }}
          >
            <Text style={styles.primaryText}>View Full Details</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>
    </TouchableOpacity>
  );
};

export default CompletedDeliverySingle;
