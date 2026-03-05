import { signUp } from "aws-amplify/auth";
import Checkbox from "expo-checkbox";
import { router } from "expo-router";
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

import CustomButton from "./customButtons";
import CustomInput from "./customInput";
import styles from "./styles";

const SignupCom = () => {
  const { control, handleSubmit, getValues } = useForm();
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const role = "courier";

  const onSignUp = async (data) => {
    if (!agree) {
      Alert.alert("Please accept terms first.");
      return;
    }

    setLoading(true);

    try {
      await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            "custom:role": role,
          },
          autoSignIn: true,
        },
      });

      router.push({
        pathname: "/login/confirmemail",
        params: { username: data.email },
      });
    } catch (error) {
      Alert.alert("Sign Up Failed", error.message);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        // keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Courier Account</Text>
            <Text style={styles.subtitle}>Start delivering with Atua</Text>
          </View>

          <View style={styles.card}>
            <CustomInput
              name="email"
              control={control}
              placeholder="Enter your email"
              inputSub="Email"
              rules={{ required: "Email is required" }}
            />

            <CustomInput
              name="password"
              control={control}
              placeholder="Create password"
              inputSub="Password"
              secureTextEntry={!isPasswordVisible}
              isPasswordVisible={isPasswordVisible}
              setIsPasswordVisible={setIsPasswordVisible}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Minimum 8 characters",
                },
              }}
            />

            <CustomInput
              name="confirmPassword"
              control={control}
              placeholder="Confirm password"
              inputSub="Confirm Password"
              secureTextEntry={!isConfirmVisible}
              isPasswordVisible={isConfirmVisible}
              setIsPasswordVisible={setIsConfirmVisible}
              rules={{
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              }}
            />

            <View style={styles.checkboxRow}>
              <Checkbox value={agree} onValueChange={setAgree} />
              <Text style={styles.checkboxText}>
                I agree to the Terms and Privacy Policy
              </Text>
            </View>

            <CustomButton
              text="Create Account"
              onPress={handleSubmit(onSignUp)}
              loading={loading}
            />

            <Text style={styles.link} onPress={() => router.push("/login")}>
              Already have an account? Sign In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupCom;
