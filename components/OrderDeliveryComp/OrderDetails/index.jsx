import { useAuthContext } from "@/providers/AuthProvider";
import { useOrderContext } from "@/providers/OrderProvider";
import {
  CourierPostLoadingUploadStatus,
  CourierPreTransferUploadStatus,
  DropoffUploadStatus,
  Order,
} from "@/src/models";
import { uploadCourierEvidence } from "@/utils/uploadCourierEvidence";
import { DataStore } from "aws-amplify/datastore";
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
import OrderEvidenceUploader from "./OrderEvidenceUploader";
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
  const {
    courierPreTransferPhotos,
    courierPreTransferVideo,
    courierPostLoadingPhotos,
    courierPostLoadingVideo,
    dropoffArrivalPhotos,
    dropoffArrivalVideo,
    updateOrderStatus,
    setUploadProgress,
  } = useOrderContext();

  const { dbCourier } = useAuthContext();
  const [verificationCode, setVerificationCode] = useState("");

  const STATUS_STEPS = useMemo(() => getSteps(order), [order]);

  const currentStep = useMemo(() => {
    if (!order?.status) return -1;

    if (order.status === "DELIVERED") {
      return STATUS_STEPS.length - 1;
    }

    return STATUS_STEPS.indexOf(order.status);
  }, [order?.status, STATUS_STEPS]);

  const nextStatus = useMemo(() => {
    if (!order?.status) return null;

    const index = STATUS_STEPS.indexOf(order.status);
    return STATUS_STEPS[index + 1];
  }, [order?.status, STATUS_STEPS]);

  /**
   * 📦 EVIDENCE VISIBILITY (FIXED)
   */
  const shouldShowUpload = useMemo(() => {
    if (order?.transportationType !== "MAXI") return false;

    return ["ARRIVED_PICKUP", "LOADING", "UNLOADING"].includes(order?.status);
  }, [order?.transportationType, order?.status]);

  /**
   * 📋 COPY
   */
  const copyToClipboard = async (text) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Number copied");
  };

  const handleMainAction = async () => {
    if (!nextStatus) {
      console.log("❌ No next status");
      return;
    }

    /**
     * =========================
     * 🔐 VERIFY CODE (ONLY AT DROPOFF)
     * =========================
     */
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

    /**
     * =========================
     * ✅ UPDATE STATUS FIRST
     * =========================
     */
    const success = await updateOrderStatus(order.id, nextStatus);
    if (!success) return;

    const freshOrder = await DataStore.query(Order, order.id);

    if (!freshOrder) {
      console.log("❌ Failed to fetch updated order");
      return;
    }

    /**
     * =========================
     * 🚀 TRIGGER UPLOADS (BACKGROUND)
     * =========================
     */

    /**
     * 🔥 PRE TRANSFER
     */
    if (nextStatus === "ARRIVED_PICKUP") {
      if (freshOrder?.courierPreTransferUploadStatus === "PENDING") {
        console.log("⚠️ PRE_TRANSFER already uploading, skipping...");
      } else {
        const localPhotos = courierPreTransferPhotos?.map((p) => p.uri) || [];
        const localVideo = courierPreTransferVideo?.uri || null;

        const updatedOrder = await DataStore.save(
          Order.copyOf(freshOrder, (u) => {
            u.courierPreTransferUploadStatus =
              CourierPreTransferUploadStatus.PENDING;

            u.courierPreTransferLocalPhotos = localPhotos;
            u.courierPreTransferLocalVideo = localVideo;
          }),
        );

        uploadCourierEvidence(
          updatedOrder,
          courierPreTransferPhotos,
          courierPreTransferVideo,
          "PRE_TRANSFER",
          dbCourier.id,
          (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              PRE_TRANSFER: progress,
            }));
          },
        );
      }
    }

    /**
     * 🔥 POST LOADING
     */
    if (nextStatus === "LOADING") {
      if (freshOrder?.courierPostLoadingUploadStatus === "PENDING") {
        console.log("⚠️ POST_LOADING already uploading, skipping...");
      } else {
        const localPhotos = courierPostLoadingPhotos?.map((p) => p.uri) || [];
        const localVideo = courierPostLoadingVideo?.uri || null;

        const updatedOrder = await DataStore.save(
          Order.copyOf(freshOrder, (u) => {
            u.courierPostLoadingUploadStatus =
              CourierPostLoadingUploadStatus.PENDING;

            u.courierPostLoadingLocalPhotos = localPhotos;
            u.courierPostLoadingLocalVideo = localVideo;
          }),
        );

        uploadCourierEvidence(
          updatedOrder,
          courierPostLoadingPhotos,
          courierPostLoadingVideo,
          "POST_LOADING",
          dbCourier.id,
          (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              POST_LOADING: progress,
            }));
          },
        );
      }
    }

    /**
     * 🔥 DROPOFF
     */
    if (nextStatus === "UNLOADING") {
      if (freshOrder?.dropoffUploadStatus === "PENDING") {
        console.log("⚠️ DROPOFF already uploading, skipping...");
      } else {
        const localPhotos = dropoffArrivalPhotos?.map((p) => p.uri) || [];
        const localVideo = dropoffArrivalVideo?.uri || null;

        const updatedOrder = await DataStore.save(
          Order.copyOf(freshOrder, (u) => {
            u.dropoffUploadStatus = DropoffUploadStatus.PENDING;

            u.dropoffArrivalLocalPhotos = localPhotos;
            u.dropoffArrivalLocalVideo = localVideo;
          }),
        );

        uploadCourierEvidence(
          updatedOrder,
          dropoffArrivalPhotos,
          dropoffArrivalVideo,
          "DROPOFF",
          dbCourier.id,
          (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              DROPOFF: progress,
            }));
          },
        );
      }
    }

    /**
     * =========================
     * ✅ CONTINUE FLOW (NO WAITING)
     * =========================
     */
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
            <Text style={styles.linkText}>{order?.recipientNumber}</Text>
          </TouchableOpacity>

          <Text style={styles.text}>{order?.destinationAddress}</Text>
        </View>
      )}

      {/* SENDER */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sender</Text>

        <Text style={styles.text}>{user?.firstName}</Text>

        <TouchableOpacity onPress={() => copyToClipboard(user?.phoneNumber)}>
          <Text style={styles.linkText}>{user?.phoneNumber}</Text>
        </TouchableOpacity>

        <Text style={styles.text}>{order?.transportationType}</Text>
      </View>

      {/* 🚨 EVIDENCE UPLOAD (CLEAN) */}
      {shouldShowUpload && <OrderEvidenceUploader order={order} />}

      {/* 🚨 EVIDENCE STATUS */}
      {order?.transportationType === "MAXI" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Evidence Status</Text>

          {order?.courierPreTransferPhotos?.length > 0 && (
            <View style={styles.successRow}>
              <Text style={styles.successDot}>●</Text>
              <Text style={styles.successText}>Pickup evidence uploaded</Text>
            </View>
          )}

          {order?.courierPostLoadingPhotos?.length > 0 && (
            <Text style={styles.text}>✔ Loading evidence uploaded</Text>
          )}

          {order?.dropoffArrivalPhotos?.length > 0 && (
            <Text style={styles.text}>✔ Dropoff evidence uploaded</Text>
          )}
        </View>
      )}

      {/* CODE INPUT */}
      {order?.status === "ARRIVED_DROPOFF" && (
        <View style={styles.card}>
          <TextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter code"
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      )}

      {/* BUTTON */}
      <TouchableOpacity
        onPress={handleMainAction}
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
