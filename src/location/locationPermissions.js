import * as Location from "expo-location";

/**
 * Requests the location permissions required by Atua Courier.
 *
 * Required permissions:
 * 1. Foreground location permission.
 * 2. Background location permission.
 *
 * The courier must grant both permissions before
 * background GPS tracking can start.
 */
export async function requestLocationPermissions() {
  try {
    // --------------------------------------------------
    // Step 1: Request foreground location permission
    // --------------------------------------------------
    const foregroundPermission =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundPermission.status !== "granted") {
      return {
        granted: false,
        foregroundGranted: false,
        backgroundGranted: false,
        reason: "Foreground location permission was denied.",
      };
    }

    // --------------------------------------------------
    // Step 2: Request background location permission
    // --------------------------------------------------
    // Android may direct the user to Settings instead of
    // displaying a normal permission popup.
    const backgroundPermission =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundPermission.status !== "granted") {
      return {
        granted: false,
        foregroundGranted: true,
        backgroundGranted: false,
        reason:
          "Background location permission was not granted. Select 'Allow all the time' in Android settings.",
      };
    }

    // --------------------------------------------------
    // Both permissions were granted
    // --------------------------------------------------
    return {
      granted: true,
      foregroundGranted: true,
      backgroundGranted: true,
      reason: null,
    };
  } catch (error) {
    console.error("Error while requesting location permissions:", error);

    return {
      granted: false,
      foregroundGranted: false,
      backgroundGranted: false,
      reason:
        error?.message ||
        "An unexpected error occurred while requesting location permissions.",
    };
  }
}

/**
 * Checks whether both foreground and background permissions
 * have already been granted.
 *
 * This function does not display a permission popup.
 *
 * Returns:
 *   true  -> both permissions are granted
 *   false -> one or both permissions are missing
 */
export async function hasRequiredLocationPermissions() {
  try {
    // Check foreground permission.
    const foregroundPermission = await Location.getForegroundPermissionsAsync();

    // Check background permission.
    const backgroundPermission = await Location.getBackgroundPermissionsAsync();

    return (
      foregroundPermission.status === "granted" &&
      backgroundPermission.status === "granted"
    );
  } catch (error) {
    console.error("Error while checking location permissions:", error);

    // If the permission check fails, treat the permissions
    // as unavailable so the app does not start tracking.
    return false;
  }
}
