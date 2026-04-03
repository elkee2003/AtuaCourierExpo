import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";

const ConfirmEmailCom = () => {
  const { username } = useLocalSearchParams();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);

  const onSubmit = async ({ confirmationCode }) => {
    if (!username) {
      Alert.alert("Error", "Session expired. Please sign up again.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await confirmSignUp({
        username,
        confirmationCode: confirmationCode.trim(),
      });

      Alert.alert("Success", "Your email has been verified.");
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error?.message || "Something went wrong.",
      );
      console.log("Error confirming sign-up:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!username) {
      Alert.alert("Error", "Session expired.");
      return;
    }

    if (loadingCode) return;
    setLoadingCode(true);

    try {
      await resendSignUpCode({ username });
      Alert.alert("Code Sent", "A new code has been sent to your email.");
    } catch (error) {
      Alert.alert("Resend Failed", error?.message || "Something went wrong.");
    } finally {
      setLoadingCode(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Verify your email</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{" "}
                <Text style={styles.bold}>{username}</Text>
              </Text>
            </View>

            {/* Input */}
            <Controller
              name="confirmationCode"
              control={control}
              defaultValue=""
              rules={{
                required: "Code is required",
                minLength: { value: 6, message: "Enter a valid 6-digit code" },
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmationCode && styles.inputError,
                  ]}
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              )}
            />
            {errors.confirmationCode && (
              <Text style={styles.errorText}>
                {errors.confirmationCode.message}
              </Text>
            )}

            {/* Primary Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify Email</Text>
              )}
            </TouchableOpacity>

            {/* Secondary Buttons */}
            <View style={styles.secondarySection}>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={loadingCode}
              >
                <Text style={styles.secondaryText}>
                  {loadingCode ? "Resending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.secondaryText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConfirmEmailCom;
