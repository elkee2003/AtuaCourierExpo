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
 * This function should be called when the courier goes online.
 */
export const startCourierLocationTracking = async (courierId) => {
  if (!courierId) {
    throw new Error("Cannot start location tracking without a courier ID.");
  }

  // Save the courier ID so the background task can find it later.
  await AsyncStorage.setItem(ACTIVE_COURIER_ID_KEY, courierId);

  // Request permission to use location while the app is open.
  const foregroundPermission =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundPermission.status !== "granted") {
    throw new Error("Foreground location permission was not granted.");
  }

  // Request background location permission.
  const backgroundPermission =
    await Location.requestBackgroundPermissionsAsync();

  if (backgroundPermission.status !== "granted") {
    throw new Error("Background location permission was not granted.");
  }

  // Check whether the task is already running.
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

  // Start receiving location updates in the background.
  await Location.startLocationUpdatesAsync(COURIER_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,

    // Android will use a foreground service notification.
    foregroundService: {
      notificationTitle: "Atua Courier is online",
      notificationBody:
        "Your location is being used to receive and manage deliveries.",
      notificationColor: "#005F73",
    },

    // Receive updates approximately every 10 seconds.
    timeInterval: 10000,

    // Receive updates after moving approximately 20 meters.
    distanceInterval: 20,

    // Keep tracking while the app is in the background.
    pausesUpdatesAutomatically: false,

    // Helps iOS understand that this is navigation/vehicle activity.
    activityType: Location.ActivityType.AutomotiveNavigation,

    // Shows the background location indicator on supported iOS versions.
    showsBackgroundLocationIndicator: true,
  });

  console.log("[Atua Location] Background tracking started.");

  return {
    started: true,
    alreadyRunning: false,
  };
};

/**
 * Stop background tracking for the current courier.
 *
 * This function should normally be called when the courier goes offline.
 */
export const stopCourierLocationTracking = async () => {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(
    COURIER_LOCATION_TASK,
  );

  if (isRunning) {
    await Location.stopLocationUpdatesAsync(COURIER_LOCATION_TASK);

    console.log("[Atua Location] Background tracking stopped.");
  }

  // Remove the active courier ID from local storage.
  await AsyncStorage.removeItem(ACTIVE_COURIER_ID_KEY);

  return {
    stopped: true,
  };
};

/**
 * Check whether background tracking is currently active.
 */
export const isCourierLocationTrackingActive = async () => {
  return Location.hasStartedLocationUpdatesAsync(COURIER_LOCATION_TASK);
};
