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
import { router } from "expo-router";
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
 * ============================================================
 * DELIVERY FLOW
 * ============================================================
 *
 * MAXI:
 * ACCEPTED
 * → ARRIVED_PICKUP
 * → LOADING
 * → PICKED_UP
 * → IN_TRANSIT
 * → ARRIVED_DROPOFF
 * → UNLOADING
 * → DELIVERED
 *
 * MICRO / MOTO:
 * ACCEPTED
 * → ARRIVED_PICKUP
 * → PICKED_UP
 * → IN_TRANSIT
 * → ARRIVED_DROPOFF
 * → DELIVERED
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
 * ============================================================
 * STATUS LABELS
 * ============================================================
 */
const formatStep = (step) => {
  switch (step) {
    case "ACCEPTED":
      return "ACCEPTED";

    case "ARRIVED_PICKUP":
      return "PICKUP";

    case "LOADING":
      return "LOADING";

    case "PICKED_UP":
      return "PICKED";

    case "IN_TRANSIT":
      return "TRANSIT";

    case "ARRIVED_DROPOFF":
      return "DROPOFF";

    case "UNLOADING":
      return "UNLOADING";

    case "DELIVERED":
      return "DONE";

    default:
      return step?.split("_")[0] || "";
  }
};

/**
 * ============================================================
 * STATUS DESCRIPTION
 * ============================================================
 */
const getStatusDescription = (status) => {
  switch (status) {
    case "ACCEPTED":
      return "Order accepted";

    case "ARRIVED_PICKUP":
      return "At pickup location";

    case "LOADING":
      return "Loading shipment";

    case "PICKED_UP":
      return "Shipment collected";

    case "IN_TRANSIT":
      return "On the way";

    case "ARRIVED_DROPOFF":
      return "At delivery location";

    case "UNLOADING":
      return "Unloading shipment";

    case "DELIVERED":
      return "Delivery completed";

    default:
      return "Delivery in progress";
  }
};

