// src/location/courierLocationService.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import {
    ACTIVE_COURIER_ID_KEY,
    COURIER_LOCATION_TASK,
} from "./backgroundLocationTask";

/**
 * Start background tracking for a courier.
 *
 * Important:
 * - Permission handling is performed here as a safety check.
 * - The HomeComponent should still check permissions before calling this.
 * - The background task itself must be defined in backgroundLocationTask.js.
 */
export const startCourierLocationTracking = async (courierId) => {
  try {
    // --------------------------------------------------
    // Validate courier ID
    // --------------------------------------------------
    if (!courierId) {
      throw new Error("Cannot start location tracking without a courier ID.");
    }

    // --------------------------------------------------
    // Check foreground permission
    // --------------------------------------------------
    // We use getForegroundPermissionsAsync() here instead
    // of requesting permission again. Your HomeComponent
    // already handles the permission request flow.
    const foregroundPermission = await Location.getForegroundPermissionsAsync();

    if (foregroundPermission.status !== "granted") {
      throw new Error("Foreground location permission was not granted.");
    }

    // --------------------------------------------------
    // Check background permission
    // --------------------------------------------------
    const backgroundPermission = await Location.getBackgroundPermissionsAsync();

    if (backgroundPermission.status !== "granted") {
      throw new Error("Background location permission was not granted.");
    }

    // --------------------------------------------------
    // Save the active courier ID
    // --------------------------------------------------
    // The background task uses this ID to know which
    // courier's location should be updated.
    await AsyncStorage.setItem(ACTIVE_COURIER_ID_KEY, String(courierId));

    // --------------------------------------------------
    // Check whether tracking is already running
    // --------------------------------------------------
    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
      COURIER_LOCATION_TASK,
    );

    if (alreadyStarted) {
      console.log("[Atua Location] Background tracking is already running.");

      return {
        started: true,
        alreadyRunning: true,
      };
    }

    // --------------------------------------------------
    // Start background location updates
    // --------------------------------------------------
    await Location.startLocationUpdatesAsync(COURIER_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,

      // Android foreground service notification.
      foregroundService: {
        notificationTitle: "Atua Courier is online",
        notificationBody:
          "Your location is being used to receive and manage deliveries.",
        notificationColor: "#005F73",
      },

      // Request an update approximately every 10 seconds.
      timeInterval: 10000,

      // Request an update after approximately 20 meters.
      distanceInterval: 20,

      // Continue tracking when the app is in the background.
      pausesUpdatesAutomatically: false,

      // Useful for navigation and vehicle movement on iOS.
      activityType: Location.ActivityType.AutomotiveNavigation,

      // Display the location indicator on supported iOS versions.
      showsBackgroundLocationIndicator: true,
    });

    console.log("[Atua Location] Background tracking started.");

    return {
      started: true,
      alreadyRunning: false,
    };
  } catch (error) {
    console.error(
      "[Atua Location] Failed to start background tracking:",
      error,
    );

    // If starting tracking fails, remove the active courier
    // ID so the background task does not use stale data.
    try {
      await AsyncStorage.removeItem(ACTIVE_COURIER_ID_KEY);
    } catch (storageError) {
      console.error(
        "[Atua Location] Failed to clear active courier ID:",
        storageError,
      );
    }

    // Re-throw the error so HomeComponent can handle it.
    throw error;
  }
};

/**
 * Stop background tracking for the current courier.
 *
 * This function should normally be called when the courier
 * goes offline, is blocked, or loses approval.
 */
export const stopCourierLocationTracking = async () => {
  try {
    // --------------------------------------------------
    // Check whether tracking is running
    // --------------------------------------------------
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      COURIER_LOCATION_TASK,
    );

    // --------------------------------------------------
    // Stop background location updates
    // --------------------------------------------------
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(COURIER_LOCATION_TASK);

      console.log("[Atua Location] Background tracking stopped.");
    }

    // --------------------------------------------------
    // Remove the active courier ID
    // --------------------------------------------------
    await AsyncStorage.removeItem(ACTIVE_COURIER_ID_KEY);

    return {
      stopped: true,
    };
  } catch (error) {
    console.error("[Atua Location] Failed to stop background tracking:", error);

    // Clear the ID even if stopping the task fails.
    try {
      await AsyncStorage.removeItem(ACTIVE_COURIER_ID_KEY);
    } catch (storageError) {
      console.error(
        "[Atua Location] Failed to remove active courier ID:",
        storageError,
      );
    }

    throw error;
  }
};

/**
 * Check whether background tracking is currently active.
 */
export const isCourierLocationTrackingActive = async () => {
  try {
    return await Location.hasStartedLocationUpdatesAsync(COURIER_LOCATION_TASK);
  } catch (error) {
    console.error("[Atua Location] Failed to check tracking status:", error);

    return false;
  }
};
