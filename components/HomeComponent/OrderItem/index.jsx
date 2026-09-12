import { Offer } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import styles from "./styles";

const OrderItem = ({ order, onRemoveOrder, onSelect }) => {
  const [latestOffer, setLatestOffer] = useState(null);

  // ============================================================
  // DISPLAY PRICE
  // ============================================================

  const displayPrice =
    order?.courierEarnings ?? latestOffer?.amount ?? order?.initialOfferPrice;

  // ============================================================
  // FORMAT TRANSPORTATION TYPE
  // ============================================================

  const formatType = (type) => {
    if (!type) return "";

    return type.replace(/_/g, " ").toUpperCase();
  };

  // ============================================================
  // FETCH LATEST OFFER
  //
  // This is primarily relevant to MAXI orders.
  // ============================================================

  useEffect(() => {
    if (!order?.id) {
      return;
    }

    let mounted = true;

    const fetchLatestOffer = async () => {
      try {
        const result = await DataStore.query(Offer, (o) =>
          o.orderID.eq(order.id),
        );

        if (!mounted) {
          return;
        }

        if (result.length > 0) {
          const sorted = [...result].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );

          setLatestOffer(sorted[0]);
        } else {
          setLatestOffer(null);
        }
      } catch (error) {
        console.error("Error fetching latest offer:", error);
      }
    };

    fetchLatestOffer();

    // ==========================================================
    // REAL-TIME OFFER UPDATES
    // ==========================================================

    const subscription = DataStore.observe(Offer).subscribe((msg) => {
      if (!mounted) {
        return;
      }

      if (msg.element?.orderID === order.id) {
        fetchLatestOffer();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [order?.id]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity style={styles.card} onPress={() => onSelect(order)}>
        {/* ================================================== */}
        {/* TOP */}
        {/* ================================================== */}

        <View style={styles.headerRow}>
          <Text style={styles.type}>
            {formatType(order.transportationType)}
          </Text>

          <Text style={styles.price}>
            ₦{displayPrice?.toLocaleString() || "---"}
          </Text>
        </View>

        {/* ================================================== */}
        {/* ADDRESSES */}
        {/* ================================================== */}

        <View style={styles.addressContainer}>
          <Text style={styles.label}>Pickup</Text>

          <Text style={styles.address}>{order.originAddress}</Text>

          <Text style={styles.label}>Dropoff</Text>

          <Text style={styles.address}>{order.destinationAddress}</Text>
        </View>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <View style={styles.footer}>
          {/* 
            IMPORTANT:
            No local countdown here.

            The backend dispatch system controls the
            offer timeout. The courier app should simply
            reflect the current order state.
          */}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => onRemoveOrder(order.id)}
            >
              <FontAwesome name="times" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OrderItem;
