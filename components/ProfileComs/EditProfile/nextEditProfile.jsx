import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo } from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useProfileContext } from "../../../providers/ProfileProvider";
import { createStyles } from "./styles";

/**
 * ================================================================
 * ADD GUARANTOR
 * ================================================================
 *
 * Second stage of courier profile registration.
 *
 * The courier provides:
 *
 * - Guarantor identity
 * - Profession
 * - Address
 * - Phone number
 * - Relationship
 * - NIN
 * - NIN document
 * - Optional email
 *
 * ---------------------------------------------------------------
 * IMPORTANT KEYBOARD / INPUT FIX
 * ---------------------------------------------------------------
 *
 * SectionHeader and Field are intentionally defined OUTSIDE the
 * NextEditProfile component.
 *
 * Why?
 *
 * The values in this screen come from ProfileContext. Every time
 * the courier types a character, one of the context setters runs.
 * That causes NextEditProfile to render again.
 *
 * If Field or SectionHeader are declared INSIDE NextEditProfile,
 * React receives a new component function on every render.
 *
 * That can cause the TextInput subtree to be recreated, causing:
 *
 *     type one character
 *          ↓
 *     component re-renders
 *          ↓
 *     TextInput loses focus
 *          ↓
 *     keyboard closes
 *
 * By keeping these helper components outside the screen component,
 * their identity remains stable across renders.
 *
 * This is especially important for controlled TextInputs.
 */

/* =================================================================
   STABLE SECTION HEADER
   ================================================================= */

/**
 * Reusable section heading.
 *
 * IMPORTANT:
 * This component lives outside NextEditProfile so React does not
 * receive a new component type every time the form state changes.
 */
