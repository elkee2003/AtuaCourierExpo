// src/location/backgroundLocationTask.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataStore } from "aws-amplify/datastore";
import * as TaskManager from "expo-task-manager";

import { Courier, CourierLiveLocation } from "@/src/models";

// This must be exactly the same task name used when starting tracking.
export const COURIER_LOCATION_TASK = "ATUA_COURIER_BACKGROUND_LOCATION";

// This is the key used to save the active courier ID locally.
export const ACTIVE_COURIER_ID_KEY = "ATUA_ACTIVE_COURIER_ID";

// Prevents unnecessary writes to the database.
const MIN_DISTANCE_METERS = 20;
const HEARTBEAT_INTERVAL_MS = 30 * 1000;

/**
 * Calculate the distance between two GPS coordinates.
 *
 * The result is returned in meters.
 */
const getDistanceInMeters = (latitude1, longitude1, latitude2, longitude2) => {
  const earthRadius = 6371000;

  const latitudeDifference = ((latitude2 - latitude1) * Math.PI) / 180;

  const longitudeDifference = ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

/**
 * Register the background task only once.
 *
 * This prevents duplicate task-registration warnings during
 * Expo Fast Refresh or when this file is imported more than once.
 */
if (!TaskManager.isTaskDefined(COURIER_LOCATION_TASK)) {
  TaskManager.defineTask(COURIER_LOCATION_TASK, async ({ data, error }) => {
    try {
      console.log("[Atua Background Location] Task triggered.");

      /**
       * Handle any error supplied by Expo Location/TaskManager.
       */
      if (error) {
        console.error("[Atua Background Location] Task error:", error);

        return;
      }

      /**
       * Expo sends location updates through data.locations.
       */
      const locations = data?.locations;

      if (!Array.isArray(locations) || locations.length === 0) {
        console.log("[Atua Background Location] No location updates received.");

        return;
      }

      /**
       * Use the newest location from the received batch.
       */
      const latestLocation = locations[locations.length - 1];

      const coordinates = latestLocation?.coords;

      if (!coordinates) {
        console.log(
          "[Atua Background Location] Location coordinates are missing.",
        );

        return;
      }

      const { latitude, longitude, heading, speed, accuracy, altitude } =
        coordinates;

      /**
       * Validate the required GPS coordinates.
       */
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        console.log("[Atua Background Location] Invalid GPS coordinates.");

        return;
      }

      /**
       * Read the active courier ID from persistent storage.
       */
      const courierId = await AsyncStorage.getItem(ACTIVE_COURIER_ID_KEY);

      if (!courierId) {
        console.log("[Atua Background Location] No active courier ID found.");

        return;
      }

      console.log("[Atua Background Location] Processing courier:", courierId);

      /**
       * Retrieve the latest Courier record from DataStore.
       */
      const courier = await DataStore.query(Courier, courierId);

      if (!courier) {
        console.log("[Atua Background Location] Courier not found:", courierId);

        return;
      }

      /**
       * Do not update the location of a blocked or unapproved courier.
       */
      if (courier.isBlocked === true || courier.isApproved === false) {
        console.log(
          "[Atua Background Location] Courier is blocked or unapproved.",
        );

        return;
      }

      const now = new Date();
      const nowIso = now.toISOString();

      let liveLocation = null;

      /**
       * Reuse the existing live-location record when the Courier
       * already has a liveLocationID.
       */
      if (courier.liveLocationID) {
        liveLocation = await DataStore.query(
          CourierLiveLocation,
          courier.liveLocationID,
        );
      }

      /**
       * If the Courier has a liveLocationID but the related record
       * no longer exists, a new live-location record will be created.
       */
      if (!liveLocation) {
        console.log(
          "[Atua Background Location] Creating live location record.",
        );

        liveLocation = await DataStore.save(
          new CourierLiveLocation({
            courierID: courier.id,
            latitude,
            longitude,
            heading: typeof heading === "number" ? heading : null,
            speed: typeof speed === "number" ? speed : null,
            accuracy: typeof accuracy === "number" ? accuracy : null,
            altitude: typeof altitude === "number" ? altitude : null,
            isTracking: true,
            trackingSource: "BACKGROUND",
            lastSeenAt: nowIso,
          }),
        );

        /**
         * Save the new live-location ID on the Courier record.
         * Also update the legacy Courier coordinates.
         */
        await DataStore.save(
          Courier.copyOf(courier, (updatedCourier) => {
            updatedCourier.liveLocationID = liveLocation.id;

            updatedCourier.lat = latitude;
            updatedCourier.lng = longitude;

            if (typeof heading === "number") {
              updatedCourier.heading = heading;
            }
          }),
        );

        console.log(
          "[Atua Background Location] Created live location:",
          liveLocation.id,
        );

        return;
      }

      /**
       * Read the previous coordinates from the live-location record.
       */
      const previousLatitude = liveLocation.latitude;
      const previousLongitude = liveLocation.longitude;

      /**
       * Validate the previous coordinates before calculating distance.
       *
       * If the previous coordinates are missing, force an update.
       */
      const hasPreviousCoordinates =
        typeof previousLatitude === "number" &&
        typeof previousLongitude === "number" &&
        Number.isFinite(previousLatitude) &&
        Number.isFinite(previousLongitude);

      const distanceMoved = hasPreviousCoordinates
        ? getDistanceInMeters(
            previousLatitude,
            previousLongitude,
            latitude,
            longitude,
          )
        : Number.POSITIVE_INFINITY;

      /**
       * Calculate how long it has been since the last update.
       */
      const previousTimestamp = liveLocation.lastSeenAt
        ? new Date(liveLocation.lastSeenAt).getTime()
        : 0;

      const timeSinceLastUpdate =
        previousTimestamp > 0
          ? Date.now() - previousTimestamp
          : Number.POSITIVE_INFINITY;

      /**
       * Only write to DataStore when:
       *
       * 1. The courier has moved at least 20 meters, or
       * 2. At least 30 seconds have passed since the last update.
       */
      const shouldUpdate =
        distanceMoved >= MIN_DISTANCE_METERS ||
        timeSinceLastUpdate >= HEARTBEAT_INTERVAL_MS;

      if (!shouldUpdate) {
        console.log("[Atua Background Location] Update skipped.", {
          distanceMoved,
          timeSinceLastUpdate,
        });

        return;
      }

      /**
       * Update the existing CourierLiveLocation record.
       */
      await DataStore.save(
        CourierLiveLocation.copyOf(liveLocation, (updatedLocation) => {
          updatedLocation.latitude = latitude;
          updatedLocation.longitude = longitude;

          if (typeof heading === "number") {
            updatedLocation.heading = heading;
          }

          if (typeof speed === "number") {
            updatedLocation.speed = speed;
          }

          if (typeof accuracy === "number") {
            updatedLocation.accuracy = accuracy;
          }

          if (typeof altitude === "number") {
            updatedLocation.altitude = altitude;
          }

          updatedLocation.isTracking = true;
          updatedLocation.trackingSource = "BACKGROUND";
          updatedLocation.lastSeenAt = nowIso;
        }),
      );

      /**
       * Keep the legacy Courier location fields updated as well.
       */
      await DataStore.save(
        Courier.copyOf(courier, (updatedCourier) => {
          updatedCourier.lat = latitude;
          updatedCourier.lng = longitude;

          if (typeof heading === "number") {
            updatedCourier.heading = heading;
          }
        }),
      );

      console.log("[Atua Background Location] Location updated successfully:", {
        latitude,
        longitude,
        heading,
        speed,
        accuracy,
        altitude,
        distanceMoved,
        timeSinceLastUpdate,
      });
    } catch (taskError) {
      /**
       * Background tasks can fail silently if errors are not logged
       * clearly. Include both the error message and stack trace.
       */
      console.error(
        "[Atua Background Location] Unexpected error:",
        taskError?.message || taskError,
      );

      if (taskError?.stack) {
        console.error(
          "[Atua Background Location] Stack trace:",
          taskError.stack,
        );
      }
    }
  });
} else {
  console.log(
    `[Atua Background Location] Task already defined: ${COURIER_LOCATION_TASK}`,
  );
}
