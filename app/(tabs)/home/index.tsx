import { useAuthContext } from "@/providers/AuthProvider";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import HomeComponent from "../../../components/HomeComponent/HomeMain";

const Home = () => {
  const { dbCourier } = useAuthContext();

  useEffect(() => {
    if (!dbCourier) {
      router.replace("/profile");
    }
  }, [dbCourier]);

  if (!dbCourier) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#afadad" }}>
          Kindly Fill in Your Data in Profile screen
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HomeComponent />
    </View>
  );
};

export default Home;