const SectionHeader = ({ styles, icon, title, description }) => (
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

/* =================================================================
   STABLE FIELD WRAPPER
   ================================================================= */

/**
 * Reusable field wrapper.
 *
 * IMPORTANT:
 * This component also lives outside NextEditProfile.
 *
 * The styles object is passed in as a prop because the stylesheet
 * is generated dynamically according to the current colour scheme.
 */
const Field = ({ styles, label, hint, children }) => (
  <View style={styles.fieldWrapper}>
    <View style={styles.fieldLabelRow}>
      <Text style={styles.subHeader}>{label}</Text>

      {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>

    {children}
  </View>
);

/* =================================================================
   COMPONENT
   ================================================================= */

const NextEditProfile = () => {
  /* ================================================================
     THEME
     ================================================================ */

  const colorScheme = useColorScheme();

  /*
   * Determines whether the device is currently using dark mode.
   */
  const isDark = colorScheme === "dark";

  /*
   * Generate all styles from the current theme.
   *
   * The shared styles.js must expose:
   *
   * export const createStyles = (isDark = false) => {
   *   ...
   * };
   */
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  /* ================================================================
     INPUT COLORS
     ================================================================ */

  /*
   * TextInput colors are defined here rather than relying entirely
   * on the stylesheet.
   *
   * This prevents the common dark-mode problem where the input
   * background becomes dark but the entered text remains black.
   */
  const inputColors = useMemo(
    () => ({
      /*
       * Entered text.
       *
       * Dark mode needs a bright foreground so the user's text
       * remains clearly visible.
       */
      text: isDark ? "#F5F7FA" : "#171A1F",

      /*
       * Placeholder text.
       *
       * Muted enough to remain secondary while still being readable.
       */
      placeholder: isDark ? "#8D96A5" : "#858B95",

      /*
       * Cursor / selection colour.
       */
      selection: isDark ? "#FFFFFF" : "#111111",
    }),
    [isDark],
  );

  /* ================================================================
     PROFILE CONTEXT
     ================================================================ */

  const {
    /* --------------------------------------------------------------
       Guarantor identity
       -------------------------------------------------------------- */

    guarantorName,
    setGuarantorName,

    guarantorLastName,
    setGuarantorLastName,

    guarantorProfession,
    setGuarantorProfession,

    /* --------------------------------------------------------------
       Contact / relationship
       -------------------------------------------------------------- */

    guarantorNumber,
    setGuarantorNumber,

    guarantorRelationship,
    setGuarantorRelationship,

    guarantorAddress,
    setGuarantorAddress,

    guarantorEmail,
    setGuarantorEmail,

    /* --------------------------------------------------------------
       Identity verification
       -------------------------------------------------------------- */

    guarantorNIN,
    setGuarantorNIN,

    guarantorNINImage,
    setGuarantorNINImage,

    /* --------------------------------------------------------------
       Validation
       -------------------------------------------------------------- */

    errorMessage,
    onValidateGuarantorInput,
  } = useProfileContext();

  /* ================================================================
     IMAGE PICKER
     ================================================================ */

  /**
   * Open the device camera and capture the guarantor's
   * identification document.
   */
  const openCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera access required",
          "Please allow camera access to photograph the guarantor's NIN slip.",
        );

        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setGuarantorNINImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error opening camera:", error);

      Alert.alert(
        "Camera error",
        "We could not open the camera. Please try again.",
      );
    }
  };

  /**
   * Open the device gallery and select the guarantor's
   * identification document.
   */
  const pickNINImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setGuarantorNINImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error selecting image:", error);

      Alert.alert(
        "Gallery error",
        "We could not open your gallery. Please try again.",
      );
    }
  };

  /**
   * Give the courier the choice between taking a new photo
   * and selecting an existing document.
   */
  const showImageOptions = () => {
    Alert.alert(
      "Guarantor NIN",
      "Choose how you would like to add the guarantor's identification document.",
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

  /* ================================================================
     NAVIGATION
     ================================================================ */

  /**
   * Validate guarantor information before moving to the
   * final review screen.
   *
   * The validation function remains the source of truth for
   * required fields and business rules.
   */
  const handleNextPage = () => {
    if (onValidateGuarantorInput()) {
      router.push("/profile/reviewprofile/reviewguarantor");
    }
  };

  /* ================================================================
     SHARED TEXT INPUT PROPS
     ================================================================ */

  /*
   * Every normal TextInput receives these properties.
   *
   * IMPORTANT:
   * This object is only used to supply visual/input properties.
   *
   * The value and onChangeText props remain on each individual
   * TextInput because they are controlled by ProfileContext.
   */
  const inputProps = {
    placeholderTextColor: inputColors.placeholder,

    selectionColor: inputColors.selection,

    style: [
      styles.input,
      {
        color: inputColors.text,
      },
    ],
  };

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={20}
      >
        <View style={styles.container}>
          {/* ========================================================
              HEADER
          ======================================================== */}

          <View style={styles.pageHeader}>
            {/* ------------------------------------------------------
                BACK BUTTON
            ------------------------------------------------------ */}

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.bckBtnCon}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons name="arrow-back" style={styles.bckBtnIcon} />
            </TouchableOpacity>

            {/* ------------------------------------------------------
                HEADER TEXT
            ------------------------------------------------------ */}

            <View style={styles.pageHeaderText}>
              <Text style={styles.title}>Add Guarantor</Text>

              <Text style={styles.pageSubtitle}>
                Provide the details of your guarantor
              </Text>
            </View>

            {/* ------------------------------------------------------
                STEP INDICATOR
            ------------------------------------------------------ */}

            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeNumber}>2</Text>

              <Text style={styles.stepBadgeText}>of 2</Text>
            </View>
          </View>

          {/* ========================================================
              FORM CONTENT
          ======================================================== */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.editScrollContent}
          >
            {/* ======================================================
                INTRODUCTION
            ====================================================== */}
            <View style={styles.formIntroCard}>
              <View style={styles.formIntroIconContainer}>
                <Ionicons name="people-outline" style={styles.formIntroIcon} />
              </View>

              <View style={styles.formIntroContent}>
                <Text style={styles.formIntroTitle}>Guarantor information</Text>

                <Text style={styles.formIntroText}>
                  Add someone who can verify your identity and vouch for you as
                  a courier.
                </Text>
              </View>
            </View>
            {/* ======================================================
                PERSONAL INFORMATION
            ====================================================== */}
            <View style={styles.formSection}>
              <SectionHeader
                styles={styles}
                icon="person-outline"
                title="Personal information"
                description="Basic details about your guarantor"
              />

              <View style={styles.formCard}>
                {/* --------------------------------------------------
                    FIRST NAME
                -------------------------------------------------- */}

                <Field styles={styles} label="First name">
                  <TextInput
                    {...inputProps}
                    value={guarantorName}
                    onChangeText={setGuarantorName}
                    placeholder="Guarantor's first name"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </Field>

                {/* --------------------------------------------------
                    LAST NAME
                -------------------------------------------------- */}

                <Field styles={styles} label="Last name">
                  <TextInput
                    {...inputProps}
                    value={guarantorLastName}
                    onChangeText={setGuarantorLastName}
                    placeholder="Guarantor's last name"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </Field>

                {/* --------------------------------------------------
                    PROFESSION
                -------------------------------------------------- */}

                <Field styles={styles} label="Profession">
                  <TextInput
                    {...inputProps}
                    value={guarantorProfession}
                    onChangeText={setGuarantorProfession}
                    placeholder="e.g. Lawyer, Engineer, Teacher"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </Field>
              </View>
            </View>
            {/* ======================================================
                CONTACT & RELATIONSHIP
            ====================================================== */}
            <View style={styles.formSection}>
              <SectionHeader
                styles={styles}
                icon="people-outline"
                title="Contact & relationship"
                description="How you know your guarantor"
              />

              <View style={styles.formCard}>
                {/* --------------------------------------------------
                    PHONE NUMBER
                -------------------------------------------------- */}

                <Field styles={styles} label="Phone number">
                  <TextInput
                    {...inputProps}
                    value={guarantorNumber}
                    onChangeText={(text) => {
                      /*
                       * Only allow numeric input and prevent
                       * the number from exceeding the Nigerian
                       * 11-digit phone number format.
                       *
                       * IMPORTANT:
                       * We do not dismiss the keyboard here.
                       */
                      if (/^\d{0,11}$/.test(text)) {
                        setGuarantorNumber(text);
                      }
                    }}
                    placeholder="08000000000"
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </Field>

                {/* --------------------------------------------------
                    RELATIONSHIP
                -------------------------------------------------- */}

                <Field styles={styles} label="Relationship">
                  <TextInput
                    {...inputProps}
                    value={guarantorRelationship}
                    onChangeText={setGuarantorRelationship}
                    placeholder="e.g. Friend, Mother, Boss"
                    autoCapitalize="sentences"
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

                {/* --------------------------------------------------
                    ADDRESS
                -------------------------------------------------- */}

                <Field styles={styles} label="Address">
                  <TextInput
                    {...inputProps}
                    value={guarantorAddress}
                    onChangeText={setGuarantorAddress}
                    placeholder="Enter your guarantor's address"
                    autoCapitalize="sentences"
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
              </View>
            </View>
            {/* ======================================================
                IDENTITY VERIFICATION
            ====================================================== */}
            <View style={styles.formSection}>
              <SectionHeader
                styles={styles}
                icon="shield-checkmark-outline"
                title="Identity verification"
                description="Provide your guarantor's government identification"
              />

              <View style={styles.formCard}>
                <Field styles={styles} label="Guarantor's NIN">
                  <TextInput
                    {...inputProps}
                    value={guarantorNIN}
                    onChangeText={(text) => {
                      /*
                       * NIN is numeric and must not exceed
                       * 11 digits.
                       *
                       * The input remains focused while
                       * this state is updated.
                       */
                      if (/^\d{0,11}$/.test(text)) {
                        setGuarantorNIN(text);
                      }
                    }}
                    placeholder="Enter guarantor's 11-digit NIN"
                    keyboardType="number-pad"
                    maxLength={11}
                  />
                </Field>
              </View>

              {/* ----------------------------------------------------
                  GUARANTOR NIN DOCUMENT
              ---------------------------------------------------- */}

              <View style={styles.documentCard}>
                <View style={styles.documentCardHeader}>
                  <View style={styles.documentIconContainer}>
                    <Ionicons
                      name="document-text-outline"
                      style={styles.documentIcon}
                    />
                  </View>

                  <View style={styles.documentHeaderCopy}>
                    <Text style={styles.documentTitle}>Guarantor NIN slip</Text>

                    <Text style={styles.documentDescription}>
                      Upload a clear image of the guarantor's identification
                      document.
                    </Text>
                  </View>
                </View>

                <View style={styles.ninCard}>
                  {guarantorNINImage ? (
                    <>
                      {/* ============================================
                          DOCUMENT PREVIEW
                      ============================================ */}

                      <View style={styles.documentImageWrapper}>
                        <Image
                          source={{
                            uri: guarantorNINImage,
                          }}
                          style={styles.ninImage}
                        />

                        {/* ------------------------------------------
                            DOCUMENT STATUS
                        ------------------------------------------ */}

                        <View style={styles.documentAddedBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            style={styles.documentAddedIcon}
                          />

                          <Text style={styles.documentAddedText}>
                            Document added
                          </Text>
                        </View>
                      </View>

                      {/* ==========================================
                          DOCUMENT ACTIONS
                      ========================================== */}

                      <View style={styles.ninActions}>
                        <TouchableOpacity
                          onPress={showImageOptions}
                          style={styles.replaceBtn}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Replace guarantor NIN document"
                        >
                          <Ionicons
                            name="refresh-outline"
                            style={styles.replaceIcon}
                          />

                          <Text style={styles.replaceText}>Replace</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setGuarantorNINImage(null)}
                          style={styles.removeBtn}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Remove guarantor NIN document"
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
                    /* ================================================
                       UPLOAD STATE
                    ================================================ */

                    <TouchableOpacity
                      onPress={showImageOptions}
                      style={styles.uploadBox}
                      activeOpacity={0.78}
                      accessibilityRole="button"
                      accessibilityLabel="Upload guarantor NIN slip"
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
            {/* ======================================================
                OPTIONAL EMAIL
            ====================================================== */}
            <View style={styles.formSection}>
              <SectionHeader
                styles={styles}
                icon="mail-outline"
                title="Additional contact"
                description="Optional contact information"
              />

              <View style={styles.formCard}>
                <Field styles={styles} label="Email address" hint="Optional">
                  <TextInput
                    {...inputProps}
                    value={guarantorEmail}
                    onChangeText={setGuarantorEmail}
                    placeholder="guarantor@example.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                </Field>
              </View>
            </View>
            {/* ======================================================
                SECURITY NOTICE
            ====================================================== */}
            <View style={styles.securityCard}>
              <View style={styles.securityIconContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  style={styles.securityIcon}
                />
              </View>

              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>
                  Information is protected
                </Text>

                <Text style={styles.securityText}>
                  Guarantor information is collected for courier verification
                  and account security.
                </Text>
              </View>
            </View>
            {/* ------------------------------------------------------
                BOTTOM BREATHING ROOM
            ------------------------------------------------------ */}
            <View style={styles.formBottomSpacer} />
          </ScrollView>

          {/* ========================================================
              FIXED VALIDATION ERROR
          ========================================================

              The Continue button is fixed at the bottom of the
              screen. Therefore, the validation error is also
              positioned explicitly above it.

              This prevents the error from being:

              - hidden behind the Continue button
              - pushed outside the visible area
              - lost when the user is at the bottom of the form

              The error remains visible until the validation state
              changes in ProfileContext.
          ======================================================== */}

          {!!errorMessage?.trim() && (
            <View style={styles.fixedErrorArea} pointerEvents="none">
              <View style={styles.errorContainer}>
                {/* --------------------------------------------------
                    ERROR ICON
                -------------------------------------------------- */}

                <View style={styles.errorIconContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    style={styles.errorIcon}
                  />
                </View>

                {/* --------------------------------------------------
                    ACTUAL VALIDATION MESSAGE
                -------------------------------------------------- */}

                <Text
                  style={styles.error}
                  numberOfLines={4}
                  ellipsizeMode="tail"
                >
                  {errorMessage}
                </Text>
              </View>
            </View>
          )}

          {/* ========================================================
              FIXED CONTINUE ACTION
          ======================================================== */}

          <View style={styles.bottomAction}>
            <TouchableOpacity
              onPress={handleNextPage}
              style={styles.nxtBtn}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="Continue to final review"
            >
              <View style={styles.nextButtonContent}>
                {/* --------------------------------------------------
                    BUTTON COPY
                -------------------------------------------------- */}

                <View style={styles.nextButtonCopy}>
                  <Text style={styles.nextButtonTitle}>Continue</Text>

                  <Text style={styles.nextButtonSubtitle}>
                    Review & finish registration
                  </Text>
                </View>

                {/* --------------------------------------------------
                    BUTTON ICON
                -------------------------------------------------- */}

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

export default NextEditProfile;
