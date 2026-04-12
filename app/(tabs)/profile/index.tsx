import { useAuthContext } from "@/providers/AuthProvider";
import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import EditProfile from "../../../components/ProfileComs/EditProfile";
import MainProfile from "../../../components/ProfileComs/MainProfile";

const Profile = () => {
  const { dbCourier, loadingCourier, refreshCourier } = useAuthContext();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCourier();
    setRefreshing(false);
  };

  if (loadingCourier) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />

        <Text style={{ marginTop: 10 }}>Setting up your account...</Text>

        <Text style={{ marginTop: 10, color: "blue" }} onPress={refreshCourier}>
          Tap here if it's taking too long
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {dbCourier ? (
        <MainProfile onRefresh={onRefresh} refreshing={refreshing} />
      ) : (
        <EditProfile onRefresh={onRefresh} refreshing={refreshing} />
      )}
    </View>
  );
};

export default Profile;
