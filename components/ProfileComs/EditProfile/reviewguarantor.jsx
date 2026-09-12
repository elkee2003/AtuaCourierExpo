import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { DataStore } from "aws-amplify/datastore";
import { remove, uploadData } from "aws-amplify/storage";

import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";

import { router } from "expo-router";
import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthContext } from "../../../providers/AuthProvider";
import { useProfileContext } from "../../../providers/ProfileProvider";

import { Courier } from "@/src/models";
import { createStyles } from "./styles";

/* =================================================================
   HELPERS
   ================================================================= */

/**
 * Converts an image value into a usable URI.
 *
 * The value may be:
 *
 * - A local URI string.
 * - A storage path string.
 * - An object containing uri.
 * - An object containing path.
 * - An object containing key.
 */
const getImageUri = (image) => {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    return image.uri || image.path || image.key || "";
  }

  return "";
};

/**
 * Checks whether a value has been provided.
 */
const isProvided = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== "";
};

/**
 * Friendly display fallback.
 */
const displayValue = (value) => {
  if (!isProvided(value)) {
    return "Not provided";
  }

  return String(value);
};

/**
 * Masks sensitive values.
 */
const maskNIN = (value) => {
  if (!isProvided(value)) {
    return "Not provided";
  }

  const nin = String(value);

  if (nin.length <= 4) {
    return nin;
  }

  return `••••••${nin.slice(-4)}`;
};

/**
 * Creates a unique image name.
 */
const createImageName = () => {
  return `${Crypto.randomUUID()}.jpg`;
};

/**
 * Checks whether a value is already a storage path.
 */
const isStoragePath = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  return (
    value.startsWith("public/") ||
    value.startsWith("protected/") ||
    value.startsWith("private/") ||
    value.startsWith("guarantorNIN/") ||
    value.startsWith("courierNIN/") ||
    value.startsWith("profile/") ||
    value.startsWith("maxi/")
  );
};

/**
 * Uploads an image if it is a local image.
 *
 * Existing storage paths are returned unchanged.
 */
