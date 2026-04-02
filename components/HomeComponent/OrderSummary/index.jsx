import { Order, User } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import { getUrl } from "aws-amplify/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [offer, setOffer] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [resolvedMedia, setResolvedMedia] = useState([]);

  // ✅ ONLY S3 MEDIA
  const mediaList = resolvedMedia;

  const minPrice = order?.estimatedMinPrice;
  const maxPrice = order?.estimatedMaxPrice;

  const displayPrice = order?.currentOfferPrice ?? order?.courierEarnings;

  const numericOffer = Number(offer);

  // ✅ Fetch order + user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedOrder = await DataStore.query(Order, orderId);

        if (!fetchedOrder) return;

        setOrder(fetchedOrder);
        setOffer(fetchedOrder.currentOfferPrice?.toString() || "");

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
        setOffer(msg.element.currentOfferPrice?.toString() || "");

        if (msg.element.userID) {
          const updatedUser = await DataStore.query(User, msg.element.userID);
          setUser(updatedUser);
        }
      }
    });

    return () => sub.unsubscribe();
  }, [orderId]);

  // ✅ Send Counter Offer
  const onSendOffer = async (price) => {
    if (!price || price <= 0) return;

    if (price < minPrice || price > maxPrice) {
      alert("Offer must be within allowed range");
      return;
    }

    await DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.currentOfferPrice = price;
        updated.lastOfferBy = "COURIER";
      }),
    );
  };

  // ✅ Accept Offer
  const onAccept = async () => {
    const price = Number(offer);

    if (!price || price <= 0) return;

    if (price < minPrice || price > maxPrice) {
      alert("Offer must be within allowed range");
      return;
    }

    await DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "ACCEPTED";
        updated.totalPrice = price;
      }),
    );
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
          <View style={styles.priceCard}>
            <Text style={styles.label}>Current Offer</Text>

            <Text style={styles.price}>
              ₦{displayPrice?.toLocaleString() || "---"}
            </Text>
          </View>

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
              Dropoff Floor: {order?.dropoffFloorLevel}
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
                onPress={() => onSendOffer(Number(offer))}
              >
                <Text style={styles.btnText}>Counter</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
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
