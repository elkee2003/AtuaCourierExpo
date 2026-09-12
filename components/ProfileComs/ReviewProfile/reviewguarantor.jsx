import Ionicons from "@expo/vector-icons/Ionicons";
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
 * REVIEW GUARANTOR
 * ================================================================
 *
 * This is the second and final review screen.
 *
 * It follows the same visual language as ReviewCourierCom:
 *
 * - SafeAreaView
 * - Theme-aware styling
 * - Section cards
 * - Clean information rows
 * - Document presentation
 * - Premium bottom CTA
 * ================================================================
 */

const ReviewGuarantorCom = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const {
    guarantorName,
    guarantorLastName,
    guarantorProfession,
    guarantorNumber,
    guarantorRelationship,
    guarantorAddress,
    guarantorEmail,
    guarantorNIN,
    guarantorNINImage,
  } = useProfileContext();

  const [ninImageUrl, setNinImageUrl] = useState(null);

  /**
   * ---------------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------------
   */

  const goToProfile = () => {
    router.push("/profile");
  };

  /**
   * ---------------------------------------------------------------
   * FETCH GUARANTOR NIN IMAGE
   * ---------------------------------------------------------------
   */

  useEffect(() => {
    const fetchNinImage = async () => {
      if (!guarantorNINImage) {
        setNinImageUrl(null);
        return;
      }

      /**
       * If the context already contains a usable URL, there is no
       * need to ask Amplify for another signed URL.
       */
      if (String(guarantorNINImage).startsWith("http")) {
        setNinImageUrl(guarantorNINImage);
        return;
      }

      try {
        const result = await getUrl({
          path: guarantorNINImage,
          options: {
            validateObjectExistence: true,
          },
        });

        setNinImageUrl(result.url.toString());
      } catch (error) {
        console.log("Error fetching guarantor NIN image:", error);

        setNinImageUrl(null);
      }
    };

    fetchNinImage();
  }, [guarantorNINImage]);

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
   * ---------------------------------------------------------------
   * REUSABLE REVIEW FIELD
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
              Confirm your guarantor information
            </Text>
          </View>

          <View style={styles.reviewStepBadge}>
            <Text style={styles.reviewStepNumber}>2</Text>

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
              GUARANTOR PROFILE CARD
              ====================================================== */}

          <View style={styles.guarantorProfileCard}>
            <View style={styles.guarantorAvatar}>
              <Text style={styles.guarantorAvatarText}>
                {`${guarantorName?.[0] || ""}${guarantorLastName?.[0] || ""}`.toUpperCase()}
              </Text>
            </View>

            <View style={styles.guarantorProfileInfo}>
              <Text style={styles.guarantorProfileName}>
                {displayValue(
                  `${guarantorName || ""} ${guarantorLastName || ""}`.trim(),
                )}
              </Text>

              <Text style={styles.guarantorProfileProfession}>
                {displayValue(guarantorProfession)}
              </Text>
            </View>

            <View style={styles.guarantorStatusBadge}>
              <Ionicons
                name="checkmark-circle"
                style={styles.guarantorStatusIcon}
              />

              <Text style={styles.guarantorStatusText}>Added</Text>
            </View>
          </View>

          {/* ======================================================
              PERSONAL INFORMATION
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="person-outline"
              title="Guarantor details"
              description="Basic information about your guarantor"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="person-outline"
                label="First name"
                value={guarantorName}
              />

              <ReviewField
                icon="person-outline"
                label="Last name"
                value={guarantorLastName}
              />

              <ReviewField
                icon="briefcase-outline"
                label="Profession"
                value={guarantorProfession}
              />

              <ReviewField
                icon="people-outline"
                label="Relationship"
                value={guarantorRelationship}
                last
              />
            </View>
          </View>

          {/* ======================================================
              CONTACT INFORMATION
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="call-outline"
              title="Contact information"
              description="How your guarantor can be reached"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="call-outline"
                label="Phone number"
                value={guarantorNumber}
              />

              <ReviewField
                icon="mail-outline"
                label="Email address"
                value={guarantorEmail}
              />

              <ReviewField
                icon="location-outline"
                label="Address"
                value={guarantorAddress}
                last
              />
            </View>
          </View>

          {/* ======================================================
              IDENTITY VERIFICATION
              ====================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="shield-checkmark-outline"
              title="Identity verification"
              description="Your guarantor's identification details"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="card-outline"
                label="NIN"
                value={guarantorNIN}
                last
              />
            </View>

            {/* ==================================================
                GUARANTOR NIN DOCUMENT
                ================================================== */}

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
                      Guarantor identification document
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
              FINAL CONFIRMATION
              ====================================================== */}

          <View style={styles.finalConfirmationCard}>
            <View style={styles.finalConfirmationIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                style={styles.finalConfirmationGlyph}
              />
            </View>

            <View style={styles.finalConfirmationContent}>
              <Text style={styles.finalConfirmationTitle}>
                Profile review complete
              </Text>

              <Text style={styles.finalConfirmationText}>
                Review the information above before finishing your courier
                profile setup.
              </Text>
            </View>
          </View>

          <View style={styles.reviewBottomSpacer} />
        </ScrollView>

        {/* ========================================================
            FIXED DONE BUTTON
            ======================================================== */}

        <View style={styles.reviewBottomAction}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToProfile}
            style={styles.nxtBtn}
          >
            <View style={styles.nextButtonContent}>
              <View style={styles.nextButtonCopy}>
                <Text style={styles.nextButtonTitle}>Finish</Text>

                <Text style={styles.nextButtonSubtitle}>
                  Complete your courier profile
                </Text>
              </View>

              <View style={styles.nextButtonIconContainer}>
                <Ionicons name="checkmark" style={styles.nxtBtnIcon} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReviewGuarantorCom;
