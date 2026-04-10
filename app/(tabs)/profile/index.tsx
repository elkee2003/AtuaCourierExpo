import EditProfile from "@/components/ProfileComs/EditProfile";
import { useAuthContext } from "@/providers/AuthProvider";
import React from "react";
import { View } from "react-native";
import MainProfile from "../../../components/ProfileComs/MainProfile";

const Profile = () => {
  const { dbCourier } = useAuthContext();

  return (
    <View style={{ flex: 1 }}>
      {/* Note that its mainprofile thats meant to be here */}
      {dbCourier ? <MainProfile /> : <EditProfile />}
    </View>
  );
};

export default Profile;
