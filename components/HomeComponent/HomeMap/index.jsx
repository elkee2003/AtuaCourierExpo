import Feather from "@expo/vector-icons/Feather";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import styles from "./styles";

const Map = ({ location, setLocation, orders = [] }) => {
  const { width, height } = useWindowDimensions();

  const mapRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState(null);

  /*
   * This ref always contains the latest location.
   *
   * We use a ref because the location watcher callback can otherwise
   * capture an old value of "location" from the first render.
   */
  const latestLocationRef = useRef(location);

  /*
   * Keep the ref updated whenever the location prop changes.
   */
  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  /*
   * Calculate the distance between two coordinates.
   *
   * The result is returned in kilometres because R is 6371.
   */
  const getDistance = (latitude1, longitude1, latitude2, longitude2) => {
    const R = 6371;

    const dLatitude = ((latitude2 - latitude1) * Math.PI) / 180;

    const dLongitude = ((longitude2 - longitude1) * Math.PI) / 180;

    const a =
      Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
      Math.cos((latitude1 * Math.PI) / 180) *
        Math.cos((latitude2 * Math.PI) / 180) *
        Math.sin(dLongitude / 2) *
        Math.sin(dLongitude / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  /*
   * Watch the courier's foreground location.
   *
   * This watcher is used to update the map UI while the app is open.
   * Persistent/background tracking is handled separately by:
   *
   * courierLocationService.js
   */
  useEffect(() => {
    let subscription;

    const startWatchingLocation = async () => {
      try {
        setErrorMsg(null);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Location permission was denied.");
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,

            /*
             * Request a location update approximately every
             * five seconds when supported by the device.
             */
            timeInterval: 5000,

            /*
             * Request an update after the device moves
             * approximately 50 metres.
             */
            distanceInterval: 50,
          },
          (locationResult) => {
            const newLocation = {
              latitude: locationResult.coords.latitude,
              longitude: locationResult.coords.longitude,
            };

            /*
             * Read the latest location from the ref instead of
             * using the "location" value captured when this effect
             * first ran.
             */
            const previousLocation = latestLocationRef.current;

            /*
             * Avoid updating the map state for very tiny movements.
             *
             * 0.01 kilometres = 10 metres.
             */
            if (previousLocation) {
              const distance = getDistance(
                previousLocation.latitude,
                previousLocation.longitude,
                newLocation.latitude,
                newLocation.longitude,
              );

              if (distance < 0.01) {
                return;
              }
            }

            /*
             * Update the ref immediately so the next location
             * callback has the newest coordinates.
             */
            latestLocationRef.current = newLocation;

            /*
             * Update the parent component's location state.
             */
            setLocation(newLocation);
          },
        );
      } catch (error) {
        console.log("Foreground location watcher error:", error);

        setErrorMsg("Failed to fetch your current location.");
      }
    };

    startWatchingLocation();

    /*
     * Stop watching the location when the Map component
     * unmounts.
     */
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [setLocation]);

  /*
   * Display a loading indicator until the first location
   * is available.
   */
  if (!location) {
    return <ActivityIndicator style={{ marginTop: 90 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{
          width,
          height: height - 110,
        }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        followsUserLocation
      >
        {orders.map((order) => {
          /*
           * Do not render a marker if the order does not
           * have valid origin coordinates.
           */
          const latitude = Number(order.originLat);
          const longitude = Number(order.originLng);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return (
            <Marker
              key={order.id}
              coordinate={{
                latitude,
                longitude,
              }}
            >
              <Feather name="box" size={30} color="black" />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

export default Map;