const uploadSingleImage = async ({
  image,
  folder,
  sub,
  resizeWidth = 800,
  compress = 0.7,
}) => {
  const imageUri = getImageUri(image);

  if (!imageUri) {
    return null;
  }

  /**
   * Do not upload an image that is already in Storage.
   */
  if (isStoragePath(imageUri)) {
    return imageUri;
  }

  /**
   * Resize and compress the image before uploading.
   */
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    imageUri,
    [
      {
        resize: {
          width: resizeWidth,
        },
      },
    ],
    {
      compress,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  const response = await fetch(manipulatedImage.uri);
  const blob = await response.blob();

  const imagePath = `public/${folder}/${sub}/${createImageName()}`;

  await uploadData({
    path: imagePath,
    data: blob,
    options: {
      contentType: "image/jpeg",
    },
  }).result;

  return imagePath;
};

/**
 * Deletes one Storage file safely.
 *
 * This function intentionally does not throw because the database
 * save has already succeeded by the time old files are deleted.
 */
const deleteStorageFileSafely = async (path) => {
  if (!isStoragePath(path)) {
    return;
  }

  try {
    await remove({
      path,
    });
  } catch (error) {
    console.log("Unable to delete old storage file:", path, error);
  }
};

/* =================================================================
   COMPONENT
   ================================================================= */

const ReviewGuarantorCom = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const {
    /* --------------------------------------------------------------
       Personal information
       -------------------------------------------------------------- */

    firstName,
    lastName,
    profilePic,
    phoneNumber,

    /* --------------------------------------------------------------
       Transportation
       -------------------------------------------------------------- */

    transportationType,
    vehicleClass,
    model,
    vehicleColour,
    plateNumber,

    /* --------------------------------------------------------------
       MAXI information
       -------------------------------------------------------------- */

    maxiDescription,
    maxiImages,

    /* --------------------------------------------------------------
       Location
       -------------------------------------------------------------- */

    address,
    landMark,

    /* --------------------------------------------------------------
       Courier identity
       -------------------------------------------------------------- */

    courierNIN,
    courierNINImage,

    /* --------------------------------------------------------------
       Bank information
       -------------------------------------------------------------- */

    bankName,
    accountName,
    accountNumber,

    /* --------------------------------------------------------------
       Guarantor information
       -------------------------------------------------------------- */

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

  const { sub, userMail, dbCourier, setDbCourier } = useAuthContext();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  /* =================================================================
     VALIDATION
     ================================================================= */

  const validateGuarantorInformation = () => {
    const missingFields = [];

    if (!isProvided(guarantorName)) {
      missingFields.push("Guarantor first name");
    }

    if (!isProvided(guarantorLastName)) {
      missingFields.push("Guarantor last name");
    }

    if (!isProvided(guarantorProfession)) {
      missingFields.push("Guarantor profession");
    }

    if (!isProvided(guarantorNumber)) {
      missingFields.push("Guarantor phone number");
    }

    if (!isProvided(guarantorRelationship)) {
      missingFields.push("Relationship with guarantor");
    }

    if (!isProvided(guarantorAddress)) {
      missingFields.push("Guarantor address");
    }

    if (!isProvided(guarantorNIN)) {
      missingFields.push("Guarantor NIN");
    }

    if (!getImageUri(guarantorNINImage)) {
      missingFields.push("Guarantor NIN image");
    }

    if (missingFields.length > 0) {
      const message = `Please provide:\n\n${missingFields
        .map((field) => `• ${field}`)
        .join("\n")}`;

      setSaveError(message);

      Alert.alert("Incomplete guarantor information", message);

      return false;
    }

    return true;
  };

  /* =================================================================
     UPDATE COURIER WITH GUARANTOR INFORMATION
     ================================================================= */

  /**
   * This screen must update an existing Courier record.
   *
   * The personal review screen should already have created the
   * Courier record with isOnboardingComplete: false.
   *
   * This screen adds guarantor information and changes:
   *
   * isOnboardingComplete: true
   */
  const updateCourierWithGuarantor = async (courierToUpdate) => {
    if (!courierToUpdate) {
      throw new Error(
        "Your courier profile could not be found. Please go back and save your personal information first.",
      );
    }

    if (!sub) {
      throw new Error(
        "Your account session could not be found. Please sign in again.",
      );
    }

    setSaving(true);

    let uploadedGuarantorNINImage = null;

    try {
      const previousGuarantorNINImage =
        courierToUpdate.guarantorNINImage || null;

      /**
       * Upload the new guarantor NIN image.
       *
       * If it is already a Storage path, the existing path is
       * preserved and no duplicate upload occurs.
       */
      uploadedGuarantorNINImage = await uploadSingleImage({
        image: guarantorNINImage,
        folder: "guarantorNIN",
        sub,
        resizeWidth: 1000,
        compress: 0.8,
      });

      /**
       * Save the guarantor information and complete onboarding.
       */
      const updatedCourier = await DataStore.save(
        Courier.copyOf(courierToUpdate, (updated) => {
          // Keep the authenticated account identity synchronized.
          updated.sub = sub;
          updated.email = userMail || courierToUpdate.email || null;

          // Save guarantor information.
          updated.guarantorName = guarantorName;
          updated.guarantorLastName = guarantorLastName;
          updated.guarantorProfession = guarantorProfession;
          updated.guarantorNumber = guarantorNumber;
          updated.guarantorRelationship = guarantorRelationship;
          updated.guarantorAddress = guarantorAddress;
          updated.guarantorEmail = guarantorEmail || null;
          updated.guarantorNIN = guarantorNIN;

          // Preserve the uploaded guarantor image.
          updated.guarantorNINImage =
            uploadedGuarantorNINImage ||
            courierToUpdate.guarantorNINImage ||
            null;

          // Complete onboarding only after all guarantor data is saved.
          updated.isOnboardingComplete = true;
        }),
      );

      setDbCourier(updatedCourier);

      /**
       * Delete the previous guarantor NIN image only after the
       * database save has succeeded.
       */
      if (
        previousGuarantorNINImage &&
        uploadedGuarantorNINImage &&
        previousGuarantorNINImage !== uploadedGuarantorNINImage
      ) {
        await deleteStorageFileSafely(previousGuarantorNINImage);
      }

      return updatedCourier;
    } catch (error) {
      console.log("Error updating courier with guarantor information:", error);

      /**
       * If a new image was uploaded but the database update failed,
       * remove only the newly uploaded image.
       *
       * Existing Storage paths are not deleted.
       */
      if (
        uploadedGuarantorNINImage &&
        uploadedGuarantorNINImage !== courierToUpdate.guarantorNINImage
      ) {
        await deleteStorageFileSafely(uploadedGuarantorNINImage);
      }

      throw error;
    } finally {
      setSaving(false);
    }
  };

  /* =================================================================
     SAVE HANDLER
     ================================================================= */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaveError("");

    if (!validateGuarantorInformation()) {
      return;
    }

    try {
      /**
       * Use the hydrated courier when available.
       */
      let courierRecord = dbCourier;

      /**
       * If the provider has not hydrated yet, look up the courier
       * directly from DataStore using the authenticated user's sub.
       */
      if (!courierRecord && sub) {
        const existingCouriers = await DataStore.query(Courier, (courier) =>
          courier.sub.eq(sub),
        );

        courierRecord = existingCouriers?.[0] || null;
      }

      /**
       * Guarantor review must not create a new Courier record.
       *
       * The personal review must have created it first.
       */
      if (!courierRecord) {
        throw new Error(
          "Your personal courier information has not been saved yet. Please go back and complete the personal review first.",
        );
      }

      await updateCourierWithGuarantor(courierRecord);

      /**
       * Keep this navigation exactly as requested.
       */
      router.push("/profile");

      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (error) {
      console.log("Guarantor save operation failed:", error);

      const message =
        error?.message ||
        "Something went wrong while saving guarantor information.";

      setSaveError(message);

      Alert.alert("Unable to complete registration", message);
    }
  };

  /* =================================================================
     DISPLAY HELPERS
     ================================================================= */

  const getInitials = (first, last) => {
    const firstInitial = first?.trim()?.charAt(0) || "";

    const lastInitial = last?.trim()?.charAt(0) || "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const courierInitials = getInitials(firstName, lastName);

  const guarantorInitials = getInitials(guarantorName, guarantorLastName);

  const profileImageUri = getImageUri(profilePic);
  const courierNINImageUri = getImageUri(courierNINImage);
  const guarantorNINImageUri = getImageUri(guarantorNINImage);

  const transportationLabel = transportationType
    ? String(transportationType)
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : "Not provided";

  /* =================================================================
     SMALL UI COMPONENTS
     ================================================================= */

  const SectionHeader = ({ icon, title, description }) => {
    return (
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
  };

  const ReviewField = ({
    icon,
    label,
    value,
    sensitive = false,
    last = false,
  }) => {
    const finalValue = sensitive ? maskNIN(value) : displayValue(value);

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

  const DocumentCard = ({ title, subtitle, imageUri }) => {
    if (!imageUri) {
      return null;
    }

    return (
      <View style={styles.documentReviewCard}>
        <View style={styles.documentReviewHeader}>
          <View style={styles.documentReviewIcon}>
            <Ionicons
              name="document-text-outline"
              style={styles.documentReviewIconGlyph}
            />
          </View>

          <View style={styles.documentReviewTitleArea}>
            <Text style={styles.documentReviewTitle}>{title}</Text>

            <Text style={styles.documentReviewSubtitle}>{subtitle}</Text>
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
            uri: imageUri,
          }}
          style={styles.reviewNinImage}
        />
      </View>
    );
  };

  /* =================================================================
     RENDER
     ================================================================= */

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.bckBtnCon}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" style={styles.bckBtnIcon} />
          </TouchableOpacity>

          <View style={styles.reviewHeaderText}>
            <Text style={styles.title}>Final Review</Text>

            <Text style={styles.reviewHeaderSubtitle}>
              Confirm your guarantor information
            </Text>
          </View>

          <View style={styles.finalStepBadge}>
            <Ionicons name="checkmark" style={styles.finalStepIcon} />

            <Text style={styles.finalStepText}>Final step</Text>
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
              COMPLETION CARD
          ======================================================== */}

          <View style={styles.completionCard}>
            <View style={styles.completionIconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                style={styles.completionIcon}
              />
            </View>

            <View style={styles.completionContent}>
              <Text style={styles.completionTitle}>
                Your registration is almost complete
              </Text>

              <Text style={styles.completionText}>
                Review your courier and guarantor information carefully. Saving
                this page will complete your onboarding registration.
              </Text>
            </View>
          </View>

          {/* ========================================================
              COURIER SUMMARY
          ======================================================== */}

          <View style={styles.profileReviewCard}>
            <View style={styles.reviewProfileImageWrapper}>
              {profileImageUri ? (
                <Image
                  source={{
                    uri: profileImageUri,
                  }}
                  style={styles.reviewProfileImage}
                />
              ) : (
                <View style={styles.reviewProfilePlaceholder}>
                  <Text style={styles.reviewProfileInitials}>
                    {courierInitials || "?"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.profileReviewInfo}>
              <Text style={styles.profileReviewName} numberOfLines={1}>
                {displayValue(firstName)} {lastName || ""}
              </Text>

              <View style={styles.profileReviewRole}>
                <View style={styles.profileReviewStatusDot} />

                <Text style={styles.profileReviewRoleText}>
                  Courier account
                </Text>
              </View>

              <View style={styles.transportBadge}>
                <Ionicons
                  name="car-outline"
                  style={styles.transportBadgeIcon}
                />

                <Text style={styles.transportBadgeText}>
                  {transportationLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* ========================================================
              PERSONAL INFORMATION
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="person-outline"
              title="Personal information"
              description="Your courier account details"
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
              description="Your delivery vehicle"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="navigate-outline"
                label="Transportation type"
                value={transportationType}
              />

              {!!vehicleClass && (
                <ReviewField
                  icon="layers-outline"
                  label="Vehicle class"
                  value={vehicleClass}
                />
              )}

              {!!model && (
                <ReviewField
                  icon="car-sport-outline"
                  label="Model"
                  value={model}
                />
              )}

              {!!vehicleColour && (
                <ReviewField
                  icon="color-palette-outline"
                  label="Vehicle colour"
                  value={vehicleColour}
                />
              )}

              {!!plateNumber && (
                <ReviewField
                  icon="pricetag-outline"
                  label="Plate number"
                  value={plateNumber}
                />
              )}

              {!!maxiDescription && (
                <ReviewField
                  icon="document-text-outline"
                  label="Vehicle description"
                  value={maxiDescription}
                  last
                />
              )}
            </View>
          </View>

          {/* ========================================================
              MAXI PHOTOS
          ======================================================== */}

          {transportationType === "MAXI" &&
            Array.isArray(maxiImages) &&
            maxiImages.length > 0 && (
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
                    {maxiImages.map((image, index) => {
                      const imageUri = getImageUri(image);

                      if (!imageUri) {
                        return null;
                      }

                      return (
                        <View
                          key={`${imageUri}-${index}`}
                          style={styles.maxiImageWrapper}
                        >
                          <Image
                            source={{
                              uri: imageUri,
                            }}
                            style={styles.maxiImages}
                          />

                          <View style={styles.imageNumberBadge}>
                            <Text style={styles.imageNumberText}>
                              {index + 1}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
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
              title="Location"
              description="Your operating location"
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
              COURIER IDENTITY
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="shield-checkmark-outline"
              title="Courier identity"
              description="Your government identification"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="card-outline"
                label="Courier NIN"
                value={courierNIN}
                sensitive
                last={!courierNINImageUri}
              />
            </View>

            <DocumentCard
              title="Courier NIN slip"
              subtitle="Courier identification document"
              imageUri={courierNINImageUri}
            />
          </View>

          {/* ========================================================
              BANK INFORMATION
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
          </View>

          {/* ========================================================
              GUARANTOR SUMMARY
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="people-outline"
              title="Guarantor information"
              description="The person standing as your guarantor"
            />

            <View style={styles.profileReviewCard}>
              <View style={styles.reviewProfileImageWrapper}>
                <View style={styles.reviewProfilePlaceholder}>
                  <Text style={styles.reviewProfileInitials}>
                    {guarantorInitials || "?"}
                  </Text>
                </View>
              </View>

              <View style={styles.profileReviewInfo}>
                <Text style={styles.profileReviewName} numberOfLines={1}>
                  {displayValue(guarantorName)} {guarantorLastName || ""}
                </Text>

                <View style={styles.profileReviewRole}>
                  <View style={styles.profileReviewStatusDot} />

                  <Text style={styles.profileReviewRoleText}>Guarantor</Text>
                </View>
              </View>
            </View>

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
                icon="call-outline"
                label="Phone number"
                value={guarantorNumber}
              />

              <ReviewField
                icon="people-outline"
                label="Relationship"
                value={guarantorRelationship}
              />

              <ReviewField
                icon="location-outline"
                label="Address"
                value={guarantorAddress}
              />

              {!!guarantorEmail && (
                <ReviewField
                  icon="mail-outline"
                  label="Email"
                  value={guarantorEmail}
                />
              )}

              <ReviewField
                icon="card-outline"
                label="Guarantor NIN"
                value={guarantorNIN}
                sensitive
                last={!guarantorNINImageUri}
              />
            </View>

            <DocumentCard
              title="Guarantor NIN slip"
              subtitle="Guarantor identification document"
              imageUri={guarantorNINImageUri}
            />
          </View>

          {/* ========================================================
              ERROR
          ======================================================== */}

          {!!saveError && (
            <View style={styles.reviewErrorCard}>
              <Ionicons
                name="alert-circle-outline"
                style={styles.reviewErrorIcon}
              />

              <Text style={styles.reviewErrorText}>{saveError}</Text>
            </View>
          )}

          {/* ========================================================
              FINAL NOTICE
          ======================================================== */}

          <View style={styles.reviewCompleteCard}>
            <View style={styles.reviewCompleteIconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                style={styles.reviewCompleteIcon}
              />
            </View>

            <View style={styles.reviewCompleteContent}>
              <Text style={styles.reviewCompleteTitle}>
                Ready to complete onboarding?
              </Text>

              <Text style={styles.reviewCompleteText}>
                When you save, your guarantor information will be added and your
                courier onboarding status will be marked as complete.
              </Text>
            </View>
          </View>

          <View style={styles.reviewBottomSpacer} />
        </ScrollView>

        {/* ==========================================================
            BOTTOM ACTION
        ========================================================== */}

        <View style={styles.reviewBottomAction}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.nxtBtn, saving && styles.nxtBtnDisabled]}
            activeOpacity={0.84}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Complete courier registration"
          >
            <View style={styles.nextButtonContent}>
              <View style={styles.nextButtonCopy}>
                <Text style={styles.nextButtonTitle}>
                  {saving ? "Completing..." : "Complete registration"}
                </Text>

                <Text style={styles.nextButtonSubtitle}>
                  {saving ? "Please wait" : "Finish courier onboarding"}
                </Text>
              </View>

              <View style={styles.nextButtonIconContainer}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <MaterialIcons name="check" style={styles.nxtBtnIcon} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReviewGuarantorCom;
