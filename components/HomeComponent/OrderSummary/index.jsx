import { useAuthContext } from "@/providers/AuthProvider";
import { Courier, Offer, Order, User } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import { getUrl } from "aws-amplify/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

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

  const isMicroOrMoto = !isMaxi;

  // ============================================================
  // MICRO / MOTO ASSIGNMENT
  // ============================================================
  //
  // assignedCourierId means:
  //
  // "This courier currently has the dispatch offer."
  //
  // It does NOT mean that the courier has accepted the order.
  //
  // assignmentStatus tells us what happened to that offer.
  //
  // OFFERED
  // ACCEPTED
  // TIMEOUT
  // RELEASED
  // etc.
  //
  // MAXI DOES NOT USE THIS SYSTEM.
  // MAXI continues using the Offer model.
  // ============================================================

  const isAssignedToMe =
    !!dbCourier?.id &&
    !!order?.assignedCourierId &&
    order.assignedCourierId === dbCourier.id;

  const isAssignedToAnotherCourier =
    !!order?.assignedCourierId && order.assignedCourierId !== dbCourier?.id;

  const assignmentStatus = order?.assignmentStatus || null;

  const isCurrentlyOfferedToMe =
    isMicroOrMoto && isAssignedToMe && assignmentStatus === "OFFERED";

  // ============================================================
  // CAPACITY
  // ============================================================

  const currentExpressCount = Number(courier?.currentExpressCount || 0);

  const currentBatchCount = Number(courier?.currentBatchCount || 0);

  const currentMaxiCount = Number(courier?.currentMaxiCount || 0);

  const courierTotal = currentExpressCount + currentBatchCount;

  // ============================================================
  // MICRO / MOTO ORDER TYPE
  // ============================================================

  const isExpress =
    isMicroOrMoto && order?.transportationType?.includes("EXPRESS");

  const isBatch = isMicroOrMoto && order?.transportationType?.includes("BATCH");

  // ============================================================
  // EXPRESS CAPACITY
  // ============================================================
  //
  // IMPORTANT:
  //
  // assignOrder may already have increased
  // currentExpressCount because this order was RESERVED
  // for this courier.
  //
  // Therefore:
  //
  // currentExpressCount === 1
  //
  // does NOT automatically mean:
  //
  // "You cannot accept this order."
  //
  // If this exact offer belongs to this courier,
  // allow the courier to accept it.
  //
  // ============================================================

  const hasExpressCapacityUsed = currentExpressCount > 0;

  const hasOtherExpressOrder =
    isExpress && hasExpressCapacityUsed && !isAssignedToMe;

  // ============================================================
  // TOTAL MICRO / MOTO CAPACITY
  // ============================================================

  const MAX_ACTIVE_ORDERS = 10;

  const isAtMaximumCapacity = courierTotal >= MAX_ACTIVE_ORDERS;

  const capacityBlocksThisOrder =
    isMicroOrMoto && isAtMaximumCapacity && !isAssignedToMe;

  // ============================================================
  // FORCE DISPATCH TIMER
  // ============================================================

  const lastBatchAssignedAt = courier?.lastBatchAssignedAt
    ? new Date(courier.lastBatchAssignedAt)
    : null;

  const THREE_HOURS = 3 * 60 * 60 * 1000;

  const exceededTime =
    !!lastBatchAssignedAt &&
    Date.now() - lastBatchAssignedAt.getTime() > THREE_HOURS;

  const forceDispatchBlocksThisOrder =
    isMicroOrMoto && exceededTime && courierTotal > 0 && !isAssignedToMe;

  // ============================================================
  // MAXI PRICING
  // ============================================================

  const minPrice = order?.estimatedMinPrice;

  const maxPrice = order?.estimatedMaxPrice;

  // ============================================================
  // MAXI LATEST OFFER
  // ============================================================

  const latestOffer = [...offers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )[0];

  const displayPrice = isMaxi
    ? (latestOffer?.amount ?? order?.initialOfferPrice)
    : order?.courierEarnings;

  const numericOffer = offer ? Number(offer) : null;

  // ============================================================
  // MAXI USER OFFER
  // ============================================================

  const latestUserOffer = [...offers]
    .filter((item) => item.senderType === "USER")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const latestUserOfferAmount =
    latestUserOffer?.amount ?? order?.initialOfferPrice;

  // ============================================================
  // MICRO / MOTO ACCEPT BUTTON
  // ============================================================
  //
  // The courier must:
  //
  // 1. Be the courier currently assigned.
  // 2. Have an OFFERED assignment.
  // 3. Not have another Express order blocking them.
  // 4. Not have reached overall capacity.
  // 5. Not be blocked by force-dispatch rules.
  //
  // ============================================================

  const microMotoAcceptDisabled =
    !isAssignedToMe ||
    assignmentStatus !== "OFFERED" ||
    order?.status === "ACCEPTED" ||
    hasOtherExpressOrder ||
    capacityBlocksThisOrder ||
    forceDispatchBlocksThisOrder;

  // ============================================================
  // MAXI ACCEPT BUTTON
  // ============================================================
  //
  // MAXI continues using the Offer system.
  //
  // It does NOT depend on:
  //
  // assignmentStatus === "OFFERED"
  //
  // ============================================================

  const maxiAcceptDisabled =
    order?.status === "ACCEPTED" ||
    (latestOffer && latestOffer.senderType !== "USER") ||
    numericOffer !== latestUserOfferAmount;

  // ============================================================
  // FINAL ACCEPT STATE
  // ============================================================

  const isAcceptDisabled = isMaxi
    ? maxiAcceptDisabled
    : microMotoAcceptDisabled;

  // ============================================================
  // COUNTER OFFER
  // ============================================================
  //
  // ONLY MAXI.
  //
  // ============================================================

  const isCourierTurn = !latestOffer || latestOffer.senderType === "USER";

  const isCounterDisabled = !isCourierTurn || !isBidding;

  // ============================================================
  // RESPONSIBILITY
  // ============================================================

  const formatResponsibility = (value) => {
    if (!value) {
      return "Not specified";
    }

    switch (value) {
      case "Handle Myself":
        return "Handled by sender";

      default:
        return value;
    }
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

    // ==========================================================
    // REALTIME ORDER UPDATES
    // ==========================================================

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
  //
  // This is primarily for MAXI.
  //
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
  // ============================================================

  const onAccept = async () => {
    if (!dbCourier?.id || !order?.id) {
      return;
    }

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
      // MICRO / MOTO
      // ========================================================

      if (!isMaxi) {
        // ------------------------------------------------------
        // Check current assignment
        // ------------------------------------------------------

        const assignedToMe = latestOrder.assignedCourierId === dbCourier.id;

        const assignedElsewhere =
          !!latestOrder.assignedCourierId &&
          latestOrder.assignedCourierId !== dbCourier.id;

        if (assignedElsewhere) {
          Alert.alert(
            "Order unavailable",
            "This order has already been offered to another courier.",
          );

          return;
        }

        // ------------------------------------------------------
        // Must currently be assigned to me
        // ------------------------------------------------------

        if (!assignedToMe) {
          Alert.alert(
            "Order unavailable",
            "This order is no longer assigned to you.",
          );

          return;
        }

        // ------------------------------------------------------
        // Must still be OFFERED
        // ------------------------------------------------------

        if (latestOrder.assignmentStatus !== "OFFERED") {
          Alert.alert(
            "Offer expired",
            "This delivery offer is no longer active.",
          );

          return;
        }

        // ------------------------------------------------------
        // EXPRESS CAPACITY
        //
        // If this exact order is assigned to this courier,
        // the count may already be 1 because assignOrder
        // reserved the slot.
        // ------------------------------------------------------

        const freshExpressCount = Number(freshCourier.currentExpressCount || 0);

        if (isExpress && freshExpressCount > 0 && !assignedToMe) {
          Alert.alert(
            "Express capacity",
            "You must finish your current Express delivery first.",
          );

          return;
        }

        // ------------------------------------------------------
        // TOTAL CAPACITY
        // ------------------------------------------------------

        const freshTotal =
          Number(freshCourier.currentBatchCount || 0) +
          Number(freshCourier.currentExpressCount || 0);

        if (freshTotal >= MAX_ACTIVE_ORDERS && !assignedToMe) {
          Alert.alert(
            "Maximum capacity",
            "You have reached your maximum number of active orders.",
          );

          return;
        }

        // ------------------------------------------------------
        // FORCE DISPATCH TIMER
        // ------------------------------------------------------

        const lastBatchTime = freshCourier.lastBatchAssignedAt
          ? new Date(freshCourier.lastBatchAssignedAt)
          : null;

        const exceededForceTime =
          lastBatchTime && Date.now() - lastBatchTime.getTime() > THREE_HOURS;

        if (exceededForceTime && freshTotal > 0 && !assignedToMe) {
          Alert.alert(
            "Start delivery",
            "Please start your current deliveries before accepting another order.",
          );

          return;
        }

        // ======================================================
        // ACCEPT MICRO / MOTO
        // ======================================================

        await DataStore.save(
          Order.copyOf(latestOrder, (updated) => {
            updated.status = "ACCEPTED";

            updated.acceptedAt = new Date().toISOString();

            updated.assignedCourierId = dbCourier.id;

            updated.assignmentStatus = "ACCEPTED";

            updated.hasNewOffer = false;
          }),
        );

        // ======================================================
        // DO NOT INCREMENT COURIER COUNTS HERE
        // ======================================================
        //
        // assignOrder already reserved the capacity.
        //
        // EXPRESS:
        // currentExpressCount + 1
        //
        // BATCH:
        // currentBatchCount + 1
        //
        // Incrementing again here would double-count.
        //
        // ======================================================

        router.replace("/deliveryhistory");

        return;
      }

      // ========================================================
      // MAXI
      // ========================================================
      //
      // MAXI remains completely separate from automatic
      // MICRO/MOTO dispatch.
      //
      // MAXI uses the Offer model.
      //
      // ========================================================

      // --------------------------------------------------------
      // MAXI CAPACITY
      // --------------------------------------------------------

      if (Number(freshCourier.currentMaxiCount || 0) > 0) {
        Alert.alert(
          "Current Maxi delivery",
          "You must complete your current Maxi delivery first.",
        );

        return;
      }

      // --------------------------------------------------------
      // GET FRESH MAXI OFFERS
      // --------------------------------------------------------

      const freshOffers = await DataStore.query(Offer, (item) =>
        item.orderID.eq(latestOrder.id),
      );

      const latest = [...freshOffers].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )[0];

      // --------------------------------------------------------
      // USER MUST HAVE THE CURRENT OFFER
      // --------------------------------------------------------

      if (!latest || latest.senderType !== "USER") {
        Alert.alert(
          "Offer unavailable",
          "You can only accept the user's latest offer.",
        );

        return;
      }

      const priceToAccept = latest.amount;

      // --------------------------------------------------------
      // ACCEPT MAXI ORDER
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // ACCEPT MAXI OFFER
      // --------------------------------------------------------

      await DataStore.save(
        Offer.copyOf(latest, (updated) => {
          updated.status = "ACCEPTED";
        }),
      );

      // --------------------------------------------------------
      // MAXI COUNT
      //
      // MAXI is not using the automatic dispatch
      // reservation system.
      //
      // Therefore MAXI still increments when accepted.
      // --------------------------------------------------------

      await DataStore.save(
        Courier.copyOf(freshCourier, (updated) => {
          updated.currentMaxiCount = Number(updated.currentMaxiCount || 0) + 1;
        }),
      );

      router.replace("/deliveryhistory");
    } catch (error) {
      console.error("Error accepting order:", error);

      Alert.alert("Error", "Error accepting order. Please try again.");
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
      <ActivityIndicator
        style={{
          marginTop: 100,
        }}
        size="large"
      />
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
      }}
      keyboardVerticalOffset={80}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ================================================== */}
          {/* PRICE HEADER */}
          {/* ================================================== */}

          <View
            style={[
              styles.priceCard,
              order.status === "ACCEPTED" && styles.priceCardAccepted,
            ]}
          >
            <Text
              style={[
                styles.label,
                order.status === "ACCEPTED" && styles.labelAccepted,
              ]}
            >
              {order.status === "ACCEPTED"
                ? "Final Price"
                : isMaxi
                  ? "Current Offer"
                  : "Price"}
            </Text>

            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.price,
                  order.status === "ACCEPTED" && styles.acceptedPrice,
                ]}
              >
                ₦{displayPrice ? Number(displayPrice).toLocaleString() : "---"}
              </Text>

              {order.status === "ACCEPTED" && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockBadgeText}>LOCKED</Text>
                </View>
              )}
            </View>
          </View>

          {/* ================================================== */}
          {/* MICRO / MOTO OFFER STATUS */}
          {/* ================================================== */}

          {isMicroOrMoto &&
            isCurrentlyOfferedToMe &&
            order.status !== "ACCEPTED" && (
              <View
                style={[
                  styles.acceptedBanner,
                  {
                    marginBottom: 12,
                  },
                ]}
              >
                <View style={styles.acceptedBadge}>
                  <Text style={styles.acceptedIcon}>!</Text>
                </View>

                <View>
                  <Text style={styles.acceptedTitle}>Delivery Offer</Text>

                  <Text style={styles.acceptedSubtitle}>
                    This delivery is currently offered to you.
                  </Text>
                </View>
              </View>
            )}

          {/* ================================================== */}
          {/* ORDER ACCEPTED */}
          {/* ================================================== */}

          {order.status === "ACCEPTED" && (
            <View style={styles.acceptedBanner}>
              <View style={styles.acceptedBadge}>
                <Text style={styles.acceptedIcon}>✓</Text>
              </View>

              <View>
                <Text style={styles.acceptedTitle}>Offer Accepted</Text>

                <Text style={styles.acceptedSubtitle}>
                  You have secured this delivery
                </Text>
              </View>
            </View>
          )}

          {/* ================================================== */}
          {/* SENDER */}
          {/* ================================================== */}

          <View style={styles.card}>
            <Text style={styles.section}>Sender</Text>

            <Text style={styles.text}>{user?.firstName || "Unknown"}</Text>
          </View>

          {/* ================================================== */}
          {/* ROUTE */}
          {/* ================================================== */}

          <View style={styles.card}>
            <Text style={styles.section}>Route</Text>

            <Text style={styles.text}>Trip Type: {order?.tripType}</Text>

            <Text style={styles.text}>Distance: {order?.distance}</Text>

            <Text style={styles.text}>Pickup: {order.originAddress}</Text>

            <Text style={styles.text}>Dropoff: {order.destinationAddress}</Text>

            <Text style={styles.text}>
              Transportation Type: {order?.transportationType}
            </Text>
          </View>

          {/* ================================================== */}
          {/* DISPATCH STATUS */}
          {/* ================================================== */}

          {isMicroOrMoto && order.status !== "ACCEPTED" && (
            <View style={styles.card}>
              <Text style={styles.section}>Dispatch</Text>

              {isAssignedToMe && assignmentStatus === "OFFERED" ? (
                <>
                  <Text style={styles.text}>Status: Offer received</Text>

                  <Text style={styles.text}>
                    This delivery is currently reserved for you.
                  </Text>
                </>
              ) : isAssignedToAnotherCourier ? (
                <Text style={styles.text}>
                  This delivery is currently being offered to another courier.
                </Text>
              ) : (
                <Text style={styles.text}>Waiting for dispatch.</Text>
              )}
            </View>
          )}

          {/* ================================================== */}
          {/* CARGO EVIDENCE */}
          {/* ================================================== */}

          <View style={styles.card}>
            <Text style={styles.section}>Cargo Evidence</Text>

            {order.mediaUploadStatus === "PENDING" && (
              <Text
                style={{
                  color: "#F59E0B",
                  marginBottom: 10,
                }}
              >
                Loading sender evidence...
              </Text>
            )}

            {resolvedMedia.length > 0 ? (
              <>
                {/* PHOTOS */}

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {resolvedMedia
                    .filter((item) => item.type === "photo")
                    .map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedIndex(index);

                          setPreviewVisible(true);
                        }}
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
                  >
                    <VideoThumbnail
                      uri={
                        resolvedMedia.find((item) => item.type === "video").uri
                      }
                      style={styles.videoThumbnail}
                    />

                    <View style={styles.playOverlay}>
                      <Text
                        style={{
                          color: "#FFF",
                          fontSize: 20,
                        }}
                      >
                        ▶
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              order.mediaUploadStatus !== "PENDING" && (
                <Text
                  style={{
                    color: "#6B7280",
                  }}
                >
                  No sender evidence provided
                </Text>
              )
            )}
          </View>

          {/* ================================================== */}
          {/* CARGO */}
          {/* ================================================== */}

          <View style={styles.card}>
            <Text style={styles.section}>Cargo</Text>

            <Text style={styles.text}>Description: {order.orderDetails}</Text>

            <Text style={styles.text}>
              Weight: {order?.declaredWeightBracket}
            </Text>

            <Text style={styles.text}>
              Pickup Floor: {order?.pickupFloorLevel}
            </Text>

            <Text style={styles.text}>
              Pickup Responsibility:{" "}
              {formatResponsibility(order?.pickupLoadingResponsibility)}
            </Text>

            <Text style={styles.text}>
              Dropoff Floor: {order?.dropoffFloorLevel}
            </Text>

            <Text style={styles.text}>
              Dropoff Responsibility:{" "}
              {formatResponsibility(order?.dropoffUnloadingResponsibility)}
            </Text>
          </View>

          {/* ================================================== */}
          {/* FEES */}
          {/* ================================================== */}

          <View style={styles.card}>
            <Text style={styles.section}>Fees</Text>

            <Text style={styles.text}>
              Loading: ₦{Number(order.loadingFee || 0).toLocaleString()}
            </Text>

            <Text style={styles.text}>
              Unloading: ₦{Number(order.unloadingFee || 0).toLocaleString()}
            </Text>
          </View>

          {/* ================================================== */}
          {/* MAXI OFFER */}
          {/* ================================================== */}
          {/*
            IMPORTANT:
            This entire section is ONLY for MAXI.

            MAXI is a marketplace/bidding flow.

            MAXI does NOT use assignmentStatus
            to determine whether the courier can
            counter or accept an offer.

            MAXI uses the existing Offer model.
          */}

          {isMaxi && (
            <View style={styles.offerBox}>
              <Text style={styles.section}>Your Offer</Text>

              <View style={styles.offerControl}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() =>
                    setOffer((previous) => {
                      const value = Number(previous) || minPrice;

                      return Math.max(minPrice, value - 1000).toString();
                    })
                  }
                >
                  <Text style={styles.adjustText}>-</Text>
                </TouchableOpacity>

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

                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() =>
                    setOffer((previous) => {
                      const value = Number(previous) || minPrice;

                      return Math.min(maxPrice, value + 1000).toString();
                    })
                  }
                >
                  <Text style={styles.adjustText}>+</Text>
                </TouchableOpacity>
              </View>

              {numericOffer < minPrice || numericOffer > maxPrice ? (
                <Text style={styles.feedBack}>
                  Offer must be between ₦
                  {Number(minPrice || 0).toLocaleString()} and ₦
                  {Number(maxPrice || 0).toLocaleString()}
                </Text>
              ) : null}

              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.counterBtn,
                    isCounterDisabled && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();

                    setIsEditing(false);

                    onSendOffer(Number(offer));
                  }}
                  disabled={isCounterDisabled}
                >
                  <Text style={styles.btnText}>Counter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.acceptBtn,
                    isAcceptDisabled && styles.buttonDisabled,
                  ]}
                  onPress={onAccept}
                  disabled={isAcceptDisabled}
                >
                  <Text style={styles.btnText}>
                    {isAcceptDisabled ? "Accept (disabled)" : "Accept"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================================================== */}
          {/* MICRO / MOTO ACCEPT */}
          {/* ================================================== */}

          {isMicroOrMoto && order.status !== "ACCEPTED" && (
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.acceptBtn,
                  isAcceptDisabled && styles.buttonDisabled,
                ]}
                onPress={onAccept}
                disabled={isAcceptDisabled}
              >
                <Text style={styles.btnText}>
                  {!isAssignedToMe
                    ? "Not assigned"
                    : assignmentStatus !== "OFFERED"
                      ? "Offer expired"
                      : hasOtherExpressOrder
                        ? "Finish express delivery first"
                        : capacityBlocksThisOrder
                          ? "Complete deliveries first"
                          : forceDispatchBlocksThisOrder
                            ? "Start delivery first"
                            : "Accept"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ================================================== */}
        {/* MEDIA MODAL */}
        {/* ================================================== */}

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
