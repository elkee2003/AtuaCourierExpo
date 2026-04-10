import { Offer } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";

const STATUS_COLORS = {
  ACCEPTED: "#2563eb",
  ARRIVED_PICKUP: "#f59e0b",
  LOADING: "#f97316",
  PICKED_UP: "#10b981",
  IN_TRANSIT: "#6366f1",
  ARRIVED_DROPOFF: "#ec4899",
  UNLOADING: "#ef4444",
};

const STATUS_STEPS = [
  "ACCEPTED",
  "ARRIVED_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DROPOFF",
];

// 🔥 Short labels
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

const PendingDeliverySingle = ({ item }) => {
  const [offers, setOffers] = useState([]);

  const goToOrder = () => {
    router.push(`/orders/${item.id}`);
  };

  // ✅ FETCH OFFERS (same as OrderSummary)
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

  // ✅ GET LATEST OFFER
  const latestOffer = [...offers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )[0];

  // ✅ CHECK MAXI
  const isMaxi = item?.transportationType === "MAXI";

  // ✅ FINAL PRICE LOGIC (SAME AS OrderSummary)
  const displayPrice = isMaxi
    ? (latestOffer?.amount ?? item?.initialOfferPrice)
    : item?.courierEarnings;

  const price = Number(displayPrice || 0).toLocaleString();

  const currentStep = STATUS_STEPS.indexOf(item.status);

  // 📞 CALL
  const handleCall = () => {
    if (!item.recipientNumber) return;
    Linking.openURL(`tel:${item.recipientNumber}`);
  };

  // 📋 COPY
  const handleLongPressNumber = () => {
    if (!item.recipientNumber) return;

    Clipboard.setStringAsync(item.recipientNumber);

    Alert.alert("Copied", "Number copied to clipboard");
  };

  return (
    <TouchableOpacity style={styles.card} onPress={goToOrder}>
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

      {/* 🔵 PROGRESS */}
      <View style={styles.progressContainer}>
        {STATUS_STEPS.map((step, index) => (
          <View key={index} style={styles.progressItem}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: index <= currentStep ? "#2563eb" : "#ddd",
                },
              ]}
            />
            <Text style={styles.progressText}>{getStepLabel(step)}</Text>
          </View>
        ))}
      </View>

      {/* DETAILS */}
      {item?.transportationType === "MAXI" ? (
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>🚚 {item.transportationType || "N/A"}</Text>
          <Text style={styles.meta}>📦 {item.vehicleClass || "N/A"}</Text>
        </View>
      ) : (
        ""
      )}

      {/* 📞 RECIPIENT */}
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

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerHint}>Tap to view details →</Text>
      </View>
    </TouchableOpacity>
  );
};

export default PendingDeliverySingle;
