import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import styles from "./styles";

const OrderItem = ({ order, onAccept, onRemoveOrder, onSelect }) => {
  const [timeLeft, setTimeLeft] = useState(25);

  //   To format the transportationType
  const formatType = (type) => {
    if (!type) return "";

    return type.replace(/_/g, " ").toUpperCase();
  };

  //   const goToOrderDelivery = () => {
  //     router.push(`/orders/${order.id}`);
  //   };

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
      <Pressable
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
            ₦{order?.courierEarnings || order?.initialOfferPrice || "---"}
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

          <View style={styles.actions}>
            <Pressable
              style={styles.declineBtn}
              onPress={() => onRemoveOrder(order.id)}
            >
              <FontAwesome name="times" size={18} color="white" />
            </Pressable>

            <Pressable style={styles.acceptBtn} onPress={() => onAccept(order)}>
              <FontAwesome name="check" size={18} color="white" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default OrderItem;
