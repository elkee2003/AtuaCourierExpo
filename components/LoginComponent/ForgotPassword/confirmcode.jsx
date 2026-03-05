import { confirmResetPassword } from "aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "../customButtons";
import CustomInput from "../customInput";
import styles from "./styles";

const ConfirmCodeCom = () => {
  const { email } = useLocalSearchParams();
  const { control, handleSubmit } = useForm();

  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = async ({ code, newPassword }) => {
    if (loading) return;
    setLoading(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });

      Alert.alert("Success", "Password reset successful.");
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Enter Code</Text>
            <Text style={styles.subtitle}>
              We sent a confirmation code to your email
            </Text>
          </View>

          <View style={styles.card}>
            <CustomInput
              name="code"
              control={control}
              inputSub="Confirmation Code"
              placeholder="Enter code"
              rules={{ required: "Code is required" }}
            />

            <CustomInput
              name="newPassword"
              control={control}
              inputSub="New Password"
              placeholder="Enter new password"
              secureTextEntry={!isPasswordVisible}
              isPasswordVisible={isPasswordVisible}
              setIsPasswordVisible={setIsPasswordVisible}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Minimum 8 characters required",
                },
                validate: (value) =>
                  /\d/.test(value) || "Password must include a number",
              }}
            />

            <CustomButton
              text="Reset Password"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            />

            <Text style={styles.link} onPress={() => router.replace("/login")}>
              Back to Sign In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConfirmCodeCom;
