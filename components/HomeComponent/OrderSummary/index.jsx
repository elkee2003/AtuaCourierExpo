import { useAuthContext } from "@/providers/AuthProvider";
import { Courier, Offer, Order, User } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import { getUrl } from "aws-amplify/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

// This code is meant to be where courier is marking completion of orders. For couriers that finished their orders manually, which will not warant the lambda function to be triggered. we would need to update the fields in Courier model. Note that I have already fixed this with resetCourierIfIdle lambda
// updated.currentBatchCount = 0;
// updated.currentExpressCount = 0;
// updated.lastBatchAssignedAt = null;

const OrderSummary = ({ orderId }) => {
  const { dbCourier } = useAuthContext();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [courier, setCourier] = useState(null);
  const [offer, setOffer] = useState("");
  const [offers, setOffers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [resolvedMedia, setResolvedMedia] = useState([]);

  const hasActiveExpressOrder = (courier?.currentExpressCount || 0) > 0;

  const isMaxi = order?.transportationType === "MAXI";

  // ✅ ONLY S3 MEDIA
  const mediaList = resolvedMedia;

  const minPrice = order?.estimatedMinPrice;
  const maxPrice = order?.estimatedMaxPrice;

  const latestOffer = [...offers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )[0];

  const displayPrice = isMaxi
    ? (latestOffer?.amount ?? order?.initialOfferPrice)
    : order?.courierEarnings;

  const numericOffer = Number(offer);

  const latestUserOfferAmount =
    latestOffer?.senderType === "USER"
      ? latestOffer.amount
      : order?.initialOfferPrice;

  // Disable Accept if:
  // 1. Order already accepted
  // 2. Latest offer not from user
  // 3. Courier modified the offer (doesn't match latest user offer)
  // 3. Courier already has an EXPRESS order
  const isAcceptDisabled = isMaxi
    ? order?.status === "ACCEPTED" ||
      (latestOffer && latestOffer.senderType !== "USER") ||
      numericOffer !== latestUserOfferAmount ||
      hasActiveExpressOrder
    : order?.status === "ACCEPTED" || hasActiveExpressOrder;

  // Total Courier accepted orders
  const courierTotal =
    (courier?.currentBatchCount || 0) + (courier?.currentExpressCount || 0);

  const isBlocked =
    courierTotal >= 10 ||
    (courier?.lastBatchAssignedAt &&
      new Date() - new Date(courier.lastBatchAssignedAt) > 3 * 60 * 60 * 1000);

  // conversion for 'Handle Myself'
  const formatResponsibility = (value) => {
    if (!value) return "Not specified";

    switch (value) {
      case "Handle Myself":
        return "Handled by sender";
      default:
        return value;
    }
  };

  // To fetch couriers
  useEffect(() => {
    const fetchCourier = async () => {
      if (!dbCourier?.id) return;

      const c = await DataStore.query(Courier, dbCourier.id);
      setCourier(c);
    };

    fetchCourier();

    const sub = DataStore.observe(Courier, dbCourier.id).subscribe((msg) => {
      if (msg.opType === "UPDATE") {
        setCourier(msg.element);
      }
    });

    return () => sub.unsubscribe();
  }, [dbCourier]);

  // ✅ Fetch order + user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedOrder = await DataStore.query(Order, orderId);

        if (!fetchedOrder) return;

        setOrder(fetchedOrder);

        // fetch user
        if (fetchedOrder.userID) {
          const fetchedUser = await DataStore.query(User, fetchedOrder.userID);
          setUser(fetchedUser);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // ✅ realtime updates
    const sub = DataStore.observe(Order, orderId).subscribe(async (msg) => {
      if (msg.opType === "UPDATE") {
        setOrder(msg.element);

        if (msg.element.userID) {
          const updatedUser = await DataStore.query(User, msg.element.userID);
          setUser(updatedUser);
        }
      }
    });

    return () => sub.unsubscribe();
  }, [orderId]);

  // useEffect for Offer
  useEffect(() => {
    const fetchOffers = async () => {
      const result = await DataStore.query(Offer, (o) => o.orderID.eq(orderId));
      setOffers(result);
    };

    fetchOffers();

    const sub = DataStore.observe(Offer).subscribe((msg) => {
      if (msg.element.orderID === orderId) {
        fetchOffers();
      }
    });

    return () => sub.unsubscribe();
  }, [orderId]);

  // useEffect for setting latest offerPrice
  useEffect(() => {
    if (!order || isEditing) return;

    const basePrice = latestOffer?.amount ?? order.initialOfferPrice;

    setOffer(basePrice?.toString() || "");
  }, [order, latestOffer, isEditing]);

  // ✅ Send Counter Offer
  const onSendOffer = async (price) => {
    if (!price || price <= 0) return;

    if (price < minPrice || price > maxPrice) {
      alert("Offer must be within allowed range");
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
    setOffer("");
  };

  // ✅ Accept Offer
  const onAccept = async () => {
    const courier = await DataStore.query(Courier, dbCourier.id);

    // if express delivery prevent from accepting more orders
    if ((courier.currentExpressCount || 0) > 0) {
      alert("You must finish your express delivery first.");
      return;
    }

    // To check total number of orders accepted
    const total =
      (courier.currentBatchCount || 0) + (courier.currentExpressCount || 0);

    if (total >= 10) {
      alert("Maximum number of orders reached. Please start delivery.");
      return;
    }

    // ⏱️ FORCE DISPATCH TIMER CHECK
    const lastBatchTime = new Date(courier.lastBatchAssignedAt || 0);
    const now = new Date();

    const THREE_HOURS = 3 * 60 * 60 * 1000;

    const exceededTime = now - lastBatchTime > THREE_HOURS;

    if (exceededTime && total > 0) {
      alert("You have pending deliveries. Please start delivery.");
      return;
    }

    if (order.status === "ACCEPTED") {
      alert("Order already taken");
      return;
    }

    try {
      if (isMaxi) {
        // ✅ existing bidding logic
        let priceToAccept;
        let offerToAccept = null;

        if (!latestOffer) {
          priceToAccept = order.initialOfferPrice;
        } else {
          if (latestOffer.senderType !== "USER") {
            alert("You can only accept user's latest offer");
            return;
          }

          priceToAccept = latestOffer.amount;
          offerToAccept = latestOffer;
        }

        await DataStore.save(
          Order.copyOf(order, (updated) => {
            updated.status = "ACCEPTED";
            updated.totalPrice = priceToAccept;
            updated.acceptedOfferID = offerToAccept?.id;
            updated.assignedCourierId = dbCourier.id;
          }),
        );

        if (offerToAccept) {
          await DataStore.save(
            Offer.copyOf(offerToAccept, (updated) => {
              updated.status = "ACCEPTED";
            }),
          );
        }
      } else {
        // ✅ MICRO / MOTO simple accept
        await DataStore.save(
          Order.copyOf(order, (updated) => {
            updated.status = "ACCEPTED";
            updated.assignedCourierId = dbCourier.id;
          }),
        );

        await DataStore.save(
          Courier.copyOf(courier, (updated) => {
            if (!updated.lastBatchAssignedAt) {
              updated.lastBatchAssignedAt = new Date().toISOString();
            }

            if (order.transportationType.includes("EXPRESS")) {
              updated.currentExpressCount =
                (updated.currentExpressCount || 0) + 1;
            } else {
              updated.currentBatchCount = (updated.currentBatchCount || 0) + 1;
            }
          }),
        );
      }
    } catch (e) {
      alert("Error accepting order");
    }
  };

  // useEffect for Media
  useEffect(() => {
    if (!order) return;

    const resolveMedia = async () => {
      try {
        const photos = await Promise.all(
          (order.senderPreTransferPhotos || []).map(async (key) => {
            const { url } = await getUrl({
              path: key,
              options: { validateObjectExistence: true },
            });
            return { uri: url.toString(), type: "photo" };
          }),
        );

        let video = [];

        if (order.senderPreTransferVideo) {
          const v = order.senderPreTransferVideo;

          if (v.startsWith("http")) {
            video = [{ uri: v, type: "video" }];
          } else {
            const { url } = await getUrl({
              path: v,
              options: { validateObjectExistence: true },
            });

            video = [{ uri: url.toString(), type: "video" }];
          }
        }

        setResolvedMedia([...photos, ...video]);
      } catch (e) {
        console.log("Media resolve error:", e);
      }
    };

    resolveMedia();
  }, [order]);

  if (loading || !order) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80} // tweak if needed
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 🔥 PRICE HEADER */}
          <View
            style={[
              styles.priceCard,
              order?.status === "ACCEPTED" && styles.priceCardAccepted,
            ]}
          >
            <Text
              style={[
                styles.label,
                order?.status === "ACCEPTED" && styles.labelAccepted,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  order?.status === "ACCEPTED" && styles.labelAccepted,
                ]}
              >
                {order?.status === "ACCEPTED"
                  ? "Final Price"
                  : isMaxi
                    ? "Current Offer"
                    : "Price"}
              </Text>
            </Text>

            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.price,
                  order?.status === "ACCEPTED" && styles.acceptedPrice,
                ]}
              >
                ₦{displayPrice?.toLocaleString() || "---"}
              </Text>

              {order?.status === "ACCEPTED" && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockBadgeText}>LOCKED</Text>
                </View>
              )}
            </View>

            {/* <Text style={styles.price}>
              ₦{displayPrice?.toLocaleString() || "---"}
            </Text> */}
          </View>

          {/* Show if Order is Accepted */}
          {order?.status === "ACCEPTED" && (
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

          {/* 👤 SENDER */}
          <View style={styles.card}>
            <Text style={styles.section}>Sender</Text>
            <Text style={styles.text}>{user?.firstName || "Unknown"}</Text>
          </View>

          {/* 📍 ROUTE */}
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

          {/* CARGO EVIDENCE  */}
          <View style={styles.card}>
            <Text style={styles.section}>Cargo Evidence</Text>

            {order?.mediaUploadStatus === "PENDING" && (
              <Text style={{ color: "#F59E0B", marginBottom: 10 }}>
                Loading sender evidence...
              </Text>
            )}

            {mediaList.length > 0 ? (
              <>
                {/* PHOTOS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {mediaList
                    .filter((m) => m.type === "photo")
                    .map((m, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedIndex(index);
                          setPreviewVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: m.uri }}
                          style={styles.previewImage}
                        />
                      </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* VIDEO */}
                {mediaList.find((m) => m.type === "video") && (
                  <TouchableOpacity
                    style={styles.videoPreview}
                    onPress={() => {
                      const videoIndex = mediaList.filter(
                        (m) => m.type === "photo",
                      ).length;

                      setSelectedIndex(videoIndex);
                      setPreviewVisible(true);
                    }}
                  >
                    <VideoThumbnail
                      uri={mediaList.find((m) => m.type === "video").uri}
                      style={styles.videoThumbnail}
                    />
                    <View style={styles.playOverlay}>
                      <Text style={{ color: "#FFF", fontSize: 20 }}>▶</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              order?.mediaUploadStatus !== "PENDING" && (
                <Text style={{ color: "#6B7280" }}>
                  No sender evidence provided
                </Text>
              )
            )}
          </View>

          {/* 📦 CARGO */}
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

          {/* 💰 FEES */}
          <View style={styles.card}>
            <Text style={styles.section}>Fees</Text>
            <Text style={styles.text}>
              Loading: ₦{order.loadingFee?.toLocaleString()}
            </Text>
            <Text style={styles.text}>
              Unloading: ₦{order.unloadingFee?.toLocaleString()}
            </Text>
          </View>

          {/* 💸 OFFER SECTION */}
          {isMaxi && (
            <View style={styles.offerBox}>
              <Text style={styles.section}>Your Offer</Text>

              <View style={styles.offerControl}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() =>
                    setOffer((prev) => {
                      const value = Number(prev) || minPrice;
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
                    const num = Number(value);

                    if (value === "") {
                      setOffer("");
                      return;
                    }

                    setOffer(num.toString());
                  }}
                />

                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() =>
                    setOffer((prev) => {
                      const value = Number(prev) || minPrice;
                      return Math.min(maxPrice, value + 1000).toString();
                    })
                  }
                >
                  <Text style={styles.adjustText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Feeback */}
              {numericOffer < minPrice || numericOffer > maxPrice ? (
                <Text style={styles.feedBack}>
                  Offer must be between ₦{minPrice?.toLocaleString()} and ₦
                  {maxPrice?.toLocaleString()}
                </Text>
              ) : null}

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsEditing(false);
                    onSendOffer(Number(offer));
                  }}
                >
                  <Text style={styles.btnText}>Counter</Text>
                </TouchableOpacity>

                {/* if offer price isn't what was offered by user, disable Accept button, to prevent courier from increasing or reducing price and then accepting. Make sure to do same with user app */}
                <TouchableOpacity
                  style={[
                    styles.acceptBtn,
                    (isAcceptDisabled || isBlocked) && styles.buttonDisabled,
                  ]}
                  onPress={onAccept}
                  disabled={isAcceptDisabled || isBlocked}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isAcceptDisabled && styles.buttonDisabledText,
                    ]}
                  >
                    {isBlocked
                      ? "Complete deliveries first"
                      : isAcceptDisabled
                        ? "Accept (disabled)"
                        : "Accept"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isMaxi && order.status !== "ACCEPTED" && (
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.acceptBtn,
                  (isAcceptDisabled || isBlocked) && styles.buttonDisabled,
                ]}
                onPress={onAccept}
                disabled={isAcceptDisabled || isBlocked}
              >
                <Text style={styles.btnText}>
                  {hasActiveExpressOrder
                    ? "Finish express delivery first"
                    : isBlocked
                      ? "Complete deliveries first"
                      : "Accept"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <MediaPreviewModal
          visible={previewVisible}
          mediaList={mediaList}
          initialIndex={selectedIndex}
          onClose={() => setPreviewVisible(false)}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default OrderSummary;
