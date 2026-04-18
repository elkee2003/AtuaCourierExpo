import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";
import styles from "./styles";

/**
 * 🎨 STATUS COLORS
 */
const STATUS_COLORS = {
  DELIVERED: "#10b981",
  HANDOVER_TO_LOGISTICS: "#6366f1",
  CANCELLED: "#ef4444",
  DISPUTED: "#f59e0b",
};

/**
 * 🚚 STATUS FLOWS
 */
const MAXI_STEPS = [
  "ACCEPTED",
  "ARRIVED_PICKUP",
  "LOADING",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DROPOFF",
  "UNLOADING",
  "DELIVERED",
];

const NORMAL_STEPS = [
  "ACCEPTED",
  "ARRIVED_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DROPOFF",
  "DELIVERED",
];

/**
 * 🧠 HELPERS
 */
const getStepLabel = (status) => {
  switch (status) {
    case "IN_TRANSIT":
      return "TRANSIT";
    case "ARRIVED_PICKUP":
      return "AT PICKUP";
    case "ARRIVED_DROPOFF":
      return "ARRIVED";
    case "PICKED_UP":
      return "PICKED";
    default:
      return status.split("_")[0];
  }
};

const formatStatus = (status) => status?.replace(/_/g, " ");

const CompletedDeliverySingle = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded((prev) => !prev);

  const goToOrder = () => {
    router.push(`/orders/${item.id}`);
  };

  /**
   * 🚚 DELIVERY TYPE
   */
  const isMaxi = item?.transportationType === "MAXI";
  const STATUS_STEPS = isMaxi ? MAXI_STEPS : NORMAL_STEPS;

  /**
   * 💰 PRICE
   */
  const displayPrice = isMaxi
    ? (item?.currentOfferPrice ?? item?.initialOfferPrice)
    : item?.courierEarnings;

  const price = Number(displayPrice || 0).toLocaleString();

  /**
   * ✅ COMPLETION LOGIC
   */
  const isCompleted = item.status === "DELIVERED";

  let currentStep = STATUS_STEPS.indexOf(item.status);

  // Fix -1 issue + completed override
  if (currentStep === -1) currentStep = 0;
  if (isCompleted) currentStep = STATUS_STEPS.length - 1;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={toggleExpand}
      activeOpacity={0.95}
    >
      {/* HEADER */}
      <View style={styles.rowBetween}>
        {/* LEFT SIDE */}
        <View style={styles.headerLeft}>
          <Text style={styles.price}>₦{price}</Text>

          {/* 🚚 TRANSPORT TYPE BADGE */}
          <View style={styles.transportBadge}>
            <Text style={styles.transportText}>{item?.transportationType}</Text>
          </View>
        </View>

        {/* STATUS */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: STATUS_COLORS[item.status] || "#9CA3AF",
            },
          ]}
        >
          <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
        </View>
      </View>

      {/* ROUTE SUMMARY */}
      <View style={styles.routeContainer}>
        <Text numberOfLines={1} style={styles.address}>
          {item.originAddress}
        </Text>
        <Text numberOfLines={1} style={styles.address}>
          → {item.destinationAddress}
        </Text>
      </View>

      {/* 📊 PROGRESS */}
      <View style={styles.progressContainer}>
        {STATUS_STEPS.map((step, index) => (
          <View key={index} style={styles.progressItem}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: isCompleted
                    ? "#10b981" // ✅ ALL GREEN
                    : index <= currentStep
                      ? "#9ca3af"
                      : "#e5e7eb",
                },
              ]}
            />
            <Text
              style={[styles.progressText, isCompleted && styles.completedText]}
            >
              {getStepLabel(step)}
            </Text>
          </View>
        ))}
      </View>

      {/* EXPAND HINT */}
      <Text style={styles.expandHint}>
        {expanded ? "Tap to collapse ▲" : "Tap to expand ▼"}
      </Text>

      {/* 🔽 EXPANDED */}
      <Collapsible collapsed={!expanded}>
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* FULL ROUTE */}
          <View style={styles.routeContainer}>
            <Text style={styles.label}>FROM</Text>
            <Text style={styles.address}>{item.originAddress}</Text>

            <Text style={[styles.label, { marginTop: 6 }]}>TO</Text>
            <Text style={styles.address}>{item.destinationAddress}</Text>
          </View>

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
