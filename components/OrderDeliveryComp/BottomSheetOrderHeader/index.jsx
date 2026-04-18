import { useOrderContext } from "@/providers/OrderProvider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import styles from "./styles";

const formatName = (name) => {
  if (!name) return "customer";
  return name.length > 12 ? name.substring(0, 12) + "..." : name;
};

const getStatusText = (status, senderName, recipientName) => {
  const sender = formatName(senderName);
  const recipient = formatName(recipientName);

  switch (status) {
    case "ACCEPTED":
    case "ARRIVED_PICKUP":
      return `Heading to ${sender}`;
    case "LOADING":
      return `Loading items from ${sender}`;
    case "PICKED_UP":
    case "IN_TRANSIT":
      return `Delivering to ${recipient}`;
    case "ARRIVED_DROPOFF":
      return `Arrived for ${recipient}`;
    case "UNLOADING":
      return `Unloading for ${recipient}`;
    case "DELIVERED":
      return `Delivered to ${recipient}`;
    case "CANCELLED":
      return "Delivery Cancelled";
    case "DISPUTED":
      return "Delivery Under Review";
    default:
      return "Processing Delivery";
  }
};

const BottomSheetHeader = () => {
  const { totalMins, totalKm, user, order } = useOrderContext();

  const senderName = user?.firstName;
  const recipientName = order?.recipientName;

  const displayName =
    order?.status === "DELIVERED"
      ? recipientName || "Recipient"
      : senderName || "Sender";

  const transportType = order?.transportationType || "STANDARD";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f2027", "#203a43", "#2c5364"]}
        style={styles.card}
      >
        {/* 🔝 TOP ROW */}
        <View style={styles.topRow}>
          {/* TIME */}
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{totalMins?.toFixed(0) || 0}</Text>
            <Text style={styles.metricLabel}>mins</Text>
          </View>

          {/* CENTER PROFILE */}
          <View style={styles.centerBlock}>
            <View style={styles.avatarWrapper}>
              <FontAwesome name="user" size={18} color="#fff" />
            </View>

            {/* 🚚 TRANSPORT BADGE */}
            <View style={styles.transportBadge}>
              <Text style={styles.transportText}>{transportType}</Text>
            </View>
          </View>

          {/* DISTANCE */}
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{totalKm?.toFixed(1) || 0}</Text>
            <Text style={styles.metricLabel}>km</Text>
          </View>
        </View>

        {/* 📦 STATUS */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {getStatusText(order?.status, senderName, recipientName)}
          </Text>

          <Text style={styles.userName} numberOfLines={1}>
            {formatName(displayName)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default BottomSheetHeader;
