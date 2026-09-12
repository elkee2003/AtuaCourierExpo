import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { signOut } from "aws-amplify/auth";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfileContext } from "../../../providers/ProfileProvider";
import TranportionType from "../TransporationType";
import BankDetails from "./bankDetails";

/*
 * IMPORTANT:
 * ------------------------------------------------------------
 * styles.js now exports createStyles(isDark).
 *
 * Do NOT use:
 *
 * import styles from "./styles";
 *
 * because that would expect styles.js to export one static
 * stylesheet object.
 *
 * Instead, we create the stylesheet inside the component using
 * the current device colour scheme.
 */
import { createStyles } from "./styles";

/**
 * ============================================================
 * EDIT PROFILE
 * ============================================================
 *
 * This screen handles:
 *
 * 1. Personal information
 * 2. Transportation information
 * 3. Operating location
 * 4. Identity verification
 * 5. Bank/payment details
 *
 * IMPORTANT UI NOTES
 * ------------------------------------------------------------
 * - Light mode uses a clean white/light interface.
 * - Dark mode uses dark surfaces with bright readable text.
 * - TextInput text and placeholders are explicitly controlled
 *   because React Native placeholders need their own color prop.
 * - The sign-out action is intentionally icon-only so it fits
 *   cleanly inside the circular header button.
 * - Validation errors are displayed in a dedicated bottom area,
 *   immediately above the Continue button.
 * - The shared stylesheet is generated dynamically using
 *   createStyles(isDark).
 */

