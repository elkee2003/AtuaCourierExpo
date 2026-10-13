import * as Location from "expo-location";

/**
 * Requests foreground location permission only.
 *
 * Background permission must be requested separately,
 * after the in-app background location disclosure is shown
 * and the courier agrees to continue.
 */
export async function requestLocationPermissions() {
  try {
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

    return {
      granted: true,
      foregroundGranted: true,
      backgroundGranted: false,
      reason: null,
    };
  } catch (error) {
    console.error(
      "Error while requesting foreground location permission:",
      error,
    );

    return {
      granted: false,
      foregroundGranted: false,
      backgroundGranted: false,
      reason:
        error?.message ||
        "An unexpected error occurred while requesting foreground location permission.",
    };
  }
}

/**
 * Requests background location permission.
 *
 * Call this function only after the in-app disclosure
 * has been displayed and the courier agrees to continue.
 */
export async function requestBackgroundLocationPermission() {
  try {
    const backgroundPermission =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundPermission.status !== "granted") {
      return {
        granted: false,
        status: backgroundPermission.status,
        reason:
          "Background location permission was not granted. The courier must allow background location access to go online.",
      };
    }

    return {
      granted: true,
      status: backgroundPermission.status,
      reason: null,
    };
  } catch (error) {
    console.error(
      "Error while requesting background location permission:",
      error,
    );

    return {
      granted: false,
      status: "error",
      reason:
        error?.message ||
        "An unexpected error occurred while requesting background location permission.",
    };
  }
}

/**
 * Checks whether both foreground and background location
 * permissions have already been granted.
 *
 * This function does not display permission prompts.
 *
 * Returns:
 *   true  -> both permissions are granted
 *   false -> one or both permissions are missing
 */
export async function hasRequiredLocationPermissions() {
  try {
    const foregroundPermission = await Location.getForegroundPermissionsAsync();

    const backgroundPermission = await Location.getBackgroundPermissionsAsync();

    return (
      foregroundPermission.status === "granted" &&
      backgroundPermission.status === "granted"
    );
  } catch (error) {
    console.error("Error while checking location permissions:", error);

    return false;
  }
}
