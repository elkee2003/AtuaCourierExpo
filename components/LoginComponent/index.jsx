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

const Index = () => {
  const { control, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSignInPressed = async (data) => {
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

        if (!accessToken) {
          throw new Error("Unable to fetch access token.");
        }

        const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));

        const userGroups = tokenPayload["cognito:groups"] || [];
        const userRole = tokenPayload["custom:role"] || "";

        const allowedRole = "courier";

        if (userGroups.includes(allowedRole) || userRole === allowedRole) {
          router.replace("/home");
        } else {
          Alert.alert(
            "Access Denied",
            `This account is registered as "${
              userRole || userGroups[0] || "different"
            }". Please use the correct app.`,
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
        // keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Image source={Logo} style={styles.logo} />

          <View style={styles.header}>
            <Text style={styles.title}>Courier Portal</Text>
            <Text style={styles.subtitle}>Sign in to manage deliveries</Text>
          </View>

          <View style={styles.card}>
            <CustomInput
              name="email"
              control={control}
              placeholder="Enter your email"
              inputSub="Email"
              rules={{
                required: "Email is required",
              }}
            />

            <CustomInput
              name="password"
              control={control}
              placeholder="Enter your password"
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

            <CustomButton
              text="Sign In"
              onPress={handleSubmit(onSignInPressed)}
              loading={loading}
            />

            <Text
              style={styles.link}
              onPress={() => router.push("/login/forgotpassword")}
            >
              Forgot Password?
            </Text>

            <Text
              style={styles.link}
              onPress={() => router.push("/login/signup")}
            >
              Create Account
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Index;
