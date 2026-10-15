import { useAuthContext } from "@/providers/AuthProvider";
import { useOrderContext } from "@/providers/OrderProvider";
import { Courier, CourierLiveLocation } from "@/src/models";

import Feather from "@expo/vector-icons/Feather";
import { DataStore } from "aws-amplify/datastore";
import * as Location from "expo-location";

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import MapViewDirections from "react-native-maps-directions";

import { GOOGLE_API_KEY } from "../../../keys";
import styles from "./styles";

// ======================================================
// DISTANCE CALCULATION HELPERS
// ======================================================
// Calculates the shortest distance in metres between the
// courier's GPS position and the nearest segment of the
// Google Directions route, used for off-route detection.
//
// Also calculates the straight-line distance in metres
// between two GPS coordinates, used to determine whether
// the courier is close enough to the active pickup or
// drop-off location.
// ======================================================
const distanceToRouteMeters = (point, routeCoordinates) => {
  if (
    !point ||
    !Array.isArray(routeCoordinates) ||
    routeCoordinates.length < 2
  ) {
    return Infinity;
  }

  const R = 6371000;
  const lat0 = (point.latitude * Math.PI) / 180;
  const toXY = ({ latitude, longitude }) => ({
    x: R * ((longitude * Math.PI) / 180) * Math.cos(lat0),
    y: R * ((latitude * Math.PI) / 180),
  });

  const p = toXY(point);
  let minDistance = Infinity;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const a = toXY(routeCoordinates[i]);
    const b = toXY(routeCoordinates[i + 1]);

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;

    const t =
      lengthSquared === 0
        ? 0
        : Math.max(
            0,
            Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared),
          );

    const nearestX = a.x + t * dx;
    const nearestY = a.y + t * dy;

    const distance = Math.hypot(p.x - nearestX, p.y - nearestY);

    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
};

