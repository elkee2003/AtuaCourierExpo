import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getUrl } from "aws-amplify/storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
 * REVIEW COURIER
 * ================================================================
 *
 * This screen is the first review step of the courier onboarding
 * process.
 *
 * It intentionally uses SafeAreaView because this is a full-screen
 * page.
 *
 * The actual scrolling is handled by ONE vertical ScrollView.
 *
 * The component is theme-aware and uses the shared createStyles()
 * function so light and dark mode remain visually consistent.
 * ================================================================
 */

const ReviewCourierCom = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const [ninImageUrl, setNinImageUrl] = useState(null);

  const {
    firstName,
    lastName,
    profilePic,
    transportationType,
    vehicleType,
    model,
    vehicleColour,
    plateNumber,
    images,
    address,
    phoneNumber,
    landMark,
    courierNIN,
    courierNINImage,
    bankName,
    accountName,
    accountNumber,
  } = useProfileContext();

  /**
   * ---------------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------------
   */

  const handleNxtPage = () => {
    router.push("/profile/reviewinfo/reviewguarantor");
  };

  /**
   * ---------------------------------------------------------------
   * FETCH NIN IMAGE
   * ---------------------------------------------------------------
   *
   * If the context already contains a signed/public URL, we use it
   * directly.
   *
   * Otherwise, AWS Amplify generates a temporary signed URL.
   */

  useEffect(() => {
    const fetchNinImage = async () => {
      if (!courierNINImage) {
        setNinImageUrl(null);
        return;
      }

      if (String(courierNINImage).startsWith("http")) {
        setNinImageUrl(courierNINImage);
        return;
      }

      try {
        const result = await getUrl({
          path: courierNINImage,
          options: {
            validateObjectExistence: true,
          },
        });

        setNinImageUrl(result.url.toString());
      } catch (error) {
        console.log("Error fetching NIN image:", error);
        setNinImageUrl(null);
      }
    };

    fetchNinImage();
  }, [courierNINImage]);

  /**
   * ---------------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------------
   */

  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "Not provided";
    }

    return String(value);
  };

  /**
   * Bank account numbers should not be displayed in full on a
   * review/summary screen.
   */
  const maskAccountNumber = (value) => {
    if (!value) return "Not provided";

    const account = String(value);

    if (account.length <= 4) {
      return account;
    }

    return `•••• •••• ${account.slice(-4)}`;
  };

  /**
   * ---------------------------------------------------------------
   * REUSABLE REVIEW ROW
   * ---------------------------------------------------------------
   */

  const ReviewField = ({ icon, label, value, last = false }) => {
    const hasValue =
      value !== null && value !== undefined && String(value).trim() !== "";

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
              !hasValue && styles.reviewFieldValueMissing,
            ]}
          >
            {displayValue(value)}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * ---------------------------------------------------------------
   * SECTION HEADER
   * ---------------------------------------------------------------
   */

  const SectionHeader = ({ icon, title, description }) => (
    <View style={styles.reviewSectionHeader}>
      <View style={styles.reviewSectionIcon}>
        <Ionicons name={icon} style={styles.reviewSectionIconGlyph} />
      </View>

      <View style={styles.reviewSectionHeading}>
        <Text style={styles.reviewSectionTitle}>{title}</Text>

        {description ? (
          <Text style={styles.reviewSectionDescription}>{description}</Text>
        ) : null}
      </View>
    </View>
  );

  /**
   * ---------------------------------------------------------------
   * TRANSPORT DISPLAY
   * ---------------------------------------------------------------
   */

  const transportLabel =
    transportationType || vehicleType || "Transportation not provided";

  /**
   * ---------------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------------
   */

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.reviewContainer}>
        {/* ========================================================
            HEADER
            ======================================================== */}

        <View style={styles.reviewHeader}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.back()}
            style={styles.bckBtnCon}
          >
            <Ionicons name="arrow-back" style={styles.bckBtnIcon} />
          </TouchableOpacity>

          <View style={styles.reviewHeaderText}>
            <Text style={styles.title}>Review Profile</Text>

            <Text style={styles.reviewHeaderSubtitle}>
              Make sure your information is correct
            </Text>
          </View>

          <View style={styles.reviewStepBadge}>
            <Text style={styles.reviewStepNumber}>1</Text>

            <Text style={styles.reviewStepText}>OF 2</Text>
          </View>
        </View>

        {/* ========================================================
            SCROLLABLE CONTENT
            ======================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reviewScrollContent}
        >
          {/* ======================================================
              PROFILE CARD
              ====================================================== */}

          <View style={styles.profileReviewCard}>
            <View style={styles.reviewProfileImageWrapper}>
              {profilePic ? (
                <Image
                  source={{ uri: profilePic }}
                  style={styles.reviewProfileImage}
                />
              ) : (
                <View style={styles.reviewProfilePlaceholder}>
                  <Text style={styles.reviewProfileInitials}>
                    {`${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.profileReviewInfo}>
              <Text style={styles.profileReviewName}>
                {displayValue(`${firstName || ""} ${lastName || ""}`.trim())}
              </Text>

              <View style={styles.profileReviewRole}>
                <View style={styles.profileReviewStatusDot} />

                <Text style={styles.profileReviewRoleText}>
                  Courier profile
                </Text>
              </View>

              <View style={styles.transportBadge}>
                <Ionicons
                  name="car-outline"
                  style={styles.transportBadgeIcon}
                />

                <Text style={styles.transportBadgeText}>{transportLabel}</Text>
              </View>
            </View>
          </View>

          {/* ======================================================
              PERSONAL INFORMATION
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="person-outline"
              title="Personal information"
              description="Your basic courier profile details"
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

          {/* ======================================================
              TRANSPORTATION
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="car-outline"
              title="Transportation"
              description="The vehicle you use for deliveries"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="navigate-outline"
                label="Transportation type"
                value={transportationType || vehicleType}
              />

              {vehicleType ? (
                <ReviewField
                  icon="car-outline"
                  label="Vehicle type"
                  value={vehicleType}
                />
              ) : null}

              {model ? (
                <ReviewField
                  icon="construct-outline"
                  label="Model"
                  value={model}
                />
              ) : null}

              {vehicleColour ? (
                <ReviewField
                  icon="color-palette-outline"
                  label="Vehicle colour"
                  value={vehicleColour}
                />
              ) : null}

              {plateNumber ? (
                <ReviewField
                  icon="card-outline"
                  label="Plate number"
                  value={plateNumber}
                  last
                />
              ) : null}
            </View>
          </View>

          {/* ======================================================
              VEHICLE PHOTOS
              ====================================================== */}

          {images?.length > 0 ? (
            <View style={styles.reviewSection}>
              <SectionHeader
                icon="images-outline"
                title="Vehicle photos"
                description={`${images.length} photo${
                  images.length === 1 ? "" : "s"
                } uploaded`}
              />

              <View style={styles.vehicleGalleryCard}>
                <View style={styles.imageListContainer}>
                  {images.map((item, index) => (
                    <View
                      key={`${item}-${index}`}
                      style={styles.maxiImageWrapper}
                    >
                      <Image source={{ uri: item }} style={styles.maxiImages} />

                      <View style={styles.imageNumberBadge}>
                        <Text style={styles.imageNumberText}>{index + 1}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          {/* ======================================================
              ADDRESS
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="location-outline"
              title="Location"
              description="Your primary courier location"
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

          {/* ======================================================
              IDENTITY
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="shield-checkmark-outline"
              title="Identity verification"
              description="Your identification information"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="card-outline"
                label="NIN"
                value={courierNIN}
                last
              />
            </View>

            {ninImageUrl ? (
              <View style={styles.documentReviewCard}>
                <View style={styles.documentReviewHeader}>
                  <View style={styles.documentReviewIcon}>
                    <Ionicons
                      name="document-text-outline"
                      style={styles.documentReviewIconGlyph}
                    />
                  </View>

                  <View style={styles.documentReviewTitleArea}>
                    <Text style={styles.documentReviewTitle}>NIN Slip</Text>

                    <Text style={styles.documentReviewSubtitle}>
                      Identification document uploaded
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
                  source={{ uri: ninImageUrl }}
                  style={styles.reviewNinImage}
                />
              </View>
            ) : null}
          </View>

          {/* ======================================================
              PAYMENT DETAILS
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="card-outline"
              title="Payment details"
              description="Where your courier earnings will be paid"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="business-outline"
                label="Bank name"
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
                value={maskAccountNumber(accountNumber)}
                last
              />
            </View>

            {accountName ? (
              <View style={styles.accountVerifiedCard}>
                <View style={styles.accountVerifiedIcon}>
                  <Ionicons
                    name="checkmark"
                    style={styles.accountVerifiedGlyph}
                  />
                </View>

                <View style={styles.accountVerifiedContent}>
                  <Text style={styles.accountVerifiedTitle}>
                    Account details added
                  </Text>

                  <Text style={styles.accountVerifiedDescription}>
                    Your payout account has been included in your courier
                    profile.
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* ======================================================
              COMPLETION MESSAGE
              ====================================================== */}

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

          <View style={styles.reviewBottomSpacer} />
        </ScrollView>

        {/* ========================================================
            FIXED BOTTOM CTA
            ======================================================== */}

        <View style={styles.reviewBottomAction}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNxtPage}
            style={styles.nxtBtn}
          >
            <View style={styles.nextButtonContent}>
              <View style={styles.nextButtonCopy}>
                <Text style={styles.nextButtonTitle}>Continue</Text>

                <Text style={styles.nextButtonSubtitle}>
                  Review guarantor information next
                </Text>
              </View>

              <View style={styles.nextButtonIconContainer}>
                <MaterialIcons name="navigate-next" style={styles.nxtBtnIcon} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReviewCourierCom;
