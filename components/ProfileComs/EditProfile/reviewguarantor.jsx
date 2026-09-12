import { DataStore } from "@aws-amplify/datastore";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { Courier } from "../../../src/models";
import { createStyles } from "./styles";

/**
 * ================================================================
 * REVIEW GUARANTOR / FINAL PROFILE REVIEW
 * ================================================================
 *
 * This is the final screen of the courier onboarding flow.
 *
 * Responsibilities:
 *
 * 1. Display a complete summary of courier information.
 * 2. Display guarantor information.
 * 3. Display uploaded identity documents.
 * 4. Display Maxi vehicle information where applicable.
 * 5. Upload new local images to S3.
 * 6. Remove replaced/deleted images from S3.
 * 7. Create a new Courier record.
 * 8. Update an existing Courier record.
 * 9. Prevent duplicate Courier records.
 * 10. Navigate to the profile after successful saving.
 *
 * The screen uses the shared createStyles(isDark) design system.
 */

/* =================================================================
   COMPONENT
   ================================================================= */

const ReviewGuarantorCom = () => {
  // ================================================================
  // THEME
  // ================================================================
  //
  // The stylesheet is generated from the current device appearance.
  // This is important because styles.js now supports both light and
  // dark themes.
  //
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = useMemo(() => createStyles(isDark), [isDark]);

  // ================================================================
  // PROFILE DATA
  // ================================================================

  const {
    /* -----------------------------
       Courier identity
       ----------------------------- */
    firstName,
    lastName,
    profilePic,

    /* -----------------------------
       Transportation
       ----------------------------- */
    transportationType,
    vehicleClass,
    model,
    vehicleColour,
    plateNumber,

    /* -----------------------------
       Maxi
       ----------------------------- */
    maxiImages,
    maxiDescription,

    /* -----------------------------
       Location/contact
       ----------------------------- */
    address,
    phoneNumber,
    landMark,

    /* -----------------------------
       Courier identity verification
       ----------------------------- */
    courierNIN,
    courierNINImage,

    /* -----------------------------
       Bank information
       ----------------------------- */
    bankCode,
    bankName,
    accountName,
    accountNumber,

    /* -----------------------------
       Guarantor information
       ----------------------------- */
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

  // ================================================================
  // AUTH / DATABASE CONTEXT
  // ================================================================

  const { dbCourier, setDbCourier, sub, userMail } = useAuthContext();

  // ================================================================
  // SAVE / UPLOAD STATE
  // ================================================================

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /*
   * Local error state for this final screen.
   *
   * createCourier/updateCourier perform operations that can fail
   * independently of the earlier form validation.
   */
  const [saveError, setSaveError] = useState("");

  // ================================================================
  // HELPERS
  // ================================================================

  /**
   * Safely display a value.
   *
   * Empty values are displayed consistently instead of leaving
   * unexplained blank spaces.
   */
  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "Not provided";
    }

    return String(value);
  };

  /**
   * Mask the bank account number.
   *
   * Only the final four digits are shown on the review screen.
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
   * Generate initials for avatars.
   */
  const getInitials = (first, last) => {
    const firstInitial = first?.trim()?.charAt(0) || "";

    const lastInitial = last?.trim()?.charAt(0) || "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  /**
   * Convert an image value into a usable URI.
   *
   * The profile context can contain:
   *
   * - file:// local images
   * - public/... S3 paths
   * - objects containing { uri }
   */
  const getImageUri = (image) => {
    if (!image) {
      return null;
    }

    if (typeof image === "string") {
      return image;
    }

    return image?.uri || null;
  };

  // ================================================================
  // SECTION HEADER
  // ================================================================

  /**
   * Reusable review section heading.
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

  // ================================================================
  // REVIEW FIELD
  // ================================================================

  /**
   * Reusable field used throughout the review page.
   *
   * `sensitive` masks financial information.
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

    const isMissing = finalValue === "Not provided";

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
              isMissing && styles.reviewFieldValueMissing,
            ]}
          >
            {finalValue}
          </Text>
        </View>
      </View>
    );
  };

  // ================================================================
  // SINGLE IMAGE UPLOAD
  // ================================================================

  /**
   * Upload one image to S3.
   *
   * Images are resized and compressed before upload.
   */
  const uploadSingleImage = async (localUri, folder) => {
    if (!localUri) {
      return null;
    }

    /*
     * Already uploaded images should not be uploaded again.
     */
    if (typeof localUri === "string" && localUri.startsWith("public/")) {
      return localUri;
    }

    const imageUri = getImageUri(localUri);

    if (!imageUri) {
      return null;
    }

    // --------------------------------------------------------------
    // Resize and compress image
    // --------------------------------------------------------------

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: 800,
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    // --------------------------------------------------------------
    // Convert to Blob
    // --------------------------------------------------------------

    const response = await fetch(manipulatedImage.uri);

    const blob = await response.blob();

    // --------------------------------------------------------------
    // Generate unique S3 path
    // --------------------------------------------------------------

    const fileKey = `public/${folder}/${sub}/${Crypto.randomUUID()}.jpg`;

    // --------------------------------------------------------------
    // Upload
    // --------------------------------------------------------------

    const result = await uploadData({
      path: fileKey,
      data: blob,
      options: {
        contentType: "image/jpeg",
      },
    }).result;

    return result.path;
  };

  // ================================================================
  // MAXI IMAGE UPLOAD
  // ================================================================

  /**
   * Upload all Maxi vehicle images.
   *
   * Existing S3 paths are preserved.
   * Local images are uploaded.
   * Removed S3 images are deleted.
   */
  const uploadMaxiImages = async () => {
    try {
      // ------------------------------------------------------------
      // No Maxi images
      // ------------------------------------------------------------

      if (!maxiImages || maxiImages.length === 0) {
        return dbCourier?.maxiImages || [];
      }

      const uploadedPaths = [];

      // ------------------------------------------------------------
      // Process every Maxi image
      // ------------------------------------------------------------

      for (const item of maxiImages) {
        const localUri = typeof item === "string" ? item : item?.uri;

        if (!localUri) {
          continue;
        }

        // ----------------------------------------------------------
        // Already uploaded
        // ----------------------------------------------------------

        if (localUri.startsWith("public/")) {
          uploadedPaths.push(localUri);
          continue;
        }

        // ----------------------------------------------------------
        // Upload local image
        // ----------------------------------------------------------

        if (localUri.startsWith("file://")) {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            localUri,
            [
              {
                resize: {
                  width: 600,
                },
              },
            ],
            {
              compress: 0.6,
              format: ImageManipulator.SaveFormat.JPEG,
            },
          );

          const response = await fetch(manipulatedImage.uri);

          const blob = await response.blob();

          const fileKey = `public/maxiImages/${sub}/${Crypto.randomUUID()}.jpg`;

          const result = await uploadData({
            path: fileKey,
            data: blob,
            options: {
              contentType: "image/jpeg",

              onProgress: ({ transferredBytes, totalBytes }) => {
                if (totalBytes) {
                  setUploadProgress(
                    Math.round((transferredBytes / totalBytes) * 100),
                  );
                }
              },
            },
          }).result;

          uploadedPaths.push(result.path);
        }
      }

      // ------------------------------------------------------------
      // Delete Maxi images that no longer exist
      // ------------------------------------------------------------

      if (dbCourier?.maxiImages?.length) {
        const removedImages = dbCourier.maxiImages.filter(
          (oldPath) => !uploadedPaths.includes(oldPath),
        );

        await Promise.all(
          removedImages.map((path) =>
            remove({
              path,
            }).catch(() => {}),
          ),
        );
      }

      return uploadedPaths;
    } catch (err) {
      console.log("Error uploading maxi images:", err);

      throw new Error(
        "Failed to upload the Maxi vehicle images. Please try again.",
      );
    }
  };

  // ================================================================
  // MAXI VALIDATION
  // ================================================================

  /**
   * Maxi couriers require:
   *
   * - At least 3 vehicle images
   * - A vehicle description
   */
  const validateMaxiRequirements = () => {
    if (transportationType === "MAXI") {
      if (!maxiImages || maxiImages.length < 3) {
        const message = "Please upload at least 3 vehicle images for Maxi.";

        setSaveError(message);

        Alert.alert("Vehicle Images Required", message);

        return false;
      }

      if (!maxiDescription || maxiDescription.trim() === "") {
        const message = "Please enter a description for your Maxi vehicle.";

        setSaveError(message);

        Alert.alert("Vehicle Description Required", message);

        return false;
      }
    }

    return true;
  };

  // ================================================================
  // CREATE COURIER
  // ================================================================

  /**
   * Create a new Courier record.
   */
  const createCourier = async () => {
    // --------------------------------------------------------------
    // Prevent duplicate save presses
    // --------------------------------------------------------------

    if (uploading) {
      return;
    }

    setSaveError("");
    setUploading(true);
    setUploadProgress(0);

    // --------------------------------------------------------------
    // Profile photo is mandatory
    // --------------------------------------------------------------

    if (!profilePic) {
      const message = "Please upload a profile picture before continuing.";

      setSaveError(message);

      Alert.alert("Profile Photo Required", message);

      setUploading(false);
      return;
    }

    try {
      // ------------------------------------------------------------
      // 1. Check for an existing courier
      // ------------------------------------------------------------

      let existingCouriers = await DataStore.query(Courier, (c) =>
        c.sub.eq(sub),
      );

      // ------------------------------------------------------------
      // 2. Retry after clearing local DataStore
      // ------------------------------------------------------------

      if (existingCouriers.length === 0) {
        console.log("No local courier — retrying sync...");

        await DataStore.clear();
        await DataStore.start();

        existingCouriers = await DataStore.query(Courier, (c) => c.sub.eq(sub));
      }

      // ------------------------------------------------------------
      // 3. Never create duplicate courier
      // ------------------------------------------------------------

      if (existingCouriers.length > 0) {
        console.log("Courier already exists, skipping creation");

        setDbCourier(existingCouriers[0]);

        return;
      }

      // ------------------------------------------------------------
      // 4. Upload required images
      // ------------------------------------------------------------

      const uploadedProfilePic = await uploadSingleImage(
        profilePic,
        "profilePhoto",
      );

      const uploadedMaxiImages = await uploadMaxiImages();

      const uploadedCourierNINImage = await uploadSingleImage(
        courierNINImage,
        "courierNIN",
      );

      const uploadedGuarantorNINImage = await uploadSingleImage(
        guarantorNINImage,
        "guarantorNIN",
      );

      // ------------------------------------------------------------
      // 5. Create Courier record
      // ------------------------------------------------------------

      const courier = await DataStore.save(
        new Courier({
          // ------------------------------------------------------
          // Basic information
          // ------------------------------------------------------

          firstName,
          lastName,

          // ------------------------------------------------------
          // Transportation
          // ------------------------------------------------------

          transportationType,
          vehicleClass,
          model,
          vehicleColour,
          plateNumber,

          // ------------------------------------------------------
          // Account
          // ------------------------------------------------------

          email: userMail,
          profilePic: uploadedProfilePic,

          // ------------------------------------------------------
          // Maxi
          // ------------------------------------------------------

          maxiImages: transportationType === "MAXI" ? uploadedMaxiImages : [],

          maxiDescription: transportationType === "MAXI" ? maxiDescription : "",

          // ------------------------------------------------------
          // Identity
          // ------------------------------------------------------

          courierNINImage: uploadedCourierNINImage,

          guarantorNINImage: uploadedGuarantorNINImage,

          address,
          landMark,
          phoneNumber,
          courierNIN,

          // ------------------------------------------------------
          // Bank
          // ------------------------------------------------------

          bankCode,
          bankName,
          accountName,
          accountNumber,

          // ------------------------------------------------------
          // Guarantor
          // ------------------------------------------------------

          guarantorName,
          guarantorLastName,
          guarantorProfession,
          guarantorNumber,
          guarantorRelationship,
          guarantorAddress,
          guarantorEmail,
          guarantorNIN,

          // ------------------------------------------------------
          // Auth identity
          // ------------------------------------------------------

          sub,

          // ------------------------------------------------------
          // Initial account state
          // ------------------------------------------------------

          isOnline: false,
          isApproved: false,
        }),
      );

      setDbCourier(courier);
    } catch (e) {
      console.log("Error creating courier:", e);

      const message =
        e?.message || "Something went wrong while saving your courier profile.";

      setSaveError(message);

      Alert.alert("Unable to save profile", message);

      throw e;
    } finally {
      setUploading(false);
    }
  };

  // ================================================================
  // UPDATE COURIER
  // ================================================================

  /**
   * Update an existing Courier record.
   *
   * New images are uploaded before old images are removed.
   */
  const updateCourier = async () => {
    if (uploading) {
      return;
    }

    setSaveError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      // ------------------------------------------------------------
      // Existing profile photo
      // ------------------------------------------------------------

      let uploadedProfilePic = dbCourier?.profilePic;

      // ------------------------------------------------------------
      // Remove old Maxi images when switching away from Maxi
      // ------------------------------------------------------------

      if (
        dbCourier?.transportationType === "MAXI" &&
        transportationType !== "MAXI" &&
        dbCourier?.maxiImages?.length
      ) {
        try {
          await Promise.all(
            dbCourier.maxiImages.map((path) =>
              remove({
                path,
              }).catch((err) => {
                console.log("Failed to delete Maxi image:", path, err);
              }),
            ),
          );
        } catch (err) {
          console.log("Error deleting old Maxi images:", err);
        }
      }

      // ------------------------------------------------------------
      // Maxi images
      // ------------------------------------------------------------

      let uploadedMaxiImages = [];

      if (transportationType === "MAXI") {
        uploadedMaxiImages = await uploadMaxiImages();
      }

      // ------------------------------------------------------------
      // Existing identity documents
      // ------------------------------------------------------------

      let uploadedCourierNINImage = dbCourier?.courierNINImage;

      let uploadedGuarantorNINImage = dbCourier?.guarantorNINImage;

      // ============================================================
      // PROFILE PHOTO
      // ============================================================

      if (profilePic && profilePic !== dbCourier?.profilePic) {
        uploadedProfilePic = await uploadSingleImage(
          profilePic,
          "profilePhoto",
        );

        if (dbCourier?.profilePic) {
          await remove({
            path: dbCourier.profilePic,
          });
        }
      }

      // ============================================================
      // COURIER NIN
      // ============================================================

      if (courierNINImage && courierNINImage !== dbCourier?.courierNINImage) {
        uploadedCourierNINImage = await uploadSingleImage(
          courierNINImage,
          "courierNIN",
        );

        if (dbCourier?.courierNINImage) {
          await remove({
            path: dbCourier.courierNINImage,
          });
        }
      }

      // ============================================================
      // GUARANTOR NIN
      // ============================================================

      if (
        guarantorNINImage &&
        guarantorNINImage !== dbCourier?.guarantorNINImage
      ) {
        uploadedGuarantorNINImage = await uploadSingleImage(
          guarantorNINImage,
          "guarantorNIN",
        );

        if (dbCourier?.guarantorNINImage) {
          await remove({
            path: dbCourier.guarantorNINImage,
          });
        }
      }

      // ============================================================
      // UPDATE EXISTING COURIER
      // ============================================================

      const courier = await DataStore.save(
        Courier.copyOf(dbCourier, (updated) => {
          // ----------------------------------------------------
          // Basic information
          // ----------------------------------------------------

          updated.firstName = firstName;

          updated.lastName = lastName;

          updated.profilePic = uploadedProfilePic;

          // ----------------------------------------------------
          // Transportation
          // ----------------------------------------------------

          updated.transportationType = transportationType;

          updated.vehicleClass = vehicleClass;

          // ----------------------------------------------------
          // Vehicle fields
          // ----------------------------------------------------

          if (transportationType === "MICRO") {
            /*
             * Micro vehicles do not use regular vehicle fields.
             * Clear stale values from previous vehicle types.
             */
            updated.model = "";
            updated.vehicleColour = "";
            updated.plateNumber = "";
          } else {
            updated.model = model;
            updated.vehicleColour = vehicleColour;
            updated.plateNumber = plateNumber;
          }

          // ----------------------------------------------------
          // Maxi fields
          // ----------------------------------------------------

          if (transportationType === "MAXI") {
            updated.maxiImages = uploadedMaxiImages;

            updated.maxiDescription = maxiDescription;
          } else {
            updated.maxiImages = [];
            updated.maxiDescription = "";
          }

          // ----------------------------------------------------
          // General information
          // ----------------------------------------------------

          updated.address = address;

          updated.landMark = landMark;

          updated.email = userMail;

          updated.phoneNumber = phoneNumber;

          updated.courierNIN = courierNIN;

          updated.courierNINImage = uploadedCourierNINImage;

          // ----------------------------------------------------
          // Bank information
          // ----------------------------------------------------

          updated.bankCode = bankCode;

          updated.bankName = bankName;

          updated.accountName = accountName;

          updated.accountNumber = accountNumber;

          // ----------------------------------------------------
          // Guarantor information
          // ----------------------------------------------------

          updated.guarantorName = guarantorName;

          updated.guarantorLastName = guarantorLastName;

          updated.guarantorProfession = guarantorProfession;

          updated.guarantorNumber = guarantorNumber;

          updated.guarantorRelationship = guarantorRelationship;

          updated.guarantorAddress = guarantorAddress;

          updated.guarantorEmail = guarantorEmail;

          updated.guarantorNIN = guarantorNIN;

          updated.guarantorNINImage = uploadedGuarantorNINImage;
        }),
      );

      setDbCourier(courier);
    } catch (e) {
      console.log("Error updating courier:", e);

      const message =
        e?.message ||
        "Something went wrong while updating your courier profile.";

      setSaveError(message);

      Alert.alert("Unable to update profile", message);

      throw e;
    } finally {
      setUploading(false);
    }
  };

  // ================================================================
  // SAVE
  // ================================================================

  /**
   * Final save handler.
   */
  const handleSave = async () => {
    if (uploading) {
      return;
    }

    setSaveError("");

    // --------------------------------------------------------------
    // Validate Maxi requirements
    // --------------------------------------------------------------

    if (!validateMaxiRequirements()) {
      return;
    }

    try {
      // ------------------------------------------------------------
      // Existing courier -> UPDATE
      // New courier -> CREATE
      // ------------------------------------------------------------

      if (dbCourier) {
        await updateCourier();
      } else {
        await createCourier();
      }

      // ------------------------------------------------------------
      // Navigation only after successful save
      // ------------------------------------------------------------

      router.push("/profile");

      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (error) {
      console.log("Save operation failed:", error);
    }
  };

  // ================================================================
  // DERIVED UI DATA
  // ================================================================

  const guarantorInitials = getInitials(guarantorName, guarantorLastName);

  const courierInitials = getInitials(firstName, lastName);

  /**
   * Friendly transportation label.
   */
  const transportationLabel = transportationType
    ? String(transportationType)
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : "";

  const profileImageUri = getImageUri(profilePic);

  const courierNINImageUri = getImageUri(courierNINImage);

  const guarantorNINImageUri = getImageUri(guarantorNINImage);

  // ================================================================
  // RENDER
  // ================================================================

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
              Back button
          -------------------------------------------------------- */}

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.bckBtnCon}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" style={styles.bckBtnIcon} />
          </TouchableOpacity>

          {/* --------------------------------------------------------
              Header copy
          -------------------------------------------------------- */}

          <View style={styles.reviewHeaderText}>
            <Text style={styles.title}>Final Review</Text>

            <Text style={styles.reviewHeaderSubtitle}>
              Confirm your profile before completing registration
            </Text>
          </View>

          {/* --------------------------------------------------------
              Final step badge
          -------------------------------------------------------- */}

          <View style={styles.finalStepBadge}>
            <Ionicons name="checkmark" style={styles.finalStepIcon} />

            <Text style={styles.finalStepText}>Final step</Text>
          </View>
        </View>

        {/* ==========================================================
            MAIN CONTENT
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
              <Text style={styles.completionTitle}>Your profile is ready</Text>

              <Text style={styles.completionText}>
                Review the information below carefully. Once you save, your
                courier profile will be submitted for verification.
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
              <Text style={styles.profileReviewName}>
                {displayValue(firstName)} {lastName || ""}
              </Text>

              <View style={styles.profileReviewRole}>
                <View style={styles.profileReviewStatusDot} />

                <Text style={styles.profileReviewRoleText}>
                  Courier account
                </Text>
              </View>

              {!!transportationType && (
                <View style={styles.transportBadge}>
                  <Ionicons
                    name="car-outline"
                    style={styles.transportBadgeIcon}
                  />

                  <Text style={styles.transportBadgeText}>
                    {transportationLabel}
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
                value={transportationLabel}
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
              MAXI VEHICLE PHOTOS
          ======================================================== */}

          {transportationType === "MAXI" && maxiImages?.length > 0 && (
            <View style={styles.reviewSection}>
              <SectionHeader
                icon="images-outline"
                title="Vehicle photos"
                description={`${maxiImages.length} photo${
                  maxiImages.length === 1 ? "" : "s"
                } uploaded`}
              />

              <View style={styles.vehicleGalleryCard}>
                <View style={styles.imageListContainer}>
                  {maxiImages.map((item, index) => {
                    const imageUri = getImageUri(item);

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
              title="Identity verification"
              description="Your government identification"
            />

            <View style={styles.reviewFieldsCard}>
              <ReviewField
                icon="card-outline"
                label="NIN"
                value={courierNIN}
                last={!courierNINImageUri}
              />
            </View>

            {!!courierNINImageUri && (
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
                      Identity document uploaded
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
                    uri: courierNINImageUri,
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
              description="Where your courier earnings are paid"
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
              GUARANTOR
          ======================================================== */}

          <View style={styles.reviewSection}>
            <SectionHeader
              icon="people-outline"
              title="Guarantor"
              description="Your guarantor information"
            />

            {/* ------------------------------------------------------
                GUARANTOR PROFILE CARD
            ------------------------------------------------------ */}

            <View style={styles.guarantorProfileCard}>
              <View style={styles.guarantorAvatar}>
                <Text style={styles.guarantorAvatarText}>
                  {guarantorInitials || "G"}
                </Text>
              </View>

              <View style={styles.guarantorProfileInfo}>
                <Text style={styles.guarantorProfileName}>
                  {displayValue(guarantorName)} {guarantorLastName || ""}
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

            {/* ------------------------------------------------------
                GUARANTOR DETAILS
            ------------------------------------------------------ */}

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

              <ReviewField
                icon="mail-outline"
                label="Email"
                value={guarantorEmail}
              />

              <ReviewField
                icon="card-outline"
                label="NIN"
                value={guarantorNIN}
                last={!guarantorNINImageUri}
              />
            </View>

            {/* ------------------------------------------------------
                GUARANTOR NIN
            ------------------------------------------------------ */}

            {!!guarantorNINImageUri && (
              <View style={styles.documentReviewCard}>
                <View style={styles.documentReviewHeader}>
                  <View style={styles.documentReviewIcon}>
                    <Ionicons
                      name="document-text-outline"
                      style={styles.documentReviewIconGlyph}
                    />
                  </View>

                  <View style={styles.documentReviewTitleArea}>
                    <Text style={styles.documentReviewTitle}>
                      Guarantor NIN slip
                    </Text>

                    <Text style={styles.documentReviewSubtitle}>
                      Identity document uploaded
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
                    uri: guarantorNINImageUri,
                  }}
                  style={styles.reviewNinImage}
                />
              </View>
            )}
          </View>

          {/* ========================================================
              SECURITY NOTICE
          ======================================================== */}

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
                Your identity, banking and guarantor information is collected
                for courier verification and account security.
              </Text>
            </View>
          </View>

          {/* ========================================================
              FINAL CONFIRMATION
          ======================================================== */}

          <View style={styles.finalConfirmationCard}>
            <View style={styles.finalConfirmationIcon}>
              <Ionicons
                name="checkmark-done-outline"
                style={styles.finalConfirmationGlyph}
              />
            </View>

            <View style={styles.finalConfirmationContent}>
              <Text style={styles.finalConfirmationTitle}>
                Ready to finish?
              </Text>

              <Text style={styles.finalConfirmationText}>
                By selecting Save & Finish, your information will be saved and
                your courier profile will be ready for the verification process.
              </Text>
            </View>
          </View>

          {/* --------------------------------------------------------
              Bottom spacer
          -------------------------------------------------------- */}

          <View style={styles.reviewBottomSpacer} />
        </ScrollView>

        {/* ==========================================================
            BOTTOM ERROR AREA
        ========================================================== */}

        {!!saveError && (
          <View style={styles.bottomErrorArea} pointerEvents="none">
            <View style={styles.errorContainer}>
              <View style={styles.errorIconContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  style={styles.errorIcon}
                />
              </View>

              <Text style={styles.error} numberOfLines={4}>
                {saveError}
              </Text>
            </View>
          </View>
        )}

        {/* ==========================================================
            FIXED SAVE ACTION
        ========================================================== */}

        <View style={styles.reviewBottomAction}>
          <TouchableOpacity
            style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
            disabled={uploading}
            onPress={handleSave}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              uploading
                ? "Saving courier profile"
                : "Save and finish courier registration"
            }
          >
            <View style={styles.saveButtonContent}>
              {/* ----------------------------------------------------
                  Button icon
              ---------------------------------------------------- */}

              <View style={styles.saveButtonIconContainer}>
                {uploading ? (
                  <ActivityIndicator
                    size="small"
                    color={styles.saveButtonIcon.color}
                  />
                ) : (
                  <Ionicons
                    name="checkmark-done-outline"
                    style={styles.saveButtonIcon}
                  />
                )}
              </View>

              {/* ----------------------------------------------------
                  Button text
              ---------------------------------------------------- */}

              <View style={styles.saveButtonTextContainer}>
                <Text style={styles.saveBtnTxt}>
                  {uploading ? "Saving profile..." : "Save & Finish"}
                </Text>

                {uploading ? (
                  <Text style={styles.saveProgressText}>
                    Uploading documents
                    {uploadProgress > 0 ? ` • ${uploadProgress}%` : "..."}
                  </Text>
                ) : (
                  <Text style={styles.saveButtonSubtitle}>
                    Complete courier registration
                  </Text>
                )}
              </View>

              {/* ----------------------------------------------------
                  Forward arrow
              ---------------------------------------------------- */}

              {!uploading && (
                <MaterialIcons
                  name="arrow-forward"
                  style={styles.saveArrowIcon}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReviewGuarantorCom;
