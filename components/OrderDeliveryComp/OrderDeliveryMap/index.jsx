import { useAuthContext } from "@/providers/AuthProvider";
import { useOrderContext } from "@/providers/OrderProvider";
import { Courier, CourierLiveLocation } from "@/src/models";

import Feather from "@expo/vector-icons/Feather";
import { DataStore } from "aws-amplify/datastore";
import * as Location from "expo-location";

import { useEffect, useState } from "react";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import MapViewDirections from "react-native-maps-directions";

import { GOOGLE_API_KEY } from "../../../keys";
import styles from "./styles";

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
  useEffect(() => {
    if (!location || !mapRef?.current) {
      return;
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    const heading = Number(location.heading);

    /**
     * Do not move the camera when coordinates are invalid.
     */
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    /**
     * Build the camera configuration.
     */
    const cameraConfig = {
      center: {
        latitude,
        longitude,
      },

      /**
       * Zoom level.
       *
       * 16 is suitable for following a courier in a city.
       */
      zoom: 16,

      /**
       * Keep the camera pointed in the courier's direction
       * when the device provides a valid heading.
       */
      ...(Number.isFinite(heading) && {
        heading,
      }),
    };

    /**
     * Smoothly animate the camera.
     */
    mapRef.current.animateCamera(cameraConfig, {
      duration: 800,
    });
  }, [location?.latitude, location?.longitude, location?.heading, mapRef]);

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
   * GET ROUTE DESTINATION
   * ============================================================
   *
   * Before pickup:
   *
   *     Courier → Pickup location
   *
   * After pickup:
   *
   *     Courier → Dropoff location
   * ============================================================
   */
  const getDestination = () => {
    if (isPickedUp) {
      return {
        latitude: Number(order.destinationLat),
        longitude: Number(order.destinationLng),
      };
    }

    return {
      latitude: Number(order.originLat),
      longitude: Number(order.originLng),
    };
  };

  const destination = getDestination();

  /**
   * Validate route destination.
   */
  const hasValidDestination =
    Number.isFinite(destination.latitude) &&
    Number.isFinite(destination.longitude);

  /**
   * Validate pickup coordinates.
   */
  const hasValidOrigin =
    Number.isFinite(Number(order.originLat)) &&
    Number.isFinite(Number(order.originLng));

  /**
   * Validate dropoff coordinates.
   */
  const hasValidDropoff =
    Number.isFinite(Number(order.destinationLat)) &&
    Number.isFinite(Number(order.destinationLng));

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

        {hasValidDestination && (
          <MapViewDirections
            origin={{
              latitude: Number(location.latitude),
              longitude: Number(location.longitude),
            }}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            timePrecision="now"
            strokeWidth={3}
            strokeColor="red"
            onReady={(result) => {
              /**
               * Existing proximity threshold preserved.
               */
              setIsCourierClose(result.distance <= 3.8);

              setTotalMins(result.duration);
              setTotalKm(result.distance);
            }}
            onError={(errorMessage) => {
              console.log("Map directions error:", errorMessage);
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
