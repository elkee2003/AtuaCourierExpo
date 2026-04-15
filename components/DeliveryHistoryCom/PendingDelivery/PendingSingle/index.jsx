import { Offer } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";
import styles from "./styles";

/**
 * 🎨 STATUS COLORS
 */
const STATUS_COLORS = {
  ACCEPTED: "#2563eb",
  ARRIVED_PICKUP: "#f59e0b",
  LOADING: "#f97316",
  PICKED_UP: "#10b981",
  IN_TRANSIT: "#6366f1",
  ARRIVED_DROPOFF: "#ec4899",
  UNLOADING: "#ef4444",
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
 * 🧠 FORMATTERS
 */
const formatStatus = (status) => status?.replace(/_/g, " ");

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

const PendingDeliverySingle = ({ item }) => {
  const [offers, setOffers] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded((prev) => !prev);

  const goToOrder = () => {
    router.push(`/orders/${item.id}`);
  };

  /**
   * 📦 FETCH OFFERS
   */
  useEffect(() => {
    const fetchOffers = async () => {
      const result = await DataStore.query(Offer, (o) => o.orderID.eq(item.id));
      setOffers(result);
    };

    fetchOffers();

    const sub = DataStore.observe(Offer).subscribe((msg) => {
      if (msg.element.orderID === item.id) {
        fetchOffers();
      }
    });

    return () => sub.unsubscribe();
  }, []);

  /**
   * 💰 PRICE LOGIC
   */
  const latestOffer = [...offers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )[0];

  const isMaxi = item?.transportationType === "MAXI";

  const displayPrice = isMaxi
    ? (latestOffer?.amount ?? item?.initialOfferPrice)
    : item?.courierEarnings;

  const price = Number(displayPrice || 0).toLocaleString();

  /**
   * 🚀 DYNAMIC STATUS FLOW
   */
  const STATUS_STEPS = isMaxi ? MAXI_STEPS : NORMAL_STEPS;

  const currentStep =
    item.status === "DELIVERED"
      ? STATUS_STEPS.length - 1
      : STATUS_STEPS.indexOf(item.status);

  /**
   * 📞 CALL + COPY
   */
  const handleCall = () => {
    if (!item.recipientNumber) return;
    Linking.openURL(`tel:${item.recipientNumber}`);
  };

  const handleLongPressNumber = () => {
    if (!item.recipientNumber) return;
    Clipboard.setStringAsync(item.recipientNumber);
    Alert.alert("Copied", "Number copied to clipboard");
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.card}
      onPress={toggleExpand}
    >
      {/* HEADER */}
      <View style={styles.rowBetween}>
        <Text style={styles.price}>₦{price}</Text>

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

      {/* ROUTE */}
      <View style={styles.routeContainer}>
        <Text numberOfLines={1} style={styles.address}>
          {item.originAddress}
        </Text>
        <Text numberOfLines={1} style={styles.address}>
          → {item.destinationAddress}
        </Text>
      </View>

      <Text style={styles.expandHint}>
        {expanded ? "Tap to collapse ▲" : "Tap to expand ▼"}
      </Text>

      {/* 🔽 EXPANDED */}
      <Collapsible collapsed={!expanded}>
        <View style={styles.expandedContent}>
          {/* FULL ROUTE */}
          <View style={styles.routeContainer}>
            <Text style={styles.label}>FROM</Text>
            <Text style={styles.address}>{item.originAddress}</Text>

            <Text style={[styles.label, { marginTop: 6 }]}>TO</Text>
            <Text style={styles.address}>{item.destinationAddress}</Text>
          </View>

          {/* 📊 PROGRESS BAR */}
          <View style={styles.progressContainer}>
            {STATUS_STEPS.map((step, index) => (
              <View key={index} style={styles.progressItem}>
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor:
                        index <= currentStep ? "#2563eb" : "#E5E7EB",
                    },
                  ]}
                />
                <Text style={styles.progressText}>{getStepLabel(step)}</Text>
              </View>
            ))}
          </View>

          {/* 🚚 VEHICLE (ONLY MAXI) */}
          {isMaxi && (
            <View style={styles.rowBetween}>
              <Text style={styles.meta}>🚚 {item.transportationType}</Text>
              <Text style={styles.meta}>📦 {item.vehicleClass}</Text>
            </View>
          )}

          {/* 👤 RECIPIENT */}
          <View style={styles.recipientRow}>
            <Text style={styles.label}>Recipient</Text>

            <View style={styles.phoneRow}>
              <TouchableOpacity onPress={handleCall}>
                <Text style={styles.callIcon}>📞</Text>
              </TouchableOpacity>

              <TouchableOpacity onLongPress={handleLongPressNumber}>
                <Text style={styles.recipientText}>
                  {item.recipientNumber || "N/A"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 🚀 ACTION */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={(e) => {
              e.stopPropagation();
              goToOrder();
            }}
          >
            <Text style={styles.primaryText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>
    </TouchableOpacity>
  );
};

export default PendingDeliverySingle;
