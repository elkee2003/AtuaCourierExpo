import { fetchAuthSession, signIn, signOut } from "aws-amplify/auth";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../assets/images/Atua.png";

import CustomButton from "./customButtons";
import CustomInput from "./customInput";
import styles from "./styles";

const SignInCourier = () => {
  const { control, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSignIn = async (data) => {
    if (loading) return;

    setLoading(true);

    try {
      const { isSignedIn } = await signIn({
        username: data.email,
        password: data.password,
      });

      if (isSignedIn) {
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        if (!accessToken) throw new Error("Unable to fetch access token");

        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const userGroups = payload["cognito:groups"] || [];
        const userRole = payload["custom:role"] || "";

        const allowedRole = "courier";

        if (userGroups.includes(allowedRole) || userRole === allowedRole) {
          router.replace("/home");
        } else {
          Alert.alert(
            "Access Denied",
            `This account is registered as a "${userRole || userGroups[0] || "different"}". Please use the correct app.`,
          );
          await signOut();
        }
      }
    } catch (error) {
      Alert.alert("Sign In Failed", error.message || "Something went wrong.");
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
          {/* Logo */}
          <Image source={Logo} style={styles.logo} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to Atua (Courier)
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <CustomInput
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              rules={{
                required: "Email is required",
              }}
            />

            <CustomInput
              control={control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!isPasswordVisible}
              isPassword
              isVisible={isPasswordVisible}
              setIsVisible={setIsPasswordVisible}
              rules={{
                required: "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters" },
                validate: (value) =>
                  /\d/.test(value) ||
                  "Password must include at least one number",
              }}
            />

            <CustomButton
              text={loading ? "Signing In..." : "Sign In"}
              onPress={handleSubmit(onSignIn)}
              loading={loading}
            />

            <View style={styles.linkRow}>
              <Text
                style={styles.secondaryText}
                onPress={() => router.push("/login/forgotpassword")}
              >
                Forgot Password?
              </Text>

              <Text
                style={styles.secondaryText}
                onPress={() => router.push("/login/signup")}
              >
                Create Account
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInCourier;