/**
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */
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

  const roundedTotalMins =
    totalMins != null ? Math.round(Number(totalMins)) : null;

  /**
   * ==========================================================
   * DELIVERY STEPS
   * ==========================================================
   */
  const STATUS_STEPS = useMemo(() => getSteps(order), [order]);

  /**
   * ==========================================================
   * CURRENT STEP
   * ==========================================================
   */
  const currentStep = useMemo(() => {
    if (!order?.status) return -1;

    if (order.status === "DELIVERED") {
      return STATUS_STEPS.length - 1;
    }

    return STATUS_STEPS.indexOf(order.status);
  }, [order?.status, STATUS_STEPS]);

  /**
   * ==========================================================
   * NEXT STATUS
   * ==========================================================
   */
  const nextStatus = useMemo(() => {
    if (!order?.status) return null;

    const index = STATUS_STEPS.indexOf(order.status);

    return STATUS_STEPS[index + 1];
  }, [order?.status, STATUS_STEPS]);

  /**
   * ==========================================================
   * CURRENT STATUS TEXT
   * ==========================================================
   */
  const currentStatusDescription = useMemo(
    () => getStatusDescription(order?.status),
    [order?.status],
  );

  /**
   * ==========================================================
   * EVIDENCE VISIBILITY
   *
   * Evidence upload is only available for MAXI
   * deliveries at these stages.
   * ==========================================================
   */
  const shouldShowUpload = useMemo(() => {
    if (order?.transportationType !== "MAXI") {
      return false;
    }

    return ["ARRIVED_PICKUP", "LOADING", "UNLOADING"].includes(order?.status);
  }, [order?.transportationType, order?.status]);

  /**
   * ==========================================================
   * COPY TO CLIPBOARD
   * ==========================================================
   */
  const copyToClipboard = async (text) => {
    if (!text) return;

    await Clipboard.setStringAsync(text);

    Alert.alert("Copied", "Number copied");
  };

  /**
   * ==========================================================
   * MAIN DELIVERY ACTION
   * ==========================================================
   */
  const handleMainAction = async () => {
    if (!nextStatus) {
      console.log("❌ No next status");
      return;
    }

    /**
     * ========================================================
     * DELIVERY VERIFICATION
     * ========================================================
     *
     * Verification is required only when the courier
     * has reached the dropoff.
     */
    if (order?.status === "ARRIVED_DROPOFF") {
      if (!verificationCode.trim()) {
        Alert.alert(
          "Verification Required",
          "Enter the recipient verification code.",
        );

        return;
      }

      const enteredCode = verificationCode.trim();

      const storedCode = String(order?.deliveryVerificationCode || "").trim();

      if (enteredCode !== storedCode) {
        Alert.alert(
          "Invalid Code",
          "The verification code entered is incorrect.",
        );

        return;
      }
    }

    /**
     * ========================================================
     * UPDATE STATUS
     * ========================================================
     */
    const success = await updateOrderStatus(order.id, nextStatus);

    if (!success) {
      return;
    }

    /**
     * ========================================================
     * FETCH FRESH ORDER
     * ========================================================
     */
    const freshOrder = await DataStore.query(Order, order.id);

    if (!freshOrder) {
      console.log("❌ Failed to fetch updated order");

      return;
    }

    /**
     * ========================================================
     * PRE-TRANSFER EVIDENCE
     * ========================================================
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
     * ========================================================
     * POST-LOADING EVIDENCE
     * ========================================================
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
     * ========================================================
     * DROPOFF / UNLOADING EVIDENCE
     * ========================================================
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
     * ========================================================
     * COMPLETED
     * ========================================================
     */
    if (nextStatus === "DELIVERED") {
      router.replace("/home");
      return;
    }

    /**
     * Continue the parent flow.
     */
    onButtonPressed();
  };

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <View style={styles.container}>
      {/* ======================================================
          STATUS HEADER
          ====================================================== */}

      <View style={styles.statusHeader}>
        <View style={styles.statusHeaderContent}>
          <Text style={styles.statusEyebrow}>DELIVERY STATUS</Text>

          <Text style={styles.statusTitle}>
            {order?.status === "DELIVERED"
              ? "Delivery completed"
              : currentStatusDescription}
          </Text>
        </View>

        {roundedTotalMins != null && (
          <View style={styles.timeBadge}>
            <Text style={styles.timeValue}>{roundedTotalMins}</Text>
            <Text style={styles.timeLabel}>MIN</Text>
          </View>
        )}
      </View>

      {/* ======================================================
          CIRCULAR DELIVERY PROGRESS
          ====================================================== */}

      <View style={styles.progressCard}>
        <View style={styles.progressContainer}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;

            const isCurrent = index === currentStep;

            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <View key={index} style={styles.progressItem}>
                <View style={styles.progressNodeRow}>
                  {/* CIRCLE */}
                  <View
                    style={[
                      styles.circle,
                      isCompleted && styles.completedCircle,
                      isCurrent && styles.activeCircle,
                    ]}
                  >
                    {(isCompleted || isCurrent) && (
                      <Text style={styles.circleCheck}>✓</Text>
                    )}
                  </View>

                  {/* CONNECTING LINE */}
                  {!isLast && (
                    <View
                      style={[
                        styles.progressLine,
                        index < currentStep && styles.progressLineActive,
                      ]}
                    />
                  )}
                </View>

                {/* LABEL */}
                <Text
                  style={[
                    styles.progressText,
                    (isCompleted || isCurrent) && styles.progressTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {formatStep(step)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ======================================================
          RECIPIENT
          ====================================================== */}

      {deliveryPickedUp && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>↓</Text>
            </View>

            <View style={styles.cardHeaderContent}>
              <Text style={styles.sectionTitle}>RECIPIENT</Text>

              <Text style={styles.sectionSubtitle}>Delivery destination</Text>
            </View>
          </View>

          <View style={styles.personRow}>
            <View style={styles.personAvatar}>
              <Text style={styles.personAvatarText}>
                {(order?.recipientName || "R").charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.personContent}>
              <Text style={styles.personName}>{order?.recipientName}</Text>

              <Text style={styles.personRole}>Recipient</Text>
            </View>
          </View>

          {order?.recipientNumber && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => copyToClipboard(order?.recipientNumber)}
              activeOpacity={0.7}
            >
              <Text style={styles.phoneIcon}>☎</Text>

              <Text style={styles.phoneText}>{order?.recipientNumber}</Text>

              <Text style={styles.copyText}>COPY</Text>
            </TouchableOpacity>
          )}

          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>DROP-OFF ADDRESS</Text>

            <Text style={styles.addressText}>{order?.destinationAddress}</Text>
          </View>
        </View>
      )}

      {/* ======================================================
          SENDER
          ====================================================== */}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>↑</Text>
          </View>

          <View style={styles.cardHeaderContent}>
            <Text style={styles.sectionTitle}>SENDER</Text>

            <Text style={styles.sectionSubtitle}>Order origin</Text>
          </View>
        </View>

        <View style={styles.personRow}>
          <View style={styles.personAvatar}>
            <Text style={styles.personAvatarText}>
              {(user?.firstName || "S").charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.personContent}>
            <Text style={styles.personName}>{user?.firstName}</Text>

            <Text style={styles.personRole}>Sender</Text>
          </View>
        </View>

        {/*
         * Sender phone number is deliberately hidden
         * once the delivery has been completed.
         *
         * During the active delivery, the courier
         * can still view and copy the number.
         * for maxi hide sender number if payment has not been made.
         */}
        {(order?.transportationType !== "MAXI" ||
          order?.paymentStatus === "PAID") &&
          order?.status !== "DELIVERED" &&
          user?.phoneNumber && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => copyToClipboard(user?.phoneNumber)}
              activeOpacity={0.7}
            >
              <Text style={styles.phoneIcon}>☎</Text>

              <Text style={styles.phoneText}>{user?.phoneNumber}</Text>

              <Text style={styles.copyText}>COPY</Text>
            </TouchableOpacity>
          )}

        <View style={styles.serviceRow}>
          <Text style={styles.serviceLabel}>SERVICE</Text>

          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>
              {order?.transportationType}
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================
          MAXI EVIDENCE UPLOADER
          ====================================================== */}

      {shouldShowUpload && (
        <View style={styles.evidenceWrapper}>
          <OrderEvidenceUploader order={order} />
        </View>
      )}

      {/* ======================================================
          MAXI EVIDENCE STATUS
          ====================================================== */}

      {order?.transportationType === "MAXI" && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>✓</Text>
            </View>

            <View style={styles.cardHeaderContent}>
              <Text style={styles.sectionTitle}>EVIDENCE STATUS</Text>

              <Text style={styles.sectionSubtitle}>Delivery documentation</Text>
            </View>
          </View>

          {order?.courierPreTransferPhotos?.length > 0 && (
            <View style={styles.successRow}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>

              <View style={styles.successContent}>
                <Text style={styles.successTitle}>Pickup evidence</Text>

                <Text style={styles.successSubtitle}>
                  Uploaded successfully
                </Text>
              </View>
            </View>
          )}

          {order?.courierPostLoadingPhotos?.length > 0 && (
            <View style={styles.successRow}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>

              <View style={styles.successContent}>
                <Text style={styles.successTitle}>Loading evidence</Text>

                <Text style={styles.successSubtitle}>
                  Uploaded successfully
                </Text>
              </View>
            </View>
          )}

          {order?.dropoffArrivalPhotos?.length > 0 && (
            <View style={styles.successRow}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>

              <View style={styles.successContent}>
                <Text style={styles.successTitle}>Dropoff evidence</Text>

                <Text style={styles.successSubtitle}>
                  Uploaded successfully
                </Text>
              </View>
            </View>
          )}

          {!order?.courierPreTransferPhotos?.length &&
            !order?.courierPostLoadingPhotos?.length &&
            !order?.dropoffArrivalPhotos?.length && (
              <Text style={styles.emptyEvidence}>
                No evidence uploaded yet.
              </Text>
            )}
        </View>
      )}

      {/* ======================================================
          DELIVERY VERIFICATION
          ====================================================== */}

      {order?.status === "ARRIVED_DROPOFF" && (
        <View style={styles.verificationCard}>
          <View style={styles.verificationHeader}>
            <View style={styles.verificationIcon}>
              <Text style={styles.verificationIconText}>#</Text>
            </View>

            <View style={styles.verificationContent}>
              <Text style={styles.verificationTitle}>
                DELIVERY VERIFICATION
              </Text>

              <Text style={styles.verificationSubtitle}>
                Enter the recipient's 6-digit code
              </Text>
            </View>
          </View>

          <TextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="000000"
            placeholderTextColor="#777777"
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* ======================================================
          MAIN ACTION
          ====================================================== */}

      <View style={styles.actionWrapper}>
        <TouchableOpacity
          onPress={handleMainAction}
          disabled={isButtonDisabled}
          activeOpacity={0.85}
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>{buttonTitle}</Text>

              {!isButtonDisabled && <Text style={styles.buttonArrow}>→</Text>}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderDetails;
