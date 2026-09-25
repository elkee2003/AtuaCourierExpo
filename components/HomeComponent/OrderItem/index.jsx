import { Offer } from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import styles from "./styles";

const OrderItem = ({ order, onRemoveOrder, onSelect }) => {
  const [latestOffer, setLatestOffer] = useState(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);

  // ============================================================
  // ORDER TYPE
  // ============================================================

  const transportationType = order?.transportationType;

  const isMaxi = transportationType === "MAXI";

  const isMicro =
    transportationType === "MICRO_EXPRESS" ||
    transportationType === "MICRO_BATCH";

  const isMoto =
    transportationType === "MOTO_EXPRESS" ||
    transportationType === "MOTO_BATCH";

  const isMicroOrMoto = isMicro || isMoto;

  const isExpress =
    transportationType === "MICRO_EXPRESS" ||
    transportationType === "MOTO_EXPRESS";

  const isBatch =
    transportationType === "MICRO_BATCH" || transportationType === "MOTO_BATCH";

  // ============================================================
  // SERVICE NAME
  // ============================================================

  const serviceTitle = useMemo(() => {
    switch (transportationType) {
      case "MICRO_EXPRESS":
        return "Micro Express";

      case "MICRO_BATCH":
        return "Micro Batch";

      case "MOTO_EXPRESS":
        return "Moto Express";

      case "MOTO_BATCH":
        return "Moto Batch";

      case "MAXI":
        return "Maxi Delivery";

      default:
        return transportationType
          ? transportationType.replace(/_/g, " ")
          : "Delivery";
    }
  }, [transportationType]);

  // ============================================================
  // SERVICE DESCRIPTION
  // ============================================================

  const serviceDescription = useMemo(() => {
    if (isExpress) {
      return "Priority delivery";
    }

    if (isBatch) {
      return "Batch delivery";
    }

    if (isMaxi) {
      return "Large-item delivery";
    }

    return "Delivery request";
  }, [isExpress, isBatch, isMaxi]);

  // ============================================================
  // SERVICE ICON
  // ============================================================

  const serviceIcon = useMemo(() => {
    if (isMicro) {
      return "bicycle";
    }

    if (isMoto) {
      return "motorcycle";
    }

    if (isMaxi) {
      return "truck";
    }

    return "road";
  }, [isMicro, isMoto, isMaxi]);

  // ============================================================
  // DISPLAY PRICE
  //
  // MICRO / MOTO
  // ----------------
  // Use Atua's courier earnings.
  //
  // MAXI
  // ----
  // Continue using the latest offer when available.
  // ============================================================

  const displayPrice = useMemo(() => {
    if (isMaxi) {
      return (
        latestOffer?.amount ??
        order?.courierEarnings ??
        order?.initialOfferPrice ??
        order?.totalPrice
      );
    }

    return (
      order?.courierEarnings ?? order?.initialOfferPrice ?? order?.totalPrice
    );
  }, [
    isMaxi,
    latestOffer?.amount,
    order?.courierEarnings,
    order?.initialOfferPrice,
    order?.totalPrice,
  ]);

  // ============================================================
  // PRICE FORMAT
  // ============================================================

  const formattedPrice = useMemo(() => {
    if (
      displayPrice === undefined ||
      displayPrice === null ||
      displayPrice === ""
    ) {
      return "---";
    }

    const numericPrice = Number(displayPrice);

    if (Number.isNaN(numericPrice)) {
      return String(displayPrice);
    }

    return numericPrice.toLocaleString();
  }, [displayPrice]);

  // ============================================================
  // DISTANCE
  //
  // This is only presentation.
  //
  // Marketplace radius filtering remains handled by the parent.
  // ============================================================

  const formattedDistance = useMemo(() => {
    const value =
      order?.distance ?? order?.distanceKm ?? order?.estimatedDistance;

    if (value === undefined || value === null || value === "") {
      return null;
    }

    const numericDistance = Number(value);

    if (Number.isNaN(numericDistance)) {
      return null;
    }

    if (numericDistance < 10) {
      return `${numericDistance.toFixed(1)} km`;
    }

    return `${Math.round(numericDistance)} km`;
  }, [order?.distance, order?.distanceKm, order?.estimatedDistance]);

  // ============================================================
  // MAXI VEHICLE CLASS
  // ============================================================

  const vehicleClass = useMemo(() => {
    if (!isMaxi || !order?.vehicleClass) {
      return null;
    }

    return String(order.vehicleClass)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }, [isMaxi, order?.vehicleClass]);

  // ============================================================
  // MAXI OFFER
  //
  // Micro/Moto do NOT use Offer records.
  // Maxi keeps the existing bidding system.
  // ============================================================

  useEffect(() => {
    if (!isMaxi || !order?.id) {
      setLatestOffer(null);
      setIsLoadingOffer(false);
      return;
    }

    let mounted = true;

    const fetchLatestOffer = async () => {
      try {
        setIsLoadingOffer(true);

        const result = await DataStore.query(Offer, (o) =>
          o.orderID.eq(order.id),
        );

        if (!mounted) {
          return;
        }

        if (result.length > 0) {
          const sorted = [...result].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );

          setLatestOffer(sorted[0]);
        } else {
          setLatestOffer(null);
        }
      } catch (error) {
        console.error("Error fetching latest Maxi offer:", error);

        if (mounted) {
          setLatestOffer(null);
        }
      } finally {
        if (mounted) {
          setIsLoadingOffer(false);
        }
      }
    };

    fetchLatestOffer();

    const subscription = DataStore.observe(Offer).subscribe((msg) => {
      if (!mounted) {
        return;
      }

      if (msg.element?.orderID === order.id) {
        fetchLatestOffer();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [order?.id, isMaxi]);

  // ============================================================
  // OPEN ORDER
  // ============================================================

  const handleSelect = () => {
    if (!order) {
      return;
    }

    onSelect(order);
  };

  // ============================================================
  // REMOVE ORDER
  // ============================================================

  const handleRemove = () => {
    if (!order?.id) {
      return;
    }

    onRemoveOrder(order.id);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.wrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={handleSelect}
        activeOpacity={0.94}
      >
        {/* ======================================================
            HEADER
            ====================================================== */}

        <View style={styles.header}>
          {/* SERVICE IDENTITY */}
          <View style={styles.serviceSection}>
            <View style={styles.serviceIcon}>
              <FontAwesome name={serviceIcon} size={17} color="#FFFFFF" />
            </View>

            <View style={styles.serviceInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.serviceTitle}>{serviceTitle}</Text>

                {isExpress && (
                  <View style={styles.expressBadge}>
                    <Text style={styles.expressText}>EXPRESS</Text>
                  </View>
                )}

                {isBatch && (
                  <View style={styles.batchBadge}>
                    <Text style={styles.batchText}>BATCH</Text>
                  </View>
                )}
              </View>

              <Text style={styles.serviceDescription}>
                {serviceDescription}
              </Text>
            </View>
          </View>

          {/* EARNINGS */}
          <View style={styles.earningsSection}>
            <Text style={styles.earningsLabel}>
              {isMaxi ? "CURRENT OFFER" : "YOU EARN"}
            </Text>

            {isMaxi && isLoadingOffer ? (
              <ActivityIndicator
                size="small"
                color="#111111"
                style={styles.offerLoader}
              />
            ) : (
              <Text style={styles.earningsAmount}>₦{formattedPrice}</Text>
            )}
          </View>
        </View>

        {/* ======================================================
            ROUTE
            ====================================================== */}

        <View style={styles.routeCard}>
          {/* PICKUP */}
          <View style={styles.locationRow}>
            <View style={styles.routeIndicator}>
              <View style={styles.pickupMarker} />
              <View style={styles.routeConnector} />
            </View>

            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>PICKUP</Text>

              <Text style={styles.locationAddress} numberOfLines={2}>
                {order?.originAddress || "Pickup location unavailable"}
              </Text>
            </View>
          </View>

          {/* DROPOFF */}
          <View style={styles.locationRow}>
            <View style={styles.routeIndicator}>
              <View style={styles.dropoffMarker}>
                <View style={styles.dropoffInner} />
              </View>
            </View>

            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>DROPOFF</Text>

              <Text style={styles.locationAddress} numberOfLines={2}>
                {order?.destinationAddress || "Dropoff location unavailable"}
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================
            INFORMATION STRIP
            ====================================================== */}

        <View style={styles.infoStrip}>
          {formattedDistance && (
            <Animated.View
              entering={FadeInRight.duration(300)}
              style={styles.infoItem}
            >
              <FontAwesome name="map-marker" size={11} color="#666666" />

              <Text style={styles.infoText}>{formattedDistance}</Text>
            </Animated.View>
          )}

          <View style={styles.infoItem}>
            <FontAwesome name="cube" size={11} color="#666666" />

            <Text style={styles.infoText}>
              {isExpress
                ? "Direct"
                : isBatch
                  ? "Multiple deliveries"
                  : "Delivery"}
            </Text>
          </View>

          {vehicleClass && (
            <View style={styles.infoItem}>
              <FontAwesome name="truck" size={11} color="#666666" />

              <Text style={styles.infoText}>{vehicleClass}</Text>
            </View>
          )}
        </View>

        {/* ======================================================
            FOOTER
            ====================================================== */}

        <View style={styles.footer}>
          {/* AVAILABILITY */}
          <View style={styles.availability}>
            <View style={styles.liveIndicator} />

            <Text style={styles.availableText}>Available now</Text>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            {/* REMOVE */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemove}
              activeOpacity={0.7}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <FontAwesome name="times" size={13} color="#666666" />
            </TouchableOpacity>

            {/* VIEW */}
            <TouchableOpacity
              style={styles.viewButton}
              onPress={handleSelect}
              activeOpacity={0.82}
            >
              <Text style={styles.viewButtonText}>View details</Text>

              <View style={styles.arrowCircle}>
                <FontAwesome name="angle-right" size={14} color="#111111" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OrderItem;
