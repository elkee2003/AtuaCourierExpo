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
 * Define the task at the top level of the file.
 *
 * This is important. Do not define TaskManager.defineTask()
 * inside a React component or inside a function.
 */
TaskManager.defineTask(COURIER_LOCATION_TASK, async ({ data, error }) => {
  try {
    if (error) {
      console.log("[Atua Background Location] Task error:", error);

      return;
    }

    // Expo sends the latest location updates in data.locations.
    const locations = data?.locations;

    if (!locations || locations.length === 0) {
      return;
    }

    // We only need the newest location from this batch.
    const latestLocation = locations[locations.length - 1];

    const coordinates = latestLocation?.coords;

    if (!coordinates) {
      return;
    }

    const { latitude, longitude, heading, speed, accuracy, altitude } =
      coordinates;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return;
    }

    // Read the courier ID from persistent local storage.
    const courierId = await AsyncStorage.getItem(ACTIVE_COURIER_ID_KEY);

    if (!courierId) {
      console.log("[Atua Background Location] No active courier ID found.");

      return;
    }

    // Retrieve the latest Courier record.
    const courier = await DataStore.query(Courier, courierId);

    if (!courier) {
      console.log("[Atua Background Location] Courier not found:", courierId);

      return;
    }

    // Do not continue tracking a blocked or unapproved courier.
    if (courier.isBlocked === true || courier.isApproved === false) {
      console.log(
        "[Atua Background Location] Courier is blocked or unapproved.",
      );

      return;
    }

    const now = new Date();
    const nowIso = now.toISOString();

    let liveLocation = null;

    // Reuse the courier's existing live-location record.
    if (courier.liveLocationID) {
      liveLocation = await DataStore.query(
        CourierLiveLocation,
        courier.liveLocationID,
      );
    }

    /**
     * If the courier does not have a live-location record yet,
     * create one and connect it to the Courier record.
     */
    if (!liveLocation) {
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

      // Save the live-location ID on the courier.
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

      console.log("[Atua Background Location] Created live location.");

      return;
    }

    /**
     * Avoid writing every GPS event to DataStore.
     *
     * We update when:
     * - The courier has moved at least 20 meters, or
     * - The previous update was at least 30 seconds ago.
     */
    const previousLatitude = liveLocation.latitude;
    const previousLongitude = liveLocation.longitude;

    const previousTimestamp = liveLocation.lastSeenAt
      ? new Date(liveLocation.lastSeenAt).getTime()
      : 0;

    const distanceMoved = getDistanceInMeters(
      previousLatitude,
      previousLongitude,
      latitude,
      longitude,
    );

    const timeSinceLastUpdate = Date.now() - previousTimestamp;

    const shouldUpdate =
      distanceMoved >= MIN_DISTANCE_METERS ||
      timeSinceLastUpdate >= HEARTBEAT_INTERVAL_MS;

    if (!shouldUpdate) {
      return;
    }

    // Update the existing live-location record.
    await DataStore.save(
      CourierLiveLocation.copyOf(liveLocation, (updatedLocation) => {
        updatedLocation.latitude = latitude;
        updatedLocation.longitude = longitude;

        updatedLocation.heading =
          typeof heading === "number" ? heading : updatedLocation.heading;

        updatedLocation.speed =
          typeof speed === "number" ? speed : updatedLocation.speed;

        updatedLocation.accuracy =
          typeof accuracy === "number" ? accuracy : updatedLocation.accuracy;

        updatedLocation.altitude =
          typeof altitude === "number" ? altitude : updatedLocation.altitude;

        updatedLocation.isTracking = true;
        updatedLocation.trackingSource = "BACKGROUND";
        updatedLocation.lastSeenAt = nowIso;
      }),
    );

    // Keep the legacy Courier coordinates updated too.
    await DataStore.save(
      Courier.copyOf(courier, (updatedCourier) => {
        updatedCourier.lat = latitude;
        updatedCourier.lng = longitude;

        if (typeof heading === "number") {
          updatedCourier.heading = heading;
        }
      }),
    );

    console.log(
      "[Atua Background Location] Location updated:",
      latitude,
      longitude,
    );
  } catch (taskError) {
    console.log("[Atua Background Location] Unexpected error:", taskError);
  }
});