const EditProfile = ({ onRefresh, refreshing }) => {
  /* ============================================================
     THEME
     ============================================================ */

  /*
   * Read the device's current appearance.
   *
   * useColorScheme() returns:
   *
   * - "light"
   * - "dark"
   * - null
   */
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";

  /*
   * IMPORTANT:
   * ------------------------------------------------------------
   * styles.js now exposes createStyles(isDark).
   *
   * We therefore create the actual styles object here.
   *
   * This is the fix for:
   *
   * TypeError: Cannot read property 'bckBtnCon' of undefined
   *
   * Previously this screen imported:
   *
   * import styles from "./styles";
   *
   * but styles.js no longer exported a static `styles` object.
   *
   * Now the stylesheet is correctly generated for the active
   * theme.
   */
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  /**
   * TextInput colors need to be explicitly supplied because
   * placeholderTextColor is not controlled by StyleSheet.
   *
   * Dark mode:
   * - Input text = almost white
   * - Placeholder = visible muted gray
   *
   * Light mode:
   * - Input text = dark
   * - Placeholder = medium gray
   */
  const inputColors = useMemo(
    () => ({
      placeholder: isDark ? "#8F98A8" : "#8A9099",
      text: isDark ? "#F4F7FA" : "#171A1F",
      selection: isDark ? "#FFFFFF" : "#111111",
    }),
    [isDark],
  );

  /*
   * Bank verification error shown when the user tries to continue
   * before their bank account has been successfully verified.
   */
  const [bankError, setBankError] = useState("");

  /* ============================================================
     PROFILE CONTEXT
     ============================================================ */

  const {
    firstName,
    setFirstName,

    lastName,
    setLastName,

    profilePic,
    setProfilePic,

    address,
    setAddress,

    phoneNumber,
    setPhoneNumber,

    landMark,
    setLandMark,

    courierNIN,
    setCourierNIN,

    courierNINImage,
    setCourierNINImage,

    bankCode,
    bankName,
    accountName,
    accountNumber,

    errorMessage,
    onValidateCourierInput,
  } = useProfileContext();

  /* ============================================================
     PROFILE IMAGE FUNCTIONS
     ============================================================ */

  /**
   * Open the device camera for the profile photo.
   */
  const openProfileCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera access required",
        "Please allow camera access to take a profile photo.",
      );

      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfilePic(result.assets[0].uri);
    }
  };

  /**
   * Open the gallery for the profile photo.
   */
  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfilePic(result.assets[0].uri);
    }
  };

  /**
   * Present the profile photo actions.
   */
  const showProfileImageOptions = () => {
    Alert.alert(
      "Profile photo",
      "Choose how you would like to update your profile photo.",
      [
        {
          text: "Take a photo",
          onPress: openProfileCamera,
        },
        {
          text: "Choose from gallery",
          onPress: pickProfileImage,
        },

        ...(profilePic
          ? [
              {
                text: "Remove photo",
                style: "destructive",
                onPress: () => setProfilePic(null),
              },
            ]
          : []),

        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  /* ============================================================
     COURIER NIN IMAGE
     ============================================================ */

  /**
   * Take a photo of the courier's NIN slip.
   */
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera access required",
        "Please allow camera access to photograph the NIN slip.",
      );

      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setCourierNINImage(result.assets[0].uri);
    }
  };

  /**
   * Select an existing NIN image from the gallery.
   */
  const pickNINImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setCourierNINImage(result.assets[0].uri);
    }
  };

  /**
   * Present the NIN document actions.
   */
  const showImageOptions = () => {
    Alert.alert(
      "NIN document",
      "Choose how you would like to add your NIN slip.",
      [
        {
          text: "Take a photo",
          onPress: openCamera,
        },
        {
          text: "Choose from gallery",
          onPress: pickNINImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  /* ============================================================
     NAVIGATION
     ============================================================ */

  /**
   * Validate the courier information before proceeding.
   *
   * If validation succeeds, move to the courier review screen.
   */
  const handleNextPage = () => {
    setBankError("");

    const trimmedBankName = bankName?.trim() || "";
    const trimmedBankCode = bankCode?.trim() || "";
    const trimmedAccountNumber = accountNumber?.trim() || "";
    const trimmedAccountName = accountName?.trim() || "";

    /*
     * Check whether the bank details have been verified.
     *
     * An account name is required because BankDetails only sets
     * accountName after the API successfully resolves the account.
     */
    const isBankVerified =
      trimmedBankCode.length > 0 &&
      trimmedBankName.length > 0 &&
      /^\d{10}$/.test(trimmedAccountNumber) &&
      trimmedAccountName.length > 0;

    /*
     * Stop navigation if bank verification has not completed.
     */
    if (!isBankVerified) {
      setBankError(
        "Please select your bank, enter a valid 10-digit account number, and wait for your account name to be verified before continuing.",
      );

      return;
    }

    /*
     * Continue with the other courier profile validations.
     */

    if (onValidateCourierInput()) {
      router.push("/profile/reviewprofile/reviewcourier");
    }
  };

  /* ============================================================
     SIGN OUT
     ============================================================ */

  /**
   * Actually sign the user out of the current Amplify session.
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log("Error signing out:", error);
    }
  };

  /**
   * Ask for confirmation before signing out.
   */
  const onSignout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of your courier account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",
          onPress: handleSignOut,
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  /* ============================================================
     SMALL UI HELPERS
     ============================================================ */

  /**
   * Reusable section heading.
   */
  const SectionHeader = ({ icon, title, description }) => (
    <View style={styles.formSectionHeader}>
      <View style={styles.formSectionIcon}>
        <Ionicons name={icon} style={styles.formSectionIconGlyph} />
      </View>

      <View style={styles.formSectionHeaderText}>
        <Text style={styles.formSectionTitle}>{title}</Text>

        {!!description && (
          <Text style={styles.formSectionDescription}>{description}</Text>
        )}
      </View>
    </View>
  );

  /**
   * Reusable field wrapper.
   */
  const Field = ({ label, hint, children }) => (
    <View style={styles.fieldWrapper}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.subHeader}>{label}</Text>

        {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
      </View>

      {children}
    </View>
  );

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={10}
      >
        <View style={styles.container}>
          {/* ====================================================
              HEADER
          ==================================================== */}

          <View style={styles.pageHeader}>
            {/* BACK BUTTON */}

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.bckBtnCon}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" style={styles.bckBtnIcon} />
            </TouchableOpacity>

            {/* HEADER TITLE */}

            <View style={styles.pageHeaderText}>
              <Text style={styles.title}>Edit Profile</Text>

              <Text style={styles.pageSubtitle}>
                Keep your courier information up to date
              </Text>
            </View>

            {/* ==================================================
                SIGN OUT BUTTON
                ==================================================

                IMPORTANT:

                This button is intentionally icon-only.

                The actual accessibility label remains "Sign out"
                so screen readers still understand its purpose.

                The stylesheet provides the circular 42 x 42
                container.
            ================================================== */}

            <TouchableOpacity
              style={styles.signoutBtn}
              onPress={onSignout}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons name="log-out-outline" style={styles.signoutIcon} />
            </TouchableOpacity>
          </View>

          {/* ====================================================
              FORM
          ==================================================== */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.editScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#FFFFFF" : "#111111"}
              />
            }
          >
            {/* ==================================================
                PROFILE PHOTO
            ================================================== */}

            <View style={styles.profileCard}>
              <TouchableOpacity
                style={styles.profilePicContainer}
                onPress={showProfileImageOptions}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                {profilePic ? (
                  <Image source={{ uri: profilePic }} style={styles.img} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="person-outline"
                      style={styles.profilePlaceholderIcon}
                    />

                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </View>
                )}

                {/* Camera badge */}

                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" style={styles.cameraIcon} />
                </View>
              </TouchableOpacity>

              <View style={styles.profileCardCopy}>
                <Text style={styles.profileCardTitle}>Profile photo</Text>

                <Text style={styles.profileCardDescription}>
                  Use a clear photo where your face is easily recognizable.
                </Text>

                <TouchableOpacity
                  onPress={showProfileImageOptions}
                  style={styles.changePhotoButton}
                  activeOpacity={0.75}
                >
                  <Text style={styles.changePhotoText}>
                    {profilePic ? "Change photo" : "Add photo"}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    style={styles.changePhotoIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ==================================================
                PERSONAL INFORMATION
            ================================================== */}

            <View style={styles.formSection}>
              <SectionHeader
                icon="person-outline"
                title="Personal information"
                description="Tell us about yourself"
              />

              <View style={styles.formCard}>
                <Field label="First name / company name">
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name or company name"
                    placeholderTextColor={inputColors.placeholder}
                    selectionColor={inputColors.selection}
                    style={[
                      styles.input,
                      {
                        color: inputColors.text,
                      },
                    ]}
                  />
                </Field>

                <Field label="Last name">
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor={inputColors.placeholder}
                    selectionColor={inputColors.selection}
                    style={[
                      styles.input,
                      {
                        color: inputColors.text,
                      },
                    ]}
                  />
                </Field>

                <Field label="Phone number">
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Phone number"
                    placeholderTextColor={inputColors.placeholder}
                    selectionColor={inputColors.selection}
                    keyboardType="phone-pad"
                    style={[
                      styles.input,
                      {
                        color: inputColors.text,
                      },
                    ]}
                  />
                </Field>
              </View>
            </View>

            {/* ==================================================
                TRANSPORTATION
            ================================================== */}

            <View style={styles.formSection}>
              <SectionHeader
                icon="car-outline"
                title="Transportation"
                description="Choose the type of vehicle you use"
              />

              <View style={styles.formCard}>
                <Field label="Transportation type">
                  <TranportionType />
                </Field>
              </View>
            </View>

            {/* ==================================================
                LOCATION
            ================================================== */}

            <View style={styles.formSection}>
              <SectionHeader
                icon="location-outline"
                title="Operating location"
                description="Where you primarily operate"
              />

              <View style={styles.formCard}>
                <Field label="Address">
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter your address"
                    placeholderTextColor={inputColors.placeholder}
                    selectionColor={inputColors.selection}
                    multiline
                    textAlignVertical="top"
                    style={[
                      styles.input,
                      styles.multilineInput,
                      {
                        color: inputColors.text,
                      },
                    ]}
                  />
                </Field>

                <Field label="Landmark" hint="Optional">
                  <TextInput
                    value={landMark}
                    onChangeText={setLandMark}
                    placeholder="Nearby landmark"
                    placeholderTextColor={inputColors.placeholder}
                    selectionColor={inputColors.selection}
                    style={[
                      styles.input,
                      {
                        color: inputColors.text,
                      },
                    ]}
                  />
                </Field>
              </View>
            </View>

            {/* ==================================================
                IDENTITY
            ================================================== */}

            <View style={styles.formSection}>
              <SectionHeader
                icon="shield-checkmark-outline"
                title="Identity verification"
                description="Your NIN is required to verify your courier account"
              />

              <View style={styles.formCard}>
                <Field label="NIN">
                  <TextInput
                    value={courierNIN}
                    onChangeText={setCourierNIN}
                    placeholder="Enter your 11-digit NIN"
                    placeholderTextColor={inputColors.placeholder}
                    selectionColor={inputColors.selection}
                    keyboardType="number-pad"
                    maxLength={11}
                    style={[
                      styles.input,
                      {
                        color: inputColors.text,
                      },
                    ]}
                  />
                </Field>
              </View>

              {/* ==================================================
                  NIN DOCUMENT
              ================================================== */}

              <View style={styles.documentCard}>
                <View style={styles.documentCardHeader}>
                  <View style={styles.documentIconContainer}>
                    <Ionicons
                      name="document-text-outline"
                      style={styles.documentIcon}
                    />
                  </View>

                  <View style={styles.documentHeaderCopy}>
                    <Text style={styles.documentTitle}>NIN slip</Text>

                    <Text style={styles.documentDescription}>
                      Upload a clear image of your identification document.
                    </Text>
                  </View>
                </View>

                <View style={styles.ninCard}>
                  {courierNINImage ? (
                    <>
                      <Image
                        source={{
                          uri: courierNINImage,
                        }}
                        style={styles.ninImage}
                      />

                      <View style={styles.ninActions}>
                        <TouchableOpacity
                          onPress={showImageOptions}
                          style={styles.replaceBtn}
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name="refresh-outline"
                            style={styles.replaceIcon}
                          />

                          <Text style={styles.replaceText}>Replace</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setCourierNINImage(null)}
                          style={styles.removeBtn}
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name="trash-outline"
                            style={styles.removeIcon}
                          />

                          <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={showImageOptions}
                      style={styles.uploadBox}
                      activeOpacity={0.78}
                    >
                      <View style={styles.uploadIconContainer}>
                        <Ionicons
                          name="cloud-upload-outline"
                          style={styles.uploadIcon}
                        />
                      </View>

                      <Text style={styles.uploadTitle}>Upload NIN slip</Text>

                      <Text style={styles.uploadSub}>
                        Take a clear photo or choose one from your gallery
                      </Text>

                      <View style={styles.uploadAction}>
                        <Text style={styles.uploadActionText}>
                          Choose document
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          style={styles.uploadActionIcon}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* ==================================================
                BANK DETAILS
            ================================================== */}

            <View style={styles.formSection}>
              <SectionHeader
                icon="card-outline"
                title="Payment details"
                description="Where your courier earnings will be paid"
              />

              <View style={styles.formCard}>
                <BankDetails onBankDetailsChanged={() => setBankError("")} />
              </View>
            </View>

            {/* ==================================================
                SECURITY NOTE
            ================================================== */}

            <View style={styles.securityCard}>
              <View style={styles.securityIconContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  style={styles.securityIcon}
                />
              </View>

              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>
                  Your information is protected
                </Text>

                <Text style={styles.securityText}>
                  Your identity and payment information are used only for
                  courier verification, account security and payment processing.
                </Text>
              </View>
            </View>

            {/* Bottom breathing room so the final content
                isn't hidden behind the fixed action area. */}
            <View style={styles.formBottomSpacer} />
          </ScrollView>

          {/* ======================================================
              BOTTOM ERROR MESSAGE
          ======================================================

              The error is deliberately outside the ScrollView.

              This means:
              - Validation errors remain visible.
              - The user doesn't need to scroll to find them.
              - They appear directly above the Continue button.
              - The stylesheet controls the exact appearance.
          ====================================================== */}

          {/* ============================================================
    FIXED VALIDATION ERROR
    ============================================================

    This displays either:

    1. The bank verification error from this screen.
    2. The general courier profile validation error from
       ProfileProvider.

    The bank error takes priority when it exists.
============================================================ */}

          {!!(bankError?.trim() || errorMessage?.trim()) && (
            <View style={styles.fixedErrorArea} pointerEvents="none">
              <View style={styles.errorContainer}>
                {/* Error icon */}
                <View style={styles.errorIconContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    style={styles.errorIcon}
                  />
                </View>

                {/* Actual validation message */}
                <Text
                  style={styles.error}
                  numberOfLines={5}
                  ellipsizeMode="tail"
                >
                  {errorMessage || bankError}
                </Text>
              </View>
            </View>
          )}

          {/* ======================================================
              CONTINUE BUTTON
          ====================================================== */}

          <View style={styles.bottomAction}>
            <TouchableOpacity
              onPress={handleNextPage}
              style={styles.nxtBtn}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="Continue to profile review"
            >
              <View style={styles.nextButtonContent}>
                <View style={styles.nextButtonCopy}>
                  <Text style={styles.nextButtonTitle}>Continue</Text>

                  <Text style={styles.nextButtonSubtitle}>
                    Review your profile
                  </Text>
                </View>

                <View style={styles.nextButtonIconContainer}>
                  <MaterialIcons
                    name="arrow-forward"
                    style={styles.nxtBtnIcon}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;
