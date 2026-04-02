import { useAuthContext } from "@/providers/AuthProvider";
import { Courier } from "@/src/models";
import Feather from "@expo/vector-icons/Feather";
import { DataStore } from "aws-amplify/datastore";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styles from "./styles";

const Map = ({ location, setLocation, orders }) => {
  const { width, height } = useWindowDimensions();
  const mapRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const { dbUser } = useAuthContext();

  // 🔒 Refs for controlling updates
  const lastSavedLocation = useRef(null);
  const lastSaveTime = useRef(0);

  // ✅ Distance calculator (needed here)
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // ✅ 1. LIVE location tracking (controlled)
  useEffect(() => {
    let subscription;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission denied");
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // every 5s
            distanceInterval: 50, // every 50m
          },
          (loc) => {
            const newLocation = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };

            // ✅ Prevent tiny movement updates (UI optimization)
            if (location) {
              const distance = getDistance(
                location.latitude,
                location.longitude,
                newLocation.latitude,
                newLocation.longitude,
              );

              if (distance < 0.01) return; // 10 meters
            }

            setLocation(newLocation);
          },
        );
      } catch (error) {
        setErrorMsg("Failed to fetch location");
      }
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // ✅ 2. Update courier location (THROTTLED)
  useEffect(() => {
    if (!location || !dbUser?.id) return;

    const updateLocation = async () => {
      const now = Date.now();

      // ⏱ Limit updates (every 10s)
      if (now - lastSaveTime.current < 10000) return;

      // 📍 Limit by distance (100m)
      if (lastSavedLocation.current) {
        const distance = getDistance(
          lastSavedLocation.current.latitude,
          lastSavedLocation.current.longitude,
          location.latitude,
          location.longitude,
        );

        if (distance < 0.1) return;
      }

      lastSavedLocation.current = location;
      lastSaveTime.current = now;

      try {
        // ✅ ALWAYS GET FRESH USER
        const freshUser = await DataStore.query(Courier, dbUser.id);

        if (!freshUser) return;

        await DataStore.save(
          Courier.copyOf(freshUser, (updated) => {
            updated.lat = location.latitude;
            updated.lng = location.longitude;
          }),
        );
      } catch (e) {
        console.log("Location update error:", e);
      }
    };

    updateLocation();
  }, [location, dbUser?.id]);

  // ✅ Loading state
  if (!location) {
    return <ActivityIndicator style={{ marginTop: 90 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ width, height: height - 110 }}
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
          return (
            <Marker
              key={order.id}
              coordinate={{
                latitude: order.originLat,
                longitude: order.originLng,
              }}
            >
              <Feather name="box" size={30} color={"black"} />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

export default Map;
