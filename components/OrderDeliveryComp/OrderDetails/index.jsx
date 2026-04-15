import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";


/**
 * 📊 GET FLOW (NO DUPLICATION)
 */
const getSteps = (order) => {
  if (order?.transportationType === "MAXI") {
    return [
      "ACCEPTED",
      "ARRIVED_PICKUP",
      "LOADING",
      "PICKED_UP",
      "IN_TRANSIT",
      "ARRIVED_DROPOFF",
      "UNLOADING",
      "DELIVERED",
    ];
  }

  return [
    "ACCEPTED",
    "ARRIVED_PICKUP",
    "PICKED_UP",
    "IN_TRANSIT",
    "ARRIVED_DROPOFF",
    "DELIVERED",
  ];
};

/**
 * 🧠 LABEL
 */
const formatStep = (step) => {
  switch (step) {
    case "ARRIVED_PICKUP":
      return "AT PICKUP";
    case "ARRIVED_DROPOFF":
      return "ARRIVED";
    case "IN_TRANSIT":
      return "TRANSIT";
    case "PICKED_UP":
      return "PICKED";
    default:
      return step.split("_")[0];
  }
};

const OrderDetails = ({
  onButtonPressed,
  isButtonDisabled,
  buttonTitle,
  deliveryPickedUp,
  order,
  user,
  totalMins,
  loading,
}) => {
  const [verificationCode, setVerificationCode] = useState("");

  const STATUS_STEPS = useMemo(() => getSteps(order), [order]);

  const currentStep = useMemo(() => {
    if (!order?.status) return -1;

    if (order.status === "DELIVERED") {
      return STATUS_STEPS.length - 1;
    }

    return STATUS_STEPS.indexOf(order.status);
  }, [order?.status, STATUS_STEPS]);

  /**
   * 📋 COPY
   */
  const copyToClipboard = async (text) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Number copied");
  };

  /**
   * 🔐 VERIFY
   */
  const handleFinalDelivery = () => {
    if (order?.status === "ARRIVED_DROPOFF") {
      if (!verificationCode) {
        Alert.alert("Error", "Enter verification code");
        return;
      }

      if (verificationCode !== order?.deliveryVerificationCode) {
        Alert.alert("Invalid Code", "Wrong verification code");
        return;
      }
    }

    onButtonPressed();
  };

  return (
    <View style={styles.container}>
      {/* PROGRESS */}
      <View style={styles.progressContainer}>
        {STATUS_STEPS.map((step, index) => (
          <View key={index} style={styles.progressItem}>
            <View
              style={[
                styles.circle,
                index <= currentStep && styles.activeCircle,
              ]}
            />
            <Text style={styles.progressText}>{formatStep(step)}</Text>
          </View>
        ))}
      </View>

      {/* RECIPIENT */}
      {deliveryPickedUp && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recipient</Text>

          <Text style={styles.text}>{order?.recipientName}</Text>

          <TouchableOpacity
            onPress={() => copyToClipboard(order?.recipientNumber)}
          >
            <Text style={styles.text}>{order?.recipientNumber}</Text>
          </TouchableOpacity>

          <Text style={styles.text}>{order?.destinationAddress}</Text>
        </View>
      )}

      {/* SENDER */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sender</Text>

        <Text style={styles.text}>{user?.firstName}</Text>

        <TouchableOpacity onPress={() => copyToClipboard(user?.phoneNumber)}>
          <Text style={styles.text}>{user?.phoneNumber}</Text>
        </TouchableOpacity>

        <Text style={styles.text}>{order?.transportationType}</Text>
      </View>

      {/* CODE INPUT */}
      {order?.status === "ARRIVED_DROPOFF" && (
        <View style={styles.card}>
          <TextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter code"
            style={styles.input}
            keyboardType="number-pad"
          />
        </View>
      )}

      {/* BUTTON */}
      <TouchableOpacity
        onPress={handleFinalDelivery}
        disabled={isButtonDisabled}
        style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{buttonTitle}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default OrderDetails;
