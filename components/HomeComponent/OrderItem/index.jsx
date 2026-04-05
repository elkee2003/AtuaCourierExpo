import { Offer } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import styles from "./styles";

const OrderItem = ({ order, onRemoveOrder, onSelect }) => {
  const [latestOffer, setLatestOffer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25);

  //   to show different options of available prices
  const displayPrice =
    order?.courierEarnings ?? latestOffer?.amount ?? order?.initialOfferPrice;

  //   To format the transportationType
  const formatType = (type) => {
    if (!type) return "";

    return type.replace(/_/g, " ").toUpperCase();
  };

  //   const goToOrderDelivery = () => {
  //     router.push(`/orders/${order.id}`);
  //   };

  //   to fetch lastest offer price
  useEffect(() => {
    const fetchLatestOffer = async () => {
      const result = await DataStore.query(Offer, (o) =>
        o.orderID.eq(order.id),
      );

      if (result.length > 0) {
        const sorted = result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setLatestOffer(sorted[0]);
      }
    };

    fetchLatestOffer();

    const sub = DataStore.observe(Offer).subscribe((msg) => {
      if (msg.element.orderID === order.id) {
        fetchLatestOffer();
      }
    });

    return () => sub.unsubscribe();
  }, [order.id]);

  // countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onRemoveOrder(order.id);
    }
  }, [timeLeft]);

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
        style={styles.card}
        // onPress={goToOrderDelivery}
        onPress={() => onSelect(order)}
      >
        {/* TOP */}
        <View style={styles.headerRow}>
          <Text style={styles.type}>
            {formatType(order.transportationType)}
          </Text>
          <Text style={styles.price}>
            ₦{displayPrice?.toLocaleString() || "---"}
          </Text>
        </View>

        {/* ADDRESSES */}
        <View style={styles.addressContainer}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.address}>{order.originAddress}</Text>

          <Text style={styles.label}>Dropoff</Text>
          <Text style={styles.address}>{order.destinationAddress}</Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.timer}>⏱ {timeLeft}s</Text>

          {/* Remove or Accept shouldn't be here */}
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