const distanceBetweenCoordinatesMeters = (pointA, pointB) => {
  if (!pointA || !pointB) return Infinity;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371000;

  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * ============================================================
 * ORDER DELIVERY MAP
 * ============================================================
 *
 * Responsibilities:
 *
 * 1. Get the courier's current GPS location.
 * 2. Keep the local map location updated.
 * 3. Move the camera to follow the courier.
 * 4. Save the location to CourierLiveLocation.
 * 5. Keep Courier.lat/lng/heading as legacy fallback fields.
 * 6. Display the route to pickup or dropoff.
 * 7. Calculate courier proximity.
 *
 * Location priority:
 *
 * PRIMARY:
 * CourierLiveLocation
 *
 * FALLBACK:
 * Courier.lat
 * Courier.lng
 * Courier.heading
 *
 * The local `location` state contains the latest GPS position
 * received from the courier's device and is used to control
 * the courier's own map camera.
 * ============================================================
 */

const OrderDeliveryMap = ({ order, user, onMapReady }) => {
  const { width, height } = useWindowDimensions();

  const [errorMsg, setErrorMsg] = useState(null);

  // Current route geometry returned by Google Directions.
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Starting point for the currently displayed route.
  // This changes only on initialisation, destination changes,
  // or a confirmed off-route event.
  const [routeOrigin, setRouteOrigin] = useState(null);

  // Incrementing this forces MapViewDirections to recalculate.
  const [rerouteKey, setRerouteKey] = useState(0);

  // Prevents repeated reroutes while a new route is being fetched.
  const [isRerouting, setIsRerouting] = useState(false);

  // Consecutive off-route GPS readings.
  const offRouteCountRef = useRef(0);

  // Timestamp of the last reroute.
  const lastRerouteAtRef = useRef(0);

  const previousDestinationKeyRef = useRef(null);

  const {
    mapRef,
    setTotalKm,
    setTotalMins,
    setIsCourierClose,
    isPickedUp,
    location,
    setLocation,
  } = useOrderContext();

  const { dbCourier } = useAuthContext();

  // Before pickup, route to pickup.
  // After pickup, route to drop-off.
  const destination = isPickedUp
    ? {
        latitude: Number(order.destinationLat),
        longitude: Number(order.destinationLng),
      }
    : {
        latitude: Number(order.originLat),
        longitude: Number(order.originLng),
      };

  const hasValidDestination =
    (isPickedUp
      ? order.destinationLat != null &&
        order.destinationLat !== "" &&
        order.destinationLng != null &&
        order.destinationLng !== ""
      : order.originLat != null &&
        order.originLat !== "" &&
        order.originLng != null &&
        order.originLng !== "") &&
    Number.isFinite(destination.latitude) &&
    Number.isFinite(destination.longitude);

  const hasValidOrigin =
    order.originLat != null &&
    order.originLat !== "" &&
    order.originLng != null &&
    order.originLng !== "" &&
    Number.isFinite(Number(order.originLat)) &&
    Number.isFinite(Number(order.originLng));

  const hasValidDropoff =
    order.destinationLat != null &&
    order.destinationLat !== "" &&
    order.destinationLng != null &&
    order.destinationLng !== "" &&
    Number.isFinite(Number(order.destinationLat)) &&
    Number.isFinite(Number(order.destinationLng));

  const destinationKey = hasValidDestination
    ? `${order.id}:${isPickedUp ? "dropoff" : "pickup"}:${destination.latitude}:${destination.longitude}`
    : null;

  /**
   * ============================================================
   * SAVE LOCATION TO COURIERLIVELOCATION
   * ============================================================
   *
   * CourierLiveLocation is the primary location record.
   *
   * Courier.lat / Courier.lng / Courier.heading are maintained
   * only as legacy fallback values for older screens/components.
   * ============================================================
   */
  useEffect(() => {
    if (!location || !dbCourier?.id) {
      return;
    }

    let isMounted = true;

    const saveCourierLocation = async () => {
      try {
        const latitude = Number(location.latitude);
        const longitude = Number(location.longitude);
        const heading = Number(location.heading);
        const speed = Number(location.speed);
        const accuracy = Number(location.accuracy);
        const altitude = Number(location.altitude);

        /**
         * --------------------------------------------------------
         * VALIDATE COORDINATES
         * --------------------------------------------------------
         */
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          console.log("Invalid courier coordinates:", {
            latitude,
            longitude,
          });

          return;
        }

        const nowIso = new Date().toISOString();

        /**
         * --------------------------------------------------------
         * FIND EXISTING LIVE LOCATION
         * --------------------------------------------------------
         *
         * First, use Courier.liveLocationID.
         *
         * If the relationship ID is missing or invalid, search
         * for a live-location record using courierID.
         *
         * This helps prevent duplicate live-location records.
         * --------------------------------------------------------
         */
        let liveLocation = null;

        if (dbCourier.liveLocationID) {
          liveLocation = await DataStore.query(
            CourierLiveLocation,
            dbCourier.liveLocationID,
          );
        }

        if (!liveLocation) {
          const courierLocations = await DataStore.query(
            CourierLiveLocation,
            (record) => record.courierID.eq(dbCourier.id),
          );

          /**
           * Use the newest live-location record.
           */
          liveLocation = [...courierLocations].sort(
            (a, b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0),
          )[0];
        }

        /**
         * --------------------------------------------------------
         * CREATE NEW COURIERLIVELOCATION
         * --------------------------------------------------------
         */
        if (!liveLocation) {
          const newLiveLocation = await DataStore.save(
            new CourierLiveLocation({
              courierID: dbCourier.id,

              /**
               * PRIMARY LIVE LOCATION VALUES
               */
              latitude,
              longitude,

              /**
               * Optional GPS metadata.
               *
               * These are assigned only when they contain valid
               * numeric values.
               */
              ...(Number.isFinite(heading) && {
                heading,
              }),

              ...(Number.isFinite(speed) && {
                speed,
              }),

              ...(Number.isFinite(accuracy) && {
                accuracy,
              }),

              ...(Number.isFinite(altitude) && {
                altitude,
              }),

              isTracking: true,
              trackingSource: "FOREGROUND",
              lastSeenAt: nowIso,
            }),
          );

          if (!isMounted) {
            return;
          }

          /**
           * ------------------------------------------------------
           * CONNECT LIVE LOCATION TO COURIER
           * ------------------------------------------------------
           */
          await DataStore.save(
            Courier.copyOf(dbCourier, (updatedCourier) => {
              updatedCourier.liveLocationID = newLiveLocation.id;

              /**
               * Legacy fallback fields.
               */
              updatedCourier.lat = latitude;
              updatedCourier.lng = longitude;

              if (Number.isFinite(heading)) {
                updatedCourier.heading = heading;
              }
            }),
          );

          console.log("Created CourierLiveLocation:", {
            id: newLiveLocation.id,
            courierID: dbCourier.id,
            latitude,
            longitude,
          });

          return;
        }

        /**
         * --------------------------------------------------------
         * UPDATE EXISTING COURIERLIVELOCATION
         * --------------------------------------------------------
         */
        await DataStore.save(
          CourierLiveLocation.copyOf(liveLocation, (updatedLocation) => {
            /**
             * PRIMARY LOCATION VALUES
             */
            updatedLocation.latitude = latitude;
            updatedLocation.longitude = longitude;

            /**
             * GPS metadata.
             */
            if (Number.isFinite(heading)) {
              updatedLocation.heading = heading;
            }

            if (Number.isFinite(speed)) {
              updatedLocation.speed = speed;
            }

            if (Number.isFinite(accuracy)) {
              updatedLocation.accuracy = accuracy;
            }

            if (Number.isFinite(altitude)) {
              updatedLocation.altitude = altitude;
            }

            /**
             * Tracking metadata.
             */
            updatedLocation.isTracking = true;
            updatedLocation.trackingSource = "FOREGROUND";
            updatedLocation.lastSeenAt = nowIso;
          }),
        );

        /**
         * --------------------------------------------------------
         * UPDATE LEGACY COURIER FIELDS
         * --------------------------------------------------------
         *
         * These fields are NOT the source of truth anymore.
         *
         * They remain synchronized only for older screens and
         * components that still read directly from Courier.
         * --------------------------------------------------------
         */
        await DataStore.save(
          Courier.copyOf(dbCourier, (updatedCourier) => {
            /**
             * Make sure the relationship remains connected.
             */
            updatedCourier.liveLocationID = liveLocation.id;

            /**
             * Legacy fallback values.
             */
            updatedCourier.lat = latitude;
            updatedCourier.lng = longitude;

            if (Number.isFinite(heading)) {
              updatedCourier.heading = heading;
            }
          }),
        );

        console.log("Updated CourierLiveLocation:", {
          courierID: dbCourier.id,
          latitude,
          longitude,
          heading,
          speed,
          accuracy,
          altitude,
          trackingSource: "FOREGROUND",
        });
      } catch (error) {
        console.error("Failed to save CourierLiveLocation:", error);
      }
    };

    saveCourierLocation();

    return () => {
      isMounted = false;
    };
  }, [location, dbCourier?.id, dbCourier?.liveLocationID]);

  /**
   * ============================================================
   * REQUEST LOCATION PERMISSION AND WATCH GPS
   * ============================================================
   *
   * This watcher:
   *
   * 1. Gets the courier's current device location.
   * 2. Updates the local location state.
   * 3. Triggers the camera-follow effect.
   * 4. Triggers the CourierLiveLocation save effect.
   *
   * Background tracking is handled separately by:
   *
   * - courierLocationService.js
   * - backgroundLocationTask.js
   * ============================================================
   */
  useEffect(() => {
    let locationSubscription = null;
    let isMounted = true;

    const requestLocationPermission = async () => {
      try {
        setErrorMsg(null);

        /**
         * --------------------------------------------------------
         * REQUEST FOREGROUND LOCATION PERMISSION
         * --------------------------------------------------------
         */
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied.");

          return;
        }

        /**
         * --------------------------------------------------------
         * GET INITIAL LOCATION
         * --------------------------------------------------------
         */
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!isMounted) {
          return;
        }

        const initialCoords = initialLocation.coords;

        setLocation({
          latitude: initialCoords.latitude,
          longitude: initialCoords.longitude,
          heading: initialCoords.heading,
          speed: initialCoords.speed,
          accuracy: initialCoords.accuracy,
          altitude: initialCoords.altitude,
        });

        /**
         * --------------------------------------------------------
         * WATCH FOREGROUND LOCATION
         * --------------------------------------------------------
         *
         * The shorter interval and distance interval allow the
         * camera to follow the courier more smoothly.
         *
         * Adjust these values if you want to reduce battery usage.
         * --------------------------------------------------------
         */
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,

            /**
             * Receive location updates approximately every
             * 5 seconds when the device provides them.
             */
            timeInterval: 5000,

            /**
             * Receive an update after approximately 15 meters
             * of movement.
             */
            distanceInterval: 15,
          },
          (position) => {
            if (!isMounted) {
              return;
            }

            const { latitude, longitude, heading, speed, accuracy, altitude } =
              position.coords;

            setLocation({
              latitude,
              longitude,
              heading,
              speed,
              accuracy,
              altitude,
            });

            console.log("Updated foreground location:", {
              latitude,
              longitude,
              heading,
              speed,
              accuracy,
              altitude,
            });
          },
        );
      } catch (error) {
        console.error("Location permission or watcher error:", error);

        if (isMounted) {
          setErrorMsg("Failed to request or update your location.");
        }
      }
    };

    requestLocationPermission();

    /**
     * ----------------------------------------------------------
     * CLEANUP GPS WATCHER
     * ----------------------------------------------------------
     */
    return () => {
      isMounted = false;

      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [setLocation]);

  /**
   * ============================================================
   * CAMERA FOLLOWS COURIER
   * ============================================================
   *
   * Every time the courier's local GPS location changes, the
   * camera smoothly moves to the courier's current position.
   *
   * The backend source of truth remains CourierLiveLocation.
   * The local `location` state contains the latest GPS reading
   * from the courier's device.
   * ============================================================
   */

  // ======================================================
  // INITIALISE THE ROUTE FROM THE COURIER'S GPS POSITION
  // ======================================================

  useEffect(() => {
    if (routeOrigin || !location) return;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    setRouteOrigin({ latitude, longitude });
  }, [location?.latitude, location?.longitude, routeOrigin]);

  // ======================================================
  // RESET THE ROUTE WHEN THE ACTIVE DESTINATION CHANGES
  // ======================================================

  useEffect(() => {
    if (!destinationKey) {
      previousDestinationKeyRef.current = null;
      return;
    }

    const previousKey = previousDestinationKeyRef.current;

    // Record the initial destination without triggering a reroute.
    if (previousKey === null) {
      previousDestinationKeyRef.current = destinationKey;
      return;
    }

    // Nothing to do if the destination has not changed.
    if (previousKey === destinationKey) {
      return;
    }

    // Wait for a valid GPS position before recording the change.
    if (!location) return;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    // Record the change only when we can actually reroute.
    previousDestinationKeyRef.current = destinationKey;

    offRouteCountRef.current = 0;
    setRouteCoordinates([]);
    setRouteOrigin({ latitude, longitude });
    setIsRerouting(true);
    setRerouteKey((current) => current + 1);
  }, [destinationKey, location?.latitude, location?.longitude]);

  // ======================================================
  // CAMERA FOLLOWS THE COURIER
  // ======================================================

  useEffect(() => {
    if (!location || !mapRef?.current) {
      return;
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    const heading = Number(location.heading);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const cameraConfig = {
      center: {
        latitude,
        longitude,
      },
      zoom: 16,
      ...(Number.isFinite(heading) && { heading }),
    };

    mapRef.current.animateCamera(cameraConfig, {
      duration: 800,
    });
  }, [location?.latitude, location?.longitude, location?.heading, mapRef]);

  useEffect(() => {
    if (
      !location ||
      !routeCoordinates.length ||
      isRerouting ||
      !hasValidDestination
    ) {
      return;
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    const accuracy = Number(location.accuracy);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    // Ignore GPS readings known to be too inaccurate.
    if (Number.isFinite(accuracy) && accuracy > 35) {
      return;
    }

    const currentPosition = { latitude, longitude };

    const distanceFromRoute = distanceToRouteMeters(
      currentPosition,
      routeCoordinates,
    );

    // Require 3 consecutive readings more than 50 metres
    // away from the displayed route.
    if (distanceFromRoute > 50) {
      offRouteCountRef.current += 1;
    } else {
      offRouteCountRef.current = 0;
      return;
    }

    if (offRouteCountRef.current < 3) {
      return;
    }

    // Prevent repeated route requests.
    const now = Date.now();

    if (now - lastRerouteAtRef.current < 15000) {
      return;
    }

    lastRerouteAtRef.current = now;
    offRouteCountRef.current = 0;

    console.log(
      `Courier is ${Math.round(distanceFromRoute)}m off-route. Recalculating route.`,
    );

    // Recalculate from the courier's current GPS position.
    setIsRerouting(true);
    setRouteCoordinates([]);
    setRouteOrigin(currentPosition);
    setRerouteKey((current) => current + 1);
  }, [
    location?.latitude,
    location?.longitude,
    location?.accuracy,
    routeCoordinates,
    isRerouting,
    hasValidDestination,
  ]);

  // ======================================================
  // CHECK WHETHER THE COURIER IS NEAR THE ACTIVE DESTINATION
  // ======================================================

  useEffect(() => {
    if (!location || !hasValidDestination) {
      setIsCourierClose(false);
      return;
    }

    const currentPosition = {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };

    if (
      !Number.isFinite(currentPosition.latitude) ||
      !Number.isFinite(currentPosition.longitude)
    ) {
      setIsCourierClose(false);
      return;
    }

    const distanceToDestination = distanceBetweenCoordinatesMeters(
      currentPosition,
      destination,
    );

    // Within 100 metres of the active pickup or drop-off.
    setIsCourierClose(distanceToDestination <= 100);
  }, [
    location?.latitude,
    location?.longitude,
    destination.latitude,
    destination.longitude,
    hasValidDestination,
    setIsCourierClose,
  ]);

  /**
   * ============================================================
   * LOCATION LOADING STATE
   * ============================================================
   */
  if (
    !location ||
    !Number.isFinite(Number(location.latitude)) ||
    !Number.isFinite(Number(location.longitude))
  ) {
    return <ActivityIndicator style={{ marginTop: 90 }} size="large" />;
  }

  /**
   * ============================================================
   * RENDER MAP
   * ============================================================
   */
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{
          width,
          height: height - 50,
        }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onMapReady={onMapReady}
        /**
         * We manually control the camera.
         * Therefore, disable the automatic user-location camera.
         */
        showsUserLocation={false}
        followsUserLocation={false}
      >
        {/* ======================================================
            COURIER MARKER
            ====================================================== */}

        <Marker
          key="current-courier-location"
          coordinate={{
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
          }}
          anchor={{
            x: 0.5,
            y: 0.5,
          }}
          flat
          rotation={
            Number.isFinite(Number(location.heading))
              ? Number(location.heading)
              : 0
          }
          title="Courier"
        >
          <View
            style={{
              backgroundColor: "#111827",
              padding: 10,
              borderRadius: 30,
              borderWidth: 2,
              borderColor: "#ffffff",
            }}
          >
            <Feather name="navigation" size={24} color="#ffffff" />
          </View>
        </Marker>

        {/* ======================================================
            DIRECTIONS
            ====================================================== */}

        {hasValidDestination && routeOrigin && (
          <MapViewDirections
            key={`${destinationKey}-${rerouteKey}`}
            origin={routeOrigin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            timePrecision="now"
            strokeWidth={3}
            strokeColor="red"
            onReady={(result) => {
              setRouteCoordinates(result.coordinates || []);
              setTotalMins(result.duration);
              setTotalKm(result.distance);
              setIsRerouting(false);
            }}
            onError={(errorMessage) => {
              console.log("Map directions error:", errorMessage);
              setIsRerouting(false);
            }}
          />
        )}

        {/* ======================================================
            PICKUP MARKER
            ====================================================== */}

        {hasValidOrigin && (
          <Marker
            key={`${order.id}-origin`}
            title={user?.firstName || "Pickup location"}
            description={order.originAddress}
            coordinate={{
              latitude: Number(order.originLat),
              longitude: Number(order.originLng),
            }}
          >
            <View
              style={{
                backgroundColor: "#04b831",
                padding: 5,
                borderRadius: 20,
              }}
            >
              <Feather name="box" size={30} color="black" />
            </View>
          </Marker>
        )}

        {/* ======================================================
            DROPOFF MARKER
            ====================================================== */}

        {hasValidDropoff && (
          <Marker
            key={`${order.id}-destination`}
            title={user?.firstName || "Dropoff location"}
            description="Destination Location"
            coordinate={{
              /**
               * Correct latitude/longitude mapping.
               */
              latitude: Number(order.destinationLat),
              longitude: Number(order.destinationLng),
            }}
          >
            <View
              style={{
                backgroundColor: "red",
                padding: 5,
                borderRadius: 20,
              }}
            >
              <Feather name="box" size={30} color="black" />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

export default OrderDeliveryMap;
