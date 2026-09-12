import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo } from "react";

import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useProfileContext } from "../../../providers/ProfileProvider";
import { createStyles } from "./styles";

/**
 * ================================================================
 * REVIEW COURIER PROFILE
 * ================================================================
 *
 * This screen gives the courier one final opportunity to review
 * the information entered on the first registration screen
 * before moving to guarantor information.
 *
 * DESIGN / THEME
 * ---------------------------------------------------------------
 * - Light mode uses a clean white/light interface.
 * - Dark mode uses dark elevated surfaces.
 * - Text remains readable in both modes.
 * - Success/verification states use restrained green.
 * - The bottom Continue action remains dark and premium.
 *
 * SAFE AREA
 * ---------------------------------------------------------------
 * This is a full-screen page, so SafeAreaView is used here.
 *
 * STYLES
 * ---------------------------------------------------------------
 * The shared styles.js exposes createStyles(isDark).
 * This allows the entire screen to react to the device/system
 * appearance setting.
 */

/* =================================================================
   COMPONENT
   ================================================================= */

const ReviewCourierCom = () => {
  /* ================================================================
     THEME
     ================================================================ */

  const colorScheme = useColorScheme();

  /*
   * true  = dark mode
   * false = light mode
   */
  const isDark = colorScheme === "dark";

  /*
   * Generate the stylesheet from the current theme.
   *
   * IMPORTANT:
   * styles.js must export:
   *
   * export const createStyles = (isDark = false) => {
   *   ...
   * };
   */
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  /* ================================================================
     PROFILE CONTEXT
     ================================================================ */

  const {
    /* --------------------------------------------------------------
       Personal information
       -------------------------------------------------------------- */

    firstName,
    lastName,
    profilePic,

    /* --------------------------------------------------------------
       Transportation
       -------------------------------------------------------------- */

    transportationType,
    vehicleClass,
    model,
    vehicleColour,
    plateNumber,

    /* --------------------------------------------------------------
       Maxi
       -------------------------------------------------------------- */

    maxiImages,

    /* --------------------------------------------------------------
       Location / contact
       -------------------------------------------------------------- */

    address,
    phoneNumber,
    landMark,

    /* --------------------------------------------------------------
       Identity
       -------------------------------------------------------------- */

    courierNIN,
    courierNINImage,

    /* --------------------------------------------------------------
       Bank
       -------------------------------------------------------------- */

    bankName,
    accountName,
    accountNumber,

    /* --------------------------------------------------------------
       Maxi description
       -------------------------------------------------------------- */

    maxiDescription,
  } = useProfileContext();

  /* ================================================================
     NAVIGATION
     ================================================================ */

  /**
   * Continue to the guarantor information screen.
   */
  const handleNextPage = () => {
    router.push("/profile/nexteditprofile");
  };

  /**
   * Return to the previous profile-editing screen.
   */
  const handleEditProfile = () => {
    router.back();
  };

  /* ================================================================
     HELPERS
     ================================================================ */

  /**
   * Display a friendly fallback when a value is missing.
   */
  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "Not provided";
    }

    return String(value);
  };

  /**
   * Hide most of the bank account number while keeping
   * the last four digits visible for confirmation.
   *
   * Example:
   *
   * 0123456789
   *
   * becomes:
   *
   * •••• •••• 6789
   */
  const maskAccountNumber = (value) => {
    if (!value) {
      return "Not provided";
    }

    const account = String(value);

    if (account.length <= 4) {
      return account;
    }

    return `•••• •••• ${account.slice(-4)}`;
  };

  /**
   * Generate initials for the profile avatar when no
   * profile image exists.
   */
  const getInitials = () => {
    const first = firstName?.trim()?.charAt(0) || "";

    const last = lastName?.trim()?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  /**
   * Determine whether a value has actually been provided.
   */
  const isProvided = (value) =>
    value !== null && value !== undefined && String(value).trim() !== "";

  /* ================================================================
     SECTION HEADER
     ================================================================ */

  /**
   * Reusable section heading.
   *
   * Keeping this as a component makes the review page visually
   * consistent and prevents duplicated layout code.
   */
  const SectionHeader = ({ icon, title, description }) => (
    <View style={styles.reviewSectionHeader}>
      <View style={styles.reviewSectionIcon}>
        <Ionicons name={icon} style={styles.reviewSectionIconGlyph} />
      </View>

      <View style={styles.reviewSectionHeading}>
        <Text style={styles.reviewSectionTitle}>{title}</Text>

        {!!description && (
          <Text style={styles.reviewSectionDescription}>{description}</Text>
        )}
      </View>
    </View>
  );

  /* ================================================================
     REVIEW FIELD
     ================================================================ */

  /**
   * Reusable review field.
   *
   * sensitive=true is used for bank account numbers so that
   * only the final four digits are exposed.
   */
  const ReviewField = ({
    icon,
    label,
    value,
    last = false,
    sensitive = false,
  }) => {
    const finalValue = sensitive
      ? maskAccountNumber(value)
      : displayValue(value);

    const missing = finalValue === "Not provided";

    return (
      <View style={[styles.reviewField, last && styles.reviewFieldLast]}>
        <View style={styles.reviewFieldIconContainer}>
          <Ionicons name={icon} style={styles.reviewFieldIcon} />
        </View>

        <View style={styles.reviewFieldContent}>
          <Text style={styles.reviewFieldLabel}>{label}</Text>

          <Text
            style={[
              styles.reviewFieldValue,
              missing && styles.reviewFieldValueMissing,
            ]}
          >
            {finalValue}
          </Text>
        </View>
      </View>
    );
  };

  /* ================================================================
     PROFILE INITIALS
     ================================================================ */

  const initials = getInitials();

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.reviewContainer}>
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <View style={styles.reviewHeader}>
          {/* --------------------------------------------------------
              BACK BUTTON
          -------------------------------------------------------- */}

          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.bckBtnCon}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back to edit profile"
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
            }}
          >
            <Ionicons name="arrow-back" style={styles.bckBtnIcon} />
          </TouchableOpacity>

          {/* --------------------------------------------------------
              TITLE
          -------------------------------------------------------- */}

          <View style={styles.reviewHeaderText}>
            <Text style={styles.title}>Review Profile</Text>

            <Text style={styles.reviewHeaderSubtitle}>
              Check your details before continuing
            </Text>
          </View>

          {/* --------------------------------------------------------
              STEP INDICATOR
          -------------------------------------------------------- */}

          <View style={styles.reviewStepBadge}>
            <Text style={styles.reviewStepNumber}>1</Text>

            <Text style={styles.reviewStepText}>of 2</Text>
          </View>
        </View>

        {/* ==========================================================
            CONTENT
        ========================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.reviewScrollContent}
        >
          {/* ========================================================
              INTRODUCTION
          ======================================================== */}

          <View style={styles.reviewIntroCard}>
            <View style={styles.reviewIntroIconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                style={styles.reviewIntroIcon}
              />
            </View>

            <View style={styles.reviewIntroContent}>
              <Text style={styles.reviewIntroTitle}>Almost there</Text>

              <Text style={styles.reviewIntroText}>
                Review the information below and make sure everything is correct
                before adding your guarantor details.
              </Text>
            </View>
          </View>

          {/* ========================================================
              PROFILE SUMMARY
          ======================================================== */}

          <View style={styles.profileReviewCard}>
            {/* ------------------------------------------------------
                PROFILE IMAGE
            ------------------------------------------------------ */}

            <View style={styles.reviewProfileImageWrapper}>
              {profilePic ? (
                <Image
                  source={{
                    uri: profilePic,
                  }}
                  style={styles.reviewProfileImage}
                />
              ) : (
                <View style={styles.reviewProfilePlaceholder}>
                  <Text style={styles.reviewProfileInitials}>
                    {initials || "?"}
                  </Text>
                </View>
              )}
            </View>

            {/* ------------------------------------------------------
                PROFILE INFORMATION
            ------------------------------------------------------ */}

            <View style={styles.profileReviewInfo}>
              <Text style={styles.profileReviewName} numberOfLines={1}>
                {displayValue(firstName)} {lastName || ""}
              </Text>

              <View style={styles.profileReviewRole}>
                <View style={styles.profileReviewStatusDot} />

                <Text style={styles.profileReviewRoleText}>
                  Courier profile
                </Text>
              </View>

              {!!transportationType && (
                <View style={styles.transportBadge}>
                  <Ionicons
                    name="car-outline"
                    style={styles.transportBadgeIcon}
                  />

                  <Text style={styles.transportBadgeText}>
                    {transportationType}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ========================================================
              PERSONAL INFORMATION
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="person-outline"
              title="Personal information"
              description="Your basic courier account details"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="person-outline"
                label="First name"
                value={firstName}
              />

              <ReviewField
                icon="person-outline"
                label="Last name"
                value={lastName}
              />

              <ReviewField
                icon="call-outline"
                label="Phone number"
                value={phoneNumber}
                last
              />
            </View>
          </View>

          {/* ========================================================
              TRANSPORTATION
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="car-outline"
              title="Transportation"
              description="The vehicle you will use for deliveries"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="navigate-outline"
                label="Transportation type"
                value={transportationType}
              />

              {!!isProvided(vehicleClass) && (
                <ReviewField
                  icon="layers-outline"
                  label="Vehicle class"
                  value={vehicleClass}
                />
              )}

              {!!isProvided(model) && (
                <ReviewField
                  icon="car-sport-outline"
                  label="Model"
                  value={model}
                />
              )}

              {!!isProvided(vehicleColour) && (
                <ReviewField
                  icon="color-palette-outline"
                  label="Vehicle colour"
                  value={vehicleColour}
                />
              )}

              {!!isProvided(plateNumber) && (
                <ReviewField
                  icon="pricetag-outline"
                  label="Plate number"
                  value={plateNumber}
                />
              )}

              {!!isProvided(maxiDescription) && (
                <ReviewField
                  icon="document-text-outline"
                  label="Vehicle description"
                  value={maxiDescription}
                  last
                />
              )}

              {/*
               * If there are no optional transportation fields,
               * the transportation type should visually behave
               * as the final row.
               */}
              {!isProvided(maxiDescription) &&
                !isProvided(plateNumber) &&
                !isProvided(vehicleColour) &&
                !isProvided(model) &&
                !isProvided(vehicleClass) && (
                  <View style={styles.reviewFieldLast} />
                )}
            </View>
          </View>

          {/* ========================================================
              MAXI VEHICLE PHOTOS
          ======================================================== */}

          {transportationType === "MAXI" && maxiImages?.length > 0 && (
            <View style={styles.reviewSection}>
              <SectionHeader
                icon="images-outline"
                title="Vehicle photos"
                description={`${maxiImages.length} ${
                  maxiImages.length === 1 ? "photo" : "photos"
                } uploaded`}
              />

              <View style={styles.vehicleGalleryCard}>
                <View style={styles.imageListContainer}>
                  {maxiImages.map((uri, index) => (
                    <View
                      key={`${uri}-${index}`}
                      style={styles.maxiImageWrapper}
                    >
                      <Image
                        source={{
                          uri: typeof uri === "string" ? uri : uri?.uri,
                        }}
                        style={styles.maxiImages}
                      />

                      <View style={styles.imageNumberBadge}>
                        <Text style={styles.imageNumberText}>{index + 1}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ========================================================
              LOCATION
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="location-outline"
              title="Operating location"
              description="Where you primarily operate"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="location-outline"
                label="Address"
                value={address}
              />

              <ReviewField
                icon="flag-outline"
                label="Landmark"
                value={landMark}
                last
              />
            </View>
          </View>

          {/* ========================================================
              IDENTITY VERIFICATION
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="shield-checkmark-outline"
              title="Identity verification"
              description="Your government identification"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="card-outline"
                label="NIN"
                value={courierNIN}
                last={!courierNINImage}
              />
            </View>

            {/* ------------------------------------------------------
                NIN DOCUMENT
            ------------------------------------------------------ */}

            {!!courierNINImage && (
              <View style={styles.documentReviewCard}>
                <View style={styles.documentReviewHeader}>
                  <View style={styles.documentReviewIcon}>
                    <Ionicons
                      name="document-text-outline"
                      style={styles.documentReviewIconGlyph}
                    />
                  </View>

                  <View style={styles.documentReviewTitleArea}>
                    <Text style={styles.documentReviewTitle}>NIN slip</Text>

                    <Text style={styles.documentReviewSubtitle}>
                      Identification document added
                    </Text>
                  </View>

                  <View style={styles.documentVerifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      style={styles.documentVerifiedIcon}
                    />

                    <Text style={styles.documentVerifiedText}>Added</Text>
                  </View>
                </View>

                <Image
                  source={{
                    uri: courierNINImage,
                  }}
                  style={styles.reviewNinImage}
                />
              </View>
            )}
          </View>

          {/* ========================================================
              PAYMENT DETAILS
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="card-outline"
              title="Payment details"
              description="Where your courier earnings will be paid"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="business-outline"
                label="Bank"
                value={bankName}
              />

              <ReviewField
                icon="person-outline"
                label="Account name"
                value={accountName}
              />

              <ReviewField
                icon="keypad-outline"
                label="Account number"
                value={accountNumber}
                sensitive
                last
              />
            </View>

            {/* ------------------------------------------------------
                ACCOUNT VERIFICATION
            ------------------------------------------------------ */}

            {!!accountName && (
              <View style={styles.accountVerifiedCard}>
                <View style={styles.accountVerifiedIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    style={styles.accountVerifiedGlyph}
                  />
                </View>

                <View style={styles.accountVerifiedContent}>
                  <Text style={styles.accountVerifiedTitle}>
                    Account verified
                  </Text>

                  <Text style={styles.accountVerifiedDescription}>
                    Your bank account details have been successfully resolved.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ========================================================
              REVIEW COMPLETE NOTICE
          ======================================================== */}

          <View style={styles.reviewCompleteCard}>
            <View style={styles.reviewCompleteIconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                style={styles.reviewCompleteIcon}
              />
            </View>

            <View style={styles.reviewCompleteContent}>
              <Text style={styles.reviewCompleteTitle}>
                Information looks good?
              </Text>

              <Text style={styles.reviewCompleteText}>
                Continue to the next step to provide your guarantor information.
              </Text>
            </View>
          </View>

          {/* --------------------------------------------------------
              Bottom breathing room.
              This prevents the final content from being hidden
              behind the fixed Continue button.
          -------------------------------------------------------- */}

          <View style={styles.reviewBottomSpacer} />
        </ScrollView>

        {/* ==========================================================
            FIXED BOTTOM ACTION
        ========================================================== */}

        <View style={styles.reviewBottomAction}>
          <TouchableOpacity
            onPress={handleNextPage}
            style={styles.nxtBtn}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="Continue to guarantor information"
          >
            <View style={styles.nextButtonContent}>
              {/* ----------------------------------------------------
                  BUTTON COPY
              ---------------------------------------------------- */}

              <View style={styles.nextButtonCopy}>
                <Text style={styles.nextButtonTitle}>Continue</Text>

                <Text style={styles.nextButtonSubtitle}>
                  Add guarantor information
                </Text>
              </View>

              {/* ----------------------------------------------------
                  BUTTON ARROW
              ---------------------------------------------------- */}

              <View style={styles.nextButtonIconContainer}>
                <MaterialIcons name="arrow-forward" style={styles.nxtBtnIcon} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReviewCourierCom;
