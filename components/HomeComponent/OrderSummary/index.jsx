import { useAuthContext } from "@/providers/AuthProvider";
import { Courier, Offer, Order, User } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import { getUrl } from "aws-amplify/storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import FontAwesome from "react-native-vector-icons/FontAwesome";

import MediaPreviewModal from "./MediaPreviewModal/MediaPreviewModal";
import VideoThumbnail from "./VideoThumbnail";
import styles from "./styles";

const OrderSummary = ({ orderId }) => {
  const { dbCourier } = useAuthContext();

  // ============================================================
  // STATE
  // ============================================================

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [courier, setCourier] = useState(null);

  // MAXI bidding only
  const [offer, setOffer] = useState("");
  const [offers, setOffers] = useState([]);

  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [resolvedMedia, setResolvedMedia] = useState([]);

  // ============================================================
  // ORDER TYPE
  // ============================================================

  const isBidding = order?.status === "BIDDING";

  const isMaxi = order?.transportationType === "MAXI";

  const isMicroOrMoto =
    order?.transportationType === "MICRO_EXPRESS" ||
    order?.transportationType === "MICRO_BATCH" ||
    order?.transportationType === "MOTO_EXPRESS" ||
    order?.transportationType === "MOTO_BATCH";

  const isMicro =
    order?.transportationType === "MICRO_EXPRESS" ||
    order?.transportationType === "MICRO_BATCH";

  const isMoto =
    order?.transportationType === "MOTO_EXPRESS" ||
    order?.transportationType === "MOTO_BATCH";

  const isExpress =
    order?.transportationType === "MICRO_EXPRESS" ||
    order?.transportationType === "MOTO_EXPRESS";

  const isBatch =
    order?.transportationType === "MICRO_BATCH" ||
    order?.transportationType === "MOTO_BATCH";

  // ============================================================
  // MARKETPLACE STATE
  // ============================================================

  const isOrderReady = order?.status === "READY_FOR_PICKUP";

  const isOrderPaid = order?.paymentStatus === "PAID";

  const isOrderUnassigned = !order?.assignedCourierId;

  // ============================================================
  // CAPACITY
  // ============================================================

  const currentExpressCount = Number(courier?.currentExpressCount || 0);

  const currentBatchCount = Number(courier?.currentBatchCount || 0);

  const currentMaxiCount = Number(courier?.currentMaxiCount || 0);

  const MAX_ACTIVE_BATCH_ORDERS = 10;

  const hasActiveExpress = currentExpressCount > 0;

  const hasActiveBatch = currentBatchCount > 0;

  const batchCapacityFull = currentBatchCount >= MAX_ACTIVE_BATCH_ORDERS;

  const expressBlocked = isExpress && (hasActiveExpress || hasActiveBatch);

  const batchBlocked = isBatch && (hasActiveExpress || batchCapacityFull);

  const capacityBlocksThisOrder =
    isMicroOrMoto && (expressBlocked || batchBlocked);

  // ============================================================
  // MAXI PRICING
  // ============================================================

  const minPrice = order?.estimatedMinPrice;
  const maxPrice = order?.estimatedMaxPrice;

  // ============================================================
  // MAXI LATEST OFFER
  // ============================================================

  const latestOffer = useMemo(() => {
    return [...offers].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )[0];
  }, [offers]);

  const displayPrice = isMaxi
    ? (latestOffer?.amount ?? order?.initialOfferPrice)
    : order?.courierEarnings;

  const numericOffer = offer ? Number(offer) : null;

  // ============================================================
  // MAXI USER OFFER
  // ============================================================

  const latestUserOffer = useMemo(() => {
    return [...offers]
      .filter((item) => item.senderType === "USER")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [offers]);

  const latestUserOfferAmount =
    latestUserOffer?.amount ?? order?.initialOfferPrice;

  // ============================================================
  // ACCEPT BUTTON
  // ============================================================

  const microMotoAcceptDisabled =
    !dbCourier?.id ||
    !order?.id ||
    !isOrderReady ||
    !isOrderPaid ||
    !isOrderUnassigned ||
    capacityBlocksThisOrder ||
    accepting;

  const maxiAcceptDisabled =
    order?.status === "ACCEPTED" ||
    currentMaxiCount > 0 ||
    (latestOffer && latestOffer.senderType !== "USER") ||
    numericOffer !== latestUserOfferAmount;

  const isAcceptDisabled = isMaxi
    ? maxiAcceptDisabled
    : microMotoAcceptDisabled;

  // ============================================================
  // COUNTER OFFER
  // ============================================================

  const isCourierTurn = !latestOffer || latestOffer.senderType === "USER";

  const isCounterDisabled =
    !isCourierTurn || !isBidding || currentMaxiCount > 0;

  // ============================================================
  // RESPONSIBILITY
  // ============================================================

  const formatResponsibility = (value) => {
    if (!value) {
      return null;
    }

    switch (value) {
      case "Handle Myself":
        return "Handled by sender";

      default:
        return value;
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const hasValue = (value) => {
    return value !== undefined && value !== null && String(value).trim() !== "";
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const numeric = Number(value);

    if (Number.isNaN(numeric)) {
      return null;
    }

    return `₦${numeric.toLocaleString()}`;
  };

  const formatTransportationType = (value) => {
    if (!value) {
      return null;
    }

    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatVehicleClass = (value) => {
    if (!value) {
      return null;
    }

    return String(value)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ============================================================
  // FETCH COURIER
  // ============================================================

  useEffect(() => {
    if (!dbCourier?.id) {
      return;
    }

    let mounted = true;

    const fetchCourier = async () => {
      try {
        const result = await DataStore.query(Courier, dbCourier.id);

        if (mounted) {
          setCourier(result);
        }
      } catch (error) {
        console.error("Error fetching courier:", error);
      }
    };

    fetchCourier();

    const subscription = DataStore.observe(Courier, dbCourier.id).subscribe(
      (message) => {
        if (message.opType === "UPDATE" && mounted) {
          setCourier(message.element);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dbCourier?.id]);

  // ============================================================
  // FETCH ORDER + USER
  // ============================================================

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        const fetchedOrder = await DataStore.query(Order, orderId);

        if (!fetchedOrder) {
          return;
        }

        if (mounted) {
          setOrder(fetchedOrder);
        }

        if (fetchedOrder.userID) {
          const fetchedUser = await DataStore.query(User, fetchedOrder.userID);

          if (mounted) {
            setUser(fetchedUser);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    const subscription = DataStore.observe(Order, orderId).subscribe(
      async (message) => {
        if (message.opType !== "UPDATE") {
          return;
        }

        if (mounted) {
          setOrder(message.element);
        }

        if (message.element.userID) {
          try {
            const updatedUser = await DataStore.query(
              User,
              message.element.userID,
            );

            if (mounted) {
              setUser(updatedUser);
            }
          } catch (error) {
            console.error("Error updating user:", error);
          }
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [orderId]);

  // ============================================================
  // FETCH OFFERS
  // ============================================================

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let mounted = true;

    const fetchOffers = async () => {
      try {
        const result = await DataStore.query(Offer, (item) =>
          item.orderID.eq(orderId),
        );

        if (mounted) {
          setOffers(result);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();

    const subscription = DataStore.observe(Offer).subscribe((message) => {
      if (message.element?.orderID === orderId && mounted) {
        fetchOffers();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [orderId]);

  // ============================================================
  // SET MAXI OFFER INPUT
  // ============================================================

  useEffect(() => {
    if (!order || !isMaxi || isEditing) {
      return;
    }

    const basePrice = latestOffer?.amount ?? order.initialOfferPrice;

    if (basePrice) {
      setOffer(basePrice.toString());
    }
  }, [order, latestOffer, isMaxi, isEditing]);

  // ============================================================
  // SEND MAXI COUNTER OFFER
  // ============================================================

  const onSendOffer = async (price) => {
    if (sending) {
      return;
    }

    setSending(true);

    try {
      if (!price || price <= 0) {
        return;
      }

      if (currentMaxiCount > 0) {
        Alert.alert(
          "Current Maxi delivery",
          "You must complete your current Maxi delivery before making another Maxi offer.",
        );
        return;
      }

      if (price < minPrice || price > maxPrice) {
        Alert.alert("Invalid offer", "Offer must be within the allowed range.");

        return;
      }

      await DataStore.save(
        new Offer({
          orderID: order.id,
          courierID: dbCourier.id,
          senderType: "COURIER",
          amount: price,
          status: "ACTIVE",
        }),
      );

      const latestOrder = await DataStore.query(Order, order.id);

      if (latestOrder && latestOrder.status === "BIDDING") {
        await DataStore.save(
          Order.copyOf(latestOrder, (updated) => {
            updated.hasNewOffer = true;
            updated.lastOfferAt = new Date().toISOString();
            updated.lastOfferSenderType = "COURIER";
          }),
        );
      }

      setOffer(price.toString());
    } catch (error) {
      console.error("Counter offer error:", error);

      Alert.alert("Error", "Unable to send counter offer.");
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // CLEAR LIVE ORDER BADGE
  // ============================================================

  useEffect(() => {
    if (!order) {
      return;
    }

    if (order.hasNewOffer && order.lastOfferSenderType === "USER") {
      const timer = setTimeout(async () => {
        try {
          const latestOrder = await DataStore.query(Order, order.id);

          if (!latestOrder) {
            return;
          }

          await DataStore.save(
            Order.copyOf(latestOrder, (updated) => {
              updated.hasNewOffer = false;
            }),
          );
        } catch (error) {
          console.error("Badge clear error:", error);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [order?.id, order?.hasNewOffer]);

  // ============================================================
  // ACCEPT ORDER
  //
  // BUSINESS LOGIC PRESERVED
  // ============================================================

  const onAccept = async () => {
    if (!dbCourier?.id || !order?.id || accepting) {
      return;
    }

    setAccepting(true);

    try {
      // ========================================================
      // ALWAYS REFRESH COURIER
      // ========================================================

      const freshCourier = await DataStore.query(Courier, dbCourier.id);

      if (!freshCourier) {
        Alert.alert("Unavailable", "Courier information unavailable.");

        return;
      }

      // ========================================================
      // ALWAYS REFRESH ORDER
      // ========================================================

      const latestOrder = await DataStore.query(Order, order.id);

      if (!latestOrder) {
        Alert.alert("Unavailable", "Order no longer exists.");

        return;
      }

      // ========================================================
      // ALREADY ACCEPTED
      // ========================================================

      if (latestOrder.status === "ACCEPTED") {
        Alert.alert(
          "Order already taken",
          "This order has already been accepted.",
        );

        return;
      }

      // ========================================================
      // MICRO / MOTO MARKETPLACE
      // ========================================================

      if (isMicroOrMoto) {
        const orderType = latestOrder.transportationType || "";

        const courierType = freshCourier.transportationType || "";

        const isLatestExpress =
          orderType === "MICRO_EXPRESS" || orderType === "MOTO_EXPRESS";

        const isLatestBatch =
          orderType === "MICRO_BATCH" || orderType === "MOTO_BATCH";

        if (!isLatestExpress && !isLatestBatch) {
          Alert.alert(
            "Unavailable",
            "This order is not available for Micro or Moto acceptance.",
          );

          return;
        }

        if (latestOrder.status !== "READY_FOR_PICKUP") {
          Alert.alert(
            "Order unavailable",
            "This order is no longer available for pickup.",
          );

          return;
        }

        if (latestOrder.paymentStatus !== "PAID") {
          Alert.alert(
            "Payment unavailable",
            "This order has not been successfully paid.",
          );

          return;
        }

        if (latestOrder.assignedCourierId) {
          Alert.alert(
            "Order already taken",
            "Another courier has already accepted this delivery.",
          );

          return;
        }

        const correctMicroOrder =
          courierType === "MICRO" &&
          (orderType === "MICRO_EXPRESS" || orderType === "MICRO_BATCH");

        const correctMotoOrder =
          courierType === "MOTO" &&
          (orderType === "MOTO_EXPRESS" || orderType === "MOTO_BATCH");

        if (!correctMicroOrder && !correctMotoOrder) {
          Alert.alert(
            "Unavailable",
            "This order is not available for your courier category.",
          );

          return;
        }

        const freshExpressCount = Number(freshCourier.currentExpressCount || 0);

        const freshBatchCount = Number(freshCourier.currentBatchCount || 0);

        if (isLatestExpress) {
          if (freshExpressCount > 0 || freshBatchCount > 0) {
            Alert.alert(
              "Express unavailable",
              "You must have no active Express or Batch deliveries before accepting an Express delivery.",
            );

            return;
          }
        }

        if (isLatestBatch) {
          if (freshExpressCount > 0) {
            Alert.alert(
              "Batch unavailable",
              "You must finish your current Express delivery before accepting a Batch delivery.",
            );

            return;
          }

          if (freshBatchCount >= MAX_ACTIVE_BATCH_ORDERS) {
            Alert.alert(
              "Batch limit reached",
              `You can have a maximum of ${MAX_ACTIVE_BATCH_ORDERS} active Batch deliveries.`,
            );

            return;
          }
        }

        // ======================================================
        // ACCEPT MICRO / MOTO
        // ======================================================

        const now = new Date().toISOString();

        await DataStore.save(
          Order.copyOf(latestOrder, (updated) => {
            updated.status = "ACCEPTED";

            updated.acceptedAt = now;

            updated.assignedCourierId = freshCourier.id;

            updated.assignmentStatus = "ACCEPTED";

            updated.hasNewOffer = false;
          }),
        );

        // ======================================================
        // UPDATE COURIER CAPACITY
        // ======================================================

        await DataStore.save(
          Courier.copyOf(freshCourier, (updated) => {
            if (isLatestExpress) {
              updated.currentExpressCount = freshExpressCount + 1;
            }

            if (isLatestBatch) {
              updated.currentBatchCount = freshBatchCount + 1;

              updated.lastBatchAssignedAt = now;
            }
          }),
        );

        router.replace("/deliveryhistory");

        return;
      }

      // ========================================================
      // MAXI
      // ========================================================

      if (Number(freshCourier.currentMaxiCount || 0) > 0) {
        Alert.alert(
          "Current Maxi delivery",
          "You must complete your current Maxi delivery first.",
        );

        return;
      }

      const freshOffers = await DataStore.query(Offer, (item) =>
        item.orderID.eq(latestOrder.id),
      );

      const latest = [...freshOffers].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )[0];

      if (!latest || latest.senderType !== "USER") {
        Alert.alert(
          "Offer unavailable",
          "You can only accept the user's latest offer.",
        );

        return;
      }

      const priceToAccept = latest.amount;

      await DataStore.save(
        Order.copyOf(latestOrder, (updated) => {
          updated.status = "ACCEPTED";

          updated.acceptedAt = new Date().toISOString();

          updated.totalPrice = priceToAccept;

          updated.acceptedOfferID = latest.id;

          updated.assignedCourierId = dbCourier.id;

          updated.hasNewOffer = false;
        }),
      );

      await DataStore.save(
        Offer.copyOf(latest, (updated) => {
          updated.status = "ACCEPTED";
        }),
      );

      await DataStore.save(
        Courier.copyOf(freshCourier, (updated) => {
          updated.currentMaxiCount = Number(updated.currentMaxiCount || 0) + 1;
        }),
      );

      router.replace("/deliveryhistory");
    } catch (error) {
      console.error("Error accepting order:", error);

      Alert.alert("Error", "Error accepting order. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  // ============================================================
  // RESOLVE MEDIA
  // ============================================================

  useEffect(() => {
    if (!order) {
      return;
    }

    let mounted = true;

    const resolveMedia = async () => {
      try {
        const photos = await Promise.all(
          (order.senderPreTransferPhotos || []).map(async (key) => {
            const { url } = await getUrl({
              path: key,
              options: {
                validateObjectExistence: true,
              },
            });

            return {
              uri: url.toString(),
              type: "photo",
            };
          }),
        );

        let video = [];

        if (order.senderPreTransferVideo) {
          const value = order.senderPreTransferVideo;

          if (value.startsWith("http")) {
            video = [
              {
                uri: value,
                type: "video",
              },
            ];
          } else {
            const { url } = await getUrl({
              path: value,
              options: {
                validateObjectExistence: true,
              },
            });

            video = [
              {
                uri: url.toString(),
                type: "video",
              },
            ];
          }
        }

        if (mounted) {
          setResolvedMedia([...photos, ...video]);
        }
      } catch (error) {
        console.error("Media resolve error:", error);
      }
    };

    resolveMedia();

    return () => {
      mounted = false;
    };
  }, [order]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111111" />

        <Text style={styles.loadingText}>Loading delivery...</Text>
      </View>
    );
  }

  // ============================================================
  // DERIVED DISPLAY DATA
  // ============================================================

  const formattedPrice =
    displayPrice !== undefined && displayPrice !== null && displayPrice !== ""
      ? Number(displayPrice).toLocaleString()
      : "---";

  const transportationLabel = formatTransportationType(
    order?.transportationType,
  );

  const vehicleLabel = formatVehicleClass(order?.vehicleClass);

  const pickupResponsibility = formatResponsibility(
    order?.pickupLoadingResponsibility,
  );

  const dropoffResponsibility = formatResponsibility(
    order?.dropoffUnloadingResponsibility,
  );

  const distance = hasValue(order?.distance) ? `${order.distance}` : null;

  const senderName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  // ============================================================
  // UI
  // ============================================================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
      keyboardVerticalOffset={80}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ==================================================
              HERO / PRICE
              ================================================== */}

          <View
            style={[
              styles.heroCard,
              order.status === "ACCEPTED" && styles.heroCardAccepted,
            ]}
          >
            <View style={styles.heroTop}>
              <View>
                <Text
                  style={[
                    styles.heroLabel,
                    order.status === "ACCEPTED" && styles.heroLabelAccepted,
                  ]}
                >
                  {order.status === "ACCEPTED"
                    ? "FINAL EARNINGS"
                    : isMaxi
                      ? "CURRENT OFFER"
                      : "DELIVERY EARNINGS"}
                </Text>

                <Text
                  style={[
                    styles.heroPrice,
                    order.status === "ACCEPTED" && styles.heroPriceAccepted,
                  ]}
                >
                  ₦{formattedPrice}
                </Text>
              </View>

              <View style={styles.serviceHeroBadge}>
                <FontAwesome
                  name={
                    isMicro
                      ? "bicycle"
                      : isMoto
                        ? "motorcycle"
                        : isMaxi
                          ? "truck"
                          : "road"
                  }
                  size={15}
                  color="#FFFFFF"
                />

                <Text style={styles.serviceHeroText}>
                  {isMicro ? "MICRO" : isMoto ? "MOTO" : "MAXI"}
                </Text>
              </View>
            </View>

            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.heroMetaLabel}>SERVICE</Text>

                <Text style={styles.heroMetaValue}>
                  {transportationLabel || "Delivery"}
                </Text>
              </View>

              {distance && (
                <View>
                  <Text style={styles.heroMetaLabel}>DISTANCE</Text>

                  <Text style={styles.heroMetaValue}>{distance}</Text>
                </View>
              )}

              {vehicleLabel && (
                <View>
                  <Text style={styles.heroMetaLabel}>VEHICLE</Text>

                  <Text style={styles.heroMetaValue}>{vehicleLabel}</Text>
                </View>
              )}

              {order.status === "ACCEPTED" && (
                <View style={styles.lockedBadge}>
                  <FontAwesome name="lock" size={9} color="#86EFAC" />

                  <Text style={styles.lockedText}>LOCKED</Text>
                </View>
              )}
            </View>
          </View>

          {/* ==================================================
              MARKETPLACE STATUS
              ================================================== */}

          {isMicroOrMoto && order.status !== "ACCEPTED" && (
            <View style={styles.statusCard}>
              <View
                style={[
                  styles.statusIcon,
                  isOrderReady &&
                  isOrderPaid &&
                  isOrderUnassigned &&
                  !capacityBlocksThisOrder
                    ? styles.statusIconAvailable
                    : styles.statusIconUnavailable,
                ]}
              >
                <FontAwesome
                  name={
                    isOrderReady &&
                    isOrderPaid &&
                    isOrderUnassigned &&
                    !capacityBlocksThisOrder
                      ? "check"
                      : "exclamation"
                  }
                  size={16}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>
                  {isOrderReady &&
                  isOrderPaid &&
                  isOrderUnassigned &&
                  !capacityBlocksThisOrder
                    ? "Delivery available"
                    : "Delivery unavailable"}
                </Text>

                <Text style={styles.statusSubtitle}>
                  {!isOrderPaid
                    ? "Payment has not been completed."
                    : !isOrderReady
                      ? "This delivery is no longer available for acceptance."
                      : !isOrderUnassigned
                        ? "This delivery has already been accepted by another courier."
                        : isExpress && hasActiveExpress
                          ? "Finish your current Express delivery first."
                          : isExpress && hasActiveBatch
                            ? "Finish your current Batch deliveries before accepting an Express delivery."
                            : isBatch && hasActiveExpress
                              ? "Finish your current Express delivery before accepting a Batch delivery."
                              : isBatch && batchCapacityFull
                                ? `You have reached the ${MAX_ACTIVE_BATCH_ORDERS}-order Batch limit.`
                                : "This delivery is available for you to accept."}
                </Text>
              </View>
            </View>
          )}

          {/* ==================================================
              ACCEPTED STATUS
              ================================================== */}

          {order.status === "ACCEPTED" && (
            <View style={styles.acceptedCard}>
              <View style={styles.acceptedIcon}>
                <FontAwesome name="check" size={18} color="#FFFFFF" />
              </View>

              <View style={styles.acceptedContent}>
                <Text style={styles.acceptedTitle}>Delivery secured</Text>

                <Text style={styles.acceptedSubtitle}>
                  You have accepted this delivery.
                </Text>
              </View>
            </View>
          )}

          {/* ==================================================
              SENDER
              ================================================== */}

          {hasValue(senderName) && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <FontAwesome name="user" size={12} color="#111111" />
                </View>

                <Text style={styles.sectionTitle}>Sender</Text>
              </View>

              <View style={styles.senderRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {senderName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View>
                  <Text style={styles.senderName}>{senderName}</Text>

                  <Text style={styles.senderSubtitle}>Delivery sender</Text>
                </View>
              </View>
            </View>
          )}

          {/* ==================================================
              ROUTE
              ================================================== */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FontAwesome name="map-marker" size={13} color="#111111" />
              </View>

              <Text style={styles.sectionTitle}>Delivery route</Text>
            </View>

            <View style={styles.routeContainer}>
              {hasValue(order.originAddress) && (
                <View style={styles.routeRow}>
                  <View style={styles.routeRail}>
                    <View style={styles.pickupDot} />

                    <View style={styles.routeLine} />
                  </View>

                  <View style={styles.routeContent}>
                    <Text style={styles.routeLabel}>PICKUP</Text>

                    <Text style={styles.routeAddress}>
                      {order.originAddress}
                    </Text>
                  </View>
                </View>
              )}

              {hasValue(order.destinationAddress) && (
                <View style={styles.routeRow}>
                  <View style={styles.routeRail}>
                    <View style={styles.dropoffDot}>
                      <View style={styles.dropoffInner} />
                    </View>
                  </View>

                  <View style={styles.routeContent}>
                    <Text style={styles.routeLabel}>DROPOFF</Text>

                    <Text style={styles.routeAddress}>
                      {order.destinationAddress}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {(hasValue(order.tripType) ||
              hasValue(order.distance) ||
              hasValue(order.transportationType)) && (
              <View style={styles.routeMeta}>
                {hasValue(order.tripType) && (
                  <View style={styles.routeMetaItem}>
                    <Text style={styles.metaLabel}>TRIP</Text>

                    <Text style={styles.metaValue}>{order.tripType}</Text>
                  </View>
                )}

                {hasValue(order.distance) && (
                  <View style={styles.routeMetaItem}>
                    <Text style={styles.metaLabel}>DISTANCE</Text>

                    <Text style={styles.metaValue}>{order.distance} </Text>
                  </View>
                )}

                {hasValue(order.transportationType) && (
                  <View style={styles.routeMetaItem}>
                    <Text style={styles.metaLabel}>SERVICE</Text>

                    <Text style={styles.metaValue}>{transportationLabel}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ==================================================
              DISPATCH
              ================================================== */}

          {isMicroOrMoto && order.status !== "ACCEPTED" && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <FontAwesome name="bolt" size={12} color="#111111" />
                </View>

                <Text style={styles.sectionTitle}>Dispatch</Text>
              </View>

              <View style={styles.dispatchBox}>
                <View style={styles.dispatchStatusDot} />

                <View style={styles.dispatchContent}>
                  <Text style={styles.dispatchTitle}>
                    {isOrderPaid &&
                    isOrderReady &&
                    isOrderUnassigned &&
                    !capacityBlocksThisOrder
                      ? "Ready for acceptance"
                      : "Currently unavailable"}
                  </Text>

                  <Text style={styles.dispatchText}>
                    {!isOrderPaid
                      ? "Payment has not been completed."
                      : !isOrderReady
                        ? "This delivery is no longer available."
                        : !isOrderUnassigned
                          ? "Another courier has already accepted this delivery."
                          : capacityBlocksThisOrder
                            ? isExpress && hasActiveExpress
                              ? "Finish your current Express delivery first."
                              : isExpress && hasActiveBatch
                                ? "Finish your current Batch deliveries before accepting Express."
                                : isBatch && hasActiveExpress
                                  ? "Finish your current Express delivery before accepting Batch."
                                  : `You have reached the ${MAX_ACTIVE_BATCH_ORDERS}-order Batch limit.`
                            : "This delivery is available for you to accept."}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ==================================================
              CARGO EVIDENCE
              ================================================== */}

          {(resolvedMedia.length > 0 ||
            order.mediaUploadStatus === "PENDING") && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <FontAwesome name="camera" size={12} color="#111111" />
                </View>

                <Text style={styles.sectionTitle}>Cargo evidence</Text>
              </View>

              {order.mediaUploadStatus === "PENDING" && (
                <View style={styles.mediaLoading}>
                  <ActivityIndicator size="small" color="#111111" />

                  <Text style={styles.mediaLoadingText}>
                    Loading sender evidence...
                  </Text>
                </View>
              )}

              {resolvedMedia.length > 0 ? (
                <>
                  {/* PHOTOS */}

                  {resolvedMedia.some((item) => item.type === "photo") && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.photoScroll}
                    >
                      {resolvedMedia
                        .filter((item) => item.type === "photo")
                        .map((item, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              setSelectedIndex(index);

                              setPreviewVisible(true);
                            }}
                            activeOpacity={0.9}
                          >
                            <Image
                              source={{
                                uri: item.uri,
                              }}
                              style={styles.previewImage}
                            />
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  )}

                  {/* VIDEO */}

                  {resolvedMedia.find((item) => item.type === "video") && (
                    <TouchableOpacity
                      style={styles.videoPreview}
                      onPress={() => {
                        const videoIndex = resolvedMedia.filter(
                          (item) => item.type === "photo",
                        ).length;

                        setSelectedIndex(videoIndex);

                        setPreviewVisible(true);
                      }}
                      activeOpacity={0.9}
                    >
                      <VideoThumbnail
                        uri={
                          resolvedMedia.find((item) => item.type === "video")
                            .uri
                        }
                        style={styles.videoThumbnail}
                      />

                      <View style={styles.playOverlay}>
                        <View style={styles.playButton}>
                          <FontAwesome name="play" size={15} color="#111111" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                order.mediaUploadStatus !== "PENDING" && (
                  <Text style={styles.emptyText}>
                    No sender evidence provided.
                  </Text>
                )
              )}
            </View>
          )}

          {/* ==================================================
              CARGO
              ================================================== */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FontAwesome name="cube" size={12} color="#111111" />
              </View>

              <Text style={styles.sectionTitle}>Cargo details</Text>
            </View>

            <View style={styles.detailList}>
              {hasValue(order.orderDetails) && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DESCRIPTION</Text>

                  <Text style={styles.detailValue}>{order.orderDetails}</Text>
                </View>
              )}

              {hasValue(order.declaredWeightBracket) && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>WEIGHT</Text>

                  <Text style={styles.detailValue}>
                    {order.declaredWeightBracket}
                  </Text>
                </View>
              )}

              {hasValue(order.pickupFloorLevel) && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PICKUP FLOOR</Text>

                  <Text style={styles.detailValue}>
                    {order.pickupFloorLevel}
                  </Text>
                </View>
              )}

              {pickupResponsibility && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PICKUP RESPONSIBILITY</Text>

                  <Text style={styles.detailValue}>{pickupResponsibility}</Text>
                </View>
              )}

              {hasValue(order.dropoffFloorLevel) && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DROPOFF FLOOR</Text>

                  <Text style={styles.detailValue}>
                    {order.dropoffFloorLevel}
                  </Text>
                </View>
              )}

              {dropoffResponsibility && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DROPOFF RESPONSIBILITY</Text>

                  <Text style={styles.detailValue}>
                    {dropoffResponsibility}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ==================================================
              FEES
              ================================================== */}

          {(Number(order.loadingFee || 0) > 0 ||
            Number(order.unloadingFee || 0) > 0) && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <FontAwesome name="money" size={12} color="#111111" />
                </View>

                <Text style={styles.sectionTitle}>Additional fees</Text>
              </View>

              <View style={styles.feeList}>
                {Number(order.loadingFee || 0) > 0 && (
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Loading</Text>

                    <Text style={styles.feeValue}>
                      {formatCurrency(order.loadingFee)}
                    </Text>
                  </View>
                )}

                {Number(order.unloadingFee || 0) > 0 && (
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Unloading</Text>

                    <Text style={styles.feeValue}>
                      {formatCurrency(order.unloadingFee)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ==================================================
              MAXI OFFER
              ================================================== */}

          {isMaxi && order.status !== "ACCEPTED" && (
            <View style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View>
                  <Text style={styles.offerTitle}>Your offer</Text>

                  <Text style={styles.offerSubtitle}>
                    Adjust your price within the allowed range.
                  </Text>
                </View>

                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>MAXI</Text>
                </View>
              </View>

              <View style={styles.offerControl}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() =>
                    setOffer((previous) => {
                      const value = Number(previous) || minPrice;

                      return Math.max(minPrice, value - 1000).toString();
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.adjustText}>−</Text>
                </TouchableOpacity>

                <View style={styles.offerInputContainer}>
                  <Text style={styles.offerCurrency}>₦</Text>

                  <TextInput
                    style={styles.offerInput}
                    keyboardType="numeric"
                    value={offer}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
                    onChangeText={(value) => {
                      if (value === "") {
                        setOffer("");

                        return;
                      }

                      setOffer(Number(value).toString());
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() =>
                    setOffer((previous) => {
                      const value = Number(previous) || minPrice;

                      return Math.min(maxPrice, value + 1000).toString();
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.adjustText}>+</Text>
                </TouchableOpacity>
              </View>

              {numericOffer < minPrice || numericOffer > maxPrice ? (
                <Text style={styles.feedBack}>
                  Offer must be between {formatCurrency(minPrice)} and{" "}
                  {formatCurrency(maxPrice)}
                </Text>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    isCounterDisabled && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();

                    setIsEditing(false);

                    onSendOffer(Number(offer));
                  }}
                  disabled={isCounterDisabled}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="refresh" size={12} color="#FFFFFF" />

                  <Text style={styles.buttonText}>Counter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.acceptButton,
                    isAcceptDisabled && styles.buttonDisabled,
                  ]}
                  onPress={onAccept}
                  disabled={isAcceptDisabled}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="check" size={12} color="#FFFFFF" />

                  <Text style={styles.buttonText}>
                    {isAcceptDisabled
                      ? currentMaxiCount > 0
                        ? "Current delivery active"
                        : "Accept"
                      : "Accept offer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ==================================================
              MICRO / MOTO ACCEPT
              ================================================== */}

          {isMicroOrMoto && order.status !== "ACCEPTED" && (
            <View style={styles.bottomAction}>
              <TouchableOpacity
                style={[
                  styles.primaryAcceptButton,
                  isAcceptDisabled && styles.buttonDisabled,
                ]}
                onPress={onAccept}
                disabled={isAcceptDisabled}
                activeOpacity={0.85}
              >
                {accepting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <FontAwesome
                      name={isAcceptDisabled ? "lock" : "check"}
                      size={13}
                      color="#FFFFFF"
                    />

                    <Text style={styles.primaryButtonText}>
                      {isAcceptDisabled
                        ? !isOrderPaid
                          ? "Payment pending"
                          : !isOrderReady
                            ? "Unavailable"
                            : !isOrderUnassigned
                              ? "Already accepted"
                              : capacityBlocksThisOrder
                                ? "Currently unavailable"
                                : "Unavailable"
                        : "Accept delivery"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ======================================================
            MEDIA MODAL
            ====================================================== */}

        <MediaPreviewModal
          visible={previewVisible}
          mediaList={resolvedMedia}
          initialIndex={selectedIndex}
          onClose={() => setPreviewVisible(false)}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default OrderSummary;
