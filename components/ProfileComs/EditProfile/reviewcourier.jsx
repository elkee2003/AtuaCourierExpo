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

/**
 * ================================================================
 * REVIEW COURIER PROFILE
 * ================================================================
 *
 * This screen:
 *
 * 1. Reviews the courier's personal information.
 * 2. Reviews vehicle information.
 * 3. Reviews location information.
 * 4. Reviews courier NIN information.
 * 5. Reviews bank information.
 * 6. Saves the courier information.
 * 7. Leaves isOnboardingComplete as false for new couriers.
 * 8. Moves the courier to the guarantor step.
 *
 * Guarantor information is intentionally NOT saved here.
 * It will be saved in ReviewGuarantorCom.
 */

/* =================================================================
   HELPERS
   ================================================================= */

/**
 * Converts an image value into a usable URI.
 *
 * The context may contain:
 *
 * - A simple string URI.
 * - An object containing uri.
 * - An object containing key.
 * - An object containing path.
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
 * Returns true when a value has been provided.
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
 * Masks a bank account number.
 */
const maskAccountNumber = (value) => {
  if (!isProvided(value)) {
    return "Not provided";
  }

  const accountNumber = String(value);

  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  return `•••• •••• ${accountNumber.slice(-4)}`;
};

/**
 * Generates a unique image name.
 */
const createImageName = () => {
  return `${Crypto.randomUUID()}.jpg`;
};

/**
 * Uploads a local image to storage.
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
   * If this is already an uploaded storage path,
   * do not upload it again.
   */
  if (
    imageUri.startsWith("public/") ||
    imageUri.startsWith("protected/") ||
    imageUri.startsWith("private/")
  ) {
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
 * Uploads MAXI vehicle images.
 *
 * Existing storage paths are preserved.
 * New local images are uploaded.
 */
const uploadMaxiImages = async ({ images, sub }) => {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  const uploadedImages = [];

  for (const image of images) {
    const imageUri = getImageUri(image);

    if (!imageUri) {
      continue;
    }

    /**
     * Preserve already-uploaded images.
     */
    if (
      imageUri.startsWith("public/") ||
      imageUri.startsWith("protected/") ||
      imageUri.startsWith("private/")
    ) {
      uploadedImages.push(imageUri);
      continue;
    }

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
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

    const imagePath = `public/maxiImages/${sub}/${createImageName()}`;

    await uploadData({
      path: imagePath,
      data: blob,
      options: {
        contentType: "image/jpeg",
      },
    }).result;

    uploadedImages.push(imagePath);
  }

  return uploadedImages;
};

/**
 * Deletes a storage file safely.
 *
 * If deletion fails, the main save operation should not fail
 * because the database has already been saved successfully.
 */
const deleteStorageFileSafely = async (path) => {
  if (!path || typeof path !== "string") {
    return;
  }

  if (
    !path.startsWith("public/") &&
    !path.startsWith("protected/") &&
    !path.startsWith("private/")
  ) {
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

/**
 * Deletes multiple storage files safely.
 */
const deleteStorageFilesSafely = async (paths = []) => {
  const uniquePaths = [...new Set(paths.filter(Boolean))];

  for (const path of uniquePaths) {
    await deleteStorageFileSafely(path);
  }
};

/* =================================================================
   COMPONENT
   ================================================================= */

const ReviewCourierCom = () => {
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
    latitude,
    longitude,

    /* --------------------------------------------------------------
       Contact
       -------------------------------------------------------------- */

    phoneNumber,

    /* --------------------------------------------------------------
       Courier identity
       -------------------------------------------------------------- */

    courierNIN,
    courierNINImage,

    /* --------------------------------------------------------------
       Bank information
       -------------------------------------------------------------- */

    bankCode,
    bankName,
    accountName,
    accountNumber,
  } = useProfileContext();

  const { sub, userMail, dbCourier, setDbCourier } = useAuthContext();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  /* =================================================================
    VALIDATION
    ================================================================= */

  /**
   * Validates all information required before moving to the
   * guarantor onboarding step.
   */
  const validateCourierInformation = () => {
    const missingFields = [];

    /* --------------------------------------------------------------
     Personal information
     -------------------------------------------------------------- */

    if (!isProvided(firstName)) {
      missingFields.push("First name");
    }

    if (!isProvided(lastName)) {
      missingFields.push("Last name");
    }

    if (!isProvided(phoneNumber)) {
      missingFields.push("Phone number");
    }

    /**
     * Profile picture is required.
     *
     * This was previously missing from the validation logic.
     */
    if (!getImageUri(profilePic)) {
      missingFields.push("Profile picture");
    }

    /* --------------------------------------------------------------
     Transportation
     -------------------------------------------------------------- */

    if (!isProvided(transportationType)) {
      missingFields.push("Transportation type");
    }

    /**
     * Vehicle details are required for MOTO and MAXI.
     *
     * MICRO does not require vehicle information.
     */
    if (transportationType === "MOTO" || transportationType === "MAXI") {
      if (!isProvided(vehicleClass)) {
        missingFields.push("Vehicle class");
      }

      if (!isProvided(model)) {
        missingFields.push("Vehicle model");
      }

      if (!isProvided(vehicleColour)) {
        missingFields.push("Vehicle colour");
      }

      if (!isProvided(plateNumber)) {
        missingFields.push("Plate number");
      }
    }

    /* --------------------------------------------------------------
     MAXI information
     -------------------------------------------------------------- */

    if (transportationType === "MAXI") {
      if (!isProvided(maxiDescription)) {
        missingFields.push("MAXI vehicle description");
      }

      if (!Array.isArray(maxiImages) || maxiImages.length < 3) {
        missingFields.push("At least 3 MAXI vehicle images");
      }
    }

    /* --------------------------------------------------------------
     Location
     -------------------------------------------------------------- */

    if (!isProvided(address)) {
      missingFields.push("Address");
    }

    /* --------------------------------------------------------------
     Courier identity
     -------------------------------------------------------------- */

    if (!isProvided(courierNIN)) {
      missingFields.push("Courier NIN");
    }

    if (!getImageUri(courierNINImage)) {
      missingFields.push("Courier NIN image");
    }

    /* --------------------------------------------------------------
     Bank information
     -------------------------------------------------------------- */

    if (!isProvided(bankName)) {
      missingFields.push("Bank name");
    }

    if (!isProvided(accountName)) {
      missingFields.push("Account name");
    }

    if (!isProvided(accountNumber)) {
      missingFields.push("Account number");
    }

    /* --------------------------------------------------------------
     Display validation error
     -------------------------------------------------------------- */

    if (missingFields.length > 0) {
      const message = `Please provide:\n\n${missingFields
        .map((field) => `• ${field}`)
        .join("\n")}`;

      setSaveError(message);

      Alert.alert("Incomplete information", message);

      return false;
    }

    return true;
  };

  /* =================================================================
     CREATE COURIER
     ================================================================= */

  /**
   * Creates a new Courier record.
   *
   * Important:
   *
   * - isOnboardingComplete is explicitly false.
   * - Guarantor fields are not saved here.
   */
  const createCourier = async () => {
    if (!sub) {
      throw new Error(
        "Your account session could not be found. Please sign in again.",
      );
    }

    setSaving(true);

    let uploadedProfilePic = null;
    let uploadedCourierNINImage = null;
    let uploadedMaxiImages = [];

    try {
      /**
       * Upload personal images first.
       */
      uploadedProfilePic = await uploadSingleImage({
        image: profilePic,
        folder: "profilePictures",
        sub,
        resizeWidth: 800,
        compress: 0.7,
      });

      uploadedCourierNINImage = await uploadSingleImage({
        image: courierNINImage,
        folder: "courierNIN",
        sub,
        resizeWidth: 1000,
        compress: 0.8,
      });

      /**
       * Upload MAXI images only for MAXI couriers.
       */
      if (transportationType === "MAXI") {
        uploadedMaxiImages = await uploadMaxiImages({
          images: maxiImages,
          sub,
        });
      }

      /**
       * Check whether a courier already exists.
       *
       * This prevents duplicate Courier records.
       */
      let existingCourier = dbCourier;

      if (!existingCourier) {
        const existingCouriers = await DataStore.query(Courier, (courier) =>
          courier.sub.eq(sub),
        );

        existingCourier = existingCouriers?.[0] || null;
      }

      /**
       * If a courier already exists, update it instead of creating
       * a duplicate record.
       */
      if (existingCourier) {
        const previousProfilePic = existingCourier.profilePic;
        const previousCourierNINImage = existingCourier.courierNINImage;
        const previousMaxiImages = Array.isArray(existingCourier.maxiImages)
          ? existingCourier.maxiImages
          : [];

        const updatedCourier = await DataStore.save(
          Courier.copyOf(existingCourier, (updated) => {
            /* --------------------------------------------------------
               Account identity
               -------------------------------------------------------- */

            updated.sub = sub;
            updated.email = userMail || existingCourier.email || null;

            /* --------------------------------------------------------
               Personal information
               -------------------------------------------------------- */

            updated.firstName = firstName;
            updated.lastName = lastName;
            updated.phoneNumber = phoneNumber;

            /* --------------------------------------------------------
               Profile image
               -------------------------------------------------------- */

            updated.profilePic =
              uploadedProfilePic || existingCourier.profilePic || null;

            /* --------------------------------------------------------
               Transportation
               -------------------------------------------------------- */

            updated.transportationType = transportationType;
            updated.vehicleClass =
              transportationType === "MICRO" ? null : vehicleClass || null;

            updated.model =
              transportationType === "MICRO" ? null : model || null;

            updated.vehicleColour =
              transportationType === "MICRO" ? null : vehicleColour || null;

            updated.plateNumber =
              transportationType === "MICRO" ? null : plateNumber || null;

            /* --------------------------------------------------------
               MAXI information
               -------------------------------------------------------- */

            updated.maxiDescription =
              transportationType === "MAXI" ? maxiDescription || null : null;

            updated.maxiImages =
              transportationType === "MAXI" ? uploadedMaxiImages : [];

            /* --------------------------------------------------------
               Location
               -------------------------------------------------------- */

            updated.address = address;
            updated.landMark = landMark || null;
            updated.latitude = latitude || null;
            updated.longitude = longitude || null;

            /* --------------------------------------------------------
               Courier identity
               -------------------------------------------------------- */

            updated.courierNIN = courierNIN;

            updated.courierNINImage =
              uploadedCourierNINImage ||
              existingCourier.courierNINImage ||
              null;

            /* --------------------------------------------------------
               Bank information
               -------------------------------------------------------- */

            updated.bankCode = bankCode || null;
            updated.bankName = bankName;
            updated.accountName = accountName;
            updated.accountNumber = accountNumber;

            /**
             * Do not set isOnboardingComplete here.
             *
             * If this courier had already completed onboarding,
             * editing the personal profile must not reset it.
             */
          }),
        );

        setDbCourier(updatedCourier);

        /**
         * Delete replaced images only after the database save
         * succeeds.
         */
        const filesToDelete = [];

        if (
          previousProfilePic &&
          uploadedProfilePic &&
          previousProfilePic !== uploadedProfilePic
        ) {
          filesToDelete.push(previousProfilePic);
        }

        if (
          previousCourierNINImage &&
          uploadedCourierNINImage &&
          previousCourierNINImage !== uploadedCourierNINImage
        ) {
          filesToDelete.push(previousCourierNINImage);
        }

        if (transportationType === "MAXI") {
          const newMaxiImages = uploadedMaxiImages;

          const removedMaxiImages = previousMaxiImages.filter(
            (oldImage) => !newMaxiImages.includes(oldImage),
          );

          filesToDelete.push(...removedMaxiImages);
        } else {
          filesToDelete.push(...previousMaxiImages);
        }

        await deleteStorageFilesSafely(filesToDelete);

        return updatedCourier;
      }

      /**
       * Create a new Courier.
       *
       * Guarantor information is intentionally excluded.
       */
      const courier = await DataStore.save(
        new Courier({
          /* ----------------------------------------------------------
             Account identity
             ---------------------------------------------------------- */

          sub,
          email: userMail || null,

          /* ----------------------------------------------------------
             Personal information
             ---------------------------------------------------------- */

          firstName,
          lastName,
          phoneNumber,

          /* ----------------------------------------------------------
             Profile image
             ---------------------------------------------------------- */

          profilePic: uploadedProfilePic,

          /* ----------------------------------------------------------
             Transportation
             ---------------------------------------------------------- */

          transportationType,

          vehicleClass:
            transportationType === "MICRO" ? null : vehicleClass || null,

          model: transportationType === "MICRO" ? null : model || null,

          vehicleColour:
            transportationType === "MICRO" ? null : vehicleColour || null,

          plateNumber:
            transportationType === "MICRO" ? null : plateNumber || null,

          /* ----------------------------------------------------------
             MAXI information
             ---------------------------------------------------------- */

          maxiDescription:
            transportationType === "MAXI" ? maxiDescription || null : null,

          maxiImages: transportationType === "MAXI" ? uploadedMaxiImages : [],

          /* ----------------------------------------------------------
             Location
             ---------------------------------------------------------- */

          address,
          landMark: landMark || null,
          latitude: latitude || null,
          longitude: longitude || null,

          /* ----------------------------------------------------------
             Courier identity
             ---------------------------------------------------------- */

          courierNIN,
          courierNINImage: uploadedCourierNINImage,

          /* ----------------------------------------------------------
             Bank information
             ---------------------------------------------------------- */

          bankCode: bankCode || null,
          bankName,
          accountName,
          accountNumber,

          /* ----------------------------------------------------------
             Onboarding status
             ---------------------------------------------------------- */

          /**
           * Personal review is not the final onboarding step.
           * Guarantor review will change this to true.
           */
          isOnboardingComplete: false,
        }),
      );

      setDbCourier(courier);

      return courier;
    } catch (error) {
      console.log("Error creating courier:", error);

      /**
       * If uploads succeeded but the database save failed,
       * clean up the newly-uploaded files.
       */
      await deleteStorageFilesSafely([
        uploadedProfilePic,
        uploadedCourierNINImage,
        ...uploadedMaxiImages,
      ]);

      throw error;
    } finally {
      setSaving(false);
    }
  };

  /* =================================================================
   UPDATE COURIER
   ================================================================= */

  /**
   * Updates an existing Courier record.
   *
   * Important:
   *
   * - Guarantor fields are not changed here.
   * - isOnboardingComplete is not changed here.
   * - Existing onboarding status is preserved.
   * - Old images are deleted only after a successful database save.
   * - Newly uploaded images are deleted if the save fails.
   */
  const updateCourier = async (courierToUpdate) => {
    /* --------------------------------------------------------------
     Basic checks
     -------------------------------------------------------------- */

    if (!courierToUpdate) {
      throw new Error(
        "Your courier profile could not be found. Please try again.",
      );
    }

    if (!sub) {
      throw new Error(
        "Your account session could not be found. Please sign in again.",
      );
    }

    setSaving(true);

    /* --------------------------------------------------------------
     Uploaded file tracking
     --------------------------------------------------------------

     These variables must be declared outside the try block so
     they are accessible inside the catch block.
     -------------------------------------------------------------- */

    let uploadedProfilePic = null;
    let uploadedCourierNINImage = null;
    let uploadedMaxiImages = [];

    /* --------------------------------------------------------------
     Previous storage values
     --------------------------------------------------------------

     These variables were previously declared inside the try block.
     That caused a ReferenceError inside catch when an error occurred.

     They are now declared before try so both try and catch can use
     them safely.
     -------------------------------------------------------------- */

    const previousProfilePic = courierToUpdate.profilePic;

    const previousCourierNINImage = courierToUpdate.courierNINImage;

    const previousMaxiImages = Array.isArray(courierToUpdate.maxiImages)
      ? courierToUpdate.maxiImages
      : [];

    try {
      /* ============================================================
       UPLOAD PROFILE PICTURE
       ============================================================ */

      uploadedProfilePic = await uploadSingleImage({
        image: profilePic,
        folder: "profilePictures",
        sub,
        resizeWidth: 800,
        compress: 0.7,
      });

      /* ============================================================
       UPLOAD COURIER NIN IMAGE
       ============================================================ */

      uploadedCourierNINImage = await uploadSingleImage({
        image: courierNINImage,
        folder: "courierNIN",
        sub,
        resizeWidth: 1000,
        compress: 0.8,
      });

      /* ============================================================
       UPLOAD MAXI IMAGES
       ============================================================ */

      /**
       * MAXI images are uploaded only when the selected
       * transportation type is MAXI.
       */
      if (transportationType === "MAXI") {
        uploadedMaxiImages = await uploadMaxiImages({
          images: maxiImages,
          sub,
        });
      }

      /* ============================================================
       SAVE UPDATED COURIER
       ============================================================ */

      const updatedCourier = await DataStore.save(
        Courier.copyOf(courierToUpdate, (updated) => {
          /* --------------------------------------------------------
           Account identity
           -------------------------------------------------------- */

          updated.sub = sub;

          updated.email = userMail || courierToUpdate.email || null;

          /* --------------------------------------------------------
           Personal information
           -------------------------------------------------------- */

          updated.firstName = firstName;

          updated.lastName = lastName;

          updated.phoneNumber = phoneNumber;

          /* --------------------------------------------------------
           Profile picture
           -------------------------------------------------------- */

          /**
           * Use the newly uploaded picture if available.
           * Otherwise preserve the existing picture.
           */
          updated.profilePic =
            uploadedProfilePic || courierToUpdate.profilePic || null;

          /* --------------------------------------------------------
           Transportation
           -------------------------------------------------------- */

          updated.transportationType = transportationType;

          /**
           * MICRO does not use vehicle details.
           */
          updated.vehicleClass =
            transportationType === "MICRO" ? null : vehicleClass || null;

          updated.model = transportationType === "MICRO" ? null : model || null;

          updated.vehicleColour =
            transportationType === "MICRO" ? null : vehicleColour || null;

          updated.plateNumber =
            transportationType === "MICRO" ? null : plateNumber || null;

          /* --------------------------------------------------------
           MAXI information
           -------------------------------------------------------- */

          /**
           * Clear MAXI information when the courier changes
           * from MAXI to another transportation type.
           */
          updated.maxiDescription =
            transportationType === "MAXI" ? maxiDescription || null : null;

          updated.maxiImages =
            transportationType === "MAXI" ? uploadedMaxiImages : [];

          /* --------------------------------------------------------
           Location
           -------------------------------------------------------- */

          updated.address = address;

          updated.landMark = landMark || null;

          updated.latitude = latitude || null;

          updated.longitude = longitude || null;

          /* --------------------------------------------------------
           Courier identity
           -------------------------------------------------------- */

          updated.courierNIN = courierNIN;

          updated.courierNINImage =
            uploadedCourierNINImage || courierToUpdate.courierNINImage || null;

          /* --------------------------------------------------------
           Bank information
           -------------------------------------------------------- */

          updated.bankCode = bankCode || null;

          updated.bankName = bankName;

          updated.accountName = accountName;

          updated.accountNumber = accountNumber;

          /* --------------------------------------------------------
           Fields intentionally not changed
           --------------------------------------------------------

           The following fields belong to the guarantor step and
           must remain untouched here:

           - guarantorName
           - guarantorLastName
           - guarantorProfession
           - guarantorNumber
           - guarantorRelationship
           - guarantorAddress
           - guarantorEmail
           - guarantorNIN
           - guarantorNINImage
           - isOnboardingComplete
        */
        }),
      );

      /* --------------------------------------------------------------
       Update profile context
       -------------------------------------------------------------- */

      setDbCourier(updatedCourier);

      /* ============================================================
       DELETE OLD STORAGE FILES
       ============================================================ */

      /**
       * Only delete old files after DataStore.save succeeds.
       */
      const filesToDelete = [];

      /* --------------------------------------------------------------
       Old profile picture
       -------------------------------------------------------------- */

      if (
        previousProfilePic &&
        uploadedProfilePic &&
        previousProfilePic !== uploadedProfilePic
      ) {
        filesToDelete.push(previousProfilePic);
      }

      /* --------------------------------------------------------------
       Old courier NIN image
       -------------------------------------------------------------- */

      if (
        previousCourierNINImage &&
        uploadedCourierNINImage &&
        previousCourierNINImage !== uploadedCourierNINImage
      ) {
        filesToDelete.push(previousCourierNINImage);
      }

      /* --------------------------------------------------------------
       Old MAXI images
       -------------------------------------------------------------- */

      if (transportationType === "MAXI") {
        /**
         * Any old MAXI image that is no longer present in the new
         * image list should be deleted.
         */
        const removedMaxiImages = previousMaxiImages.filter(
          (oldImage) => !uploadedMaxiImages.includes(oldImage),
        );

        filesToDelete.push(...removedMaxiImages);
      } else {
        /**
         * If the courier changed from MAXI to another type,
         * delete all previous MAXI images.
         */
        filesToDelete.push(...previousMaxiImages);
      }

      await deleteStorageFilesSafely(filesToDelete);

      return updatedCourier;
    } catch (error) {
      console.log("Error updating courier:", error);

      /* ============================================================
       CLEAN UP NEWLY UPLOADED FILES
       ============================================================ */

      /**
       * If the database save failed after uploading new files,
       * delete only the newly uploaded files.
       *
       * Existing storage paths are returned unchanged by the
       * upload helpers, so they are not deleted accidentally.
       */
      await deleteStorageFilesSafely([
        uploadedProfilePic !== previousProfilePic ? uploadedProfilePic : null,

        uploadedCourierNINImage !== previousCourierNINImage
          ? uploadedCourierNINImage
          : null,

        ...uploadedMaxiImages.filter(
          (image) => !previousMaxiImages.includes(image),
        ),
      ]);

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

    if (!validateCourierInformation()) {
      return;
    }

    try {
      /**
       * Find the latest courier record.
       *
       * This also handles the situation where dbCourier has not
       * hydrated yet but the record already exists in DataStore.
       */
      let courierRecord = dbCourier;

      if (!courierRecord && sub) {
        const existingCouriers = await DataStore.query(Courier, (courier) =>
          courier.sub.eq(sub),
        );

        courierRecord = existingCouriers?.[0] || null;
      }

      /**
       * Update an existing courier or create a new courier.
       */
      if (courierRecord) {
        await updateCourier(courierRecord);
      } else {
        await createCourier();
      }

      router.push("/profile/nexteditprofile");
    } catch (error) {
      console.log("Courier save operation failed:", error);

      const message =
        error?.message ||
        "Something went wrong while saving your courier profile.";

      setSaveError(message);

      Alert.alert("Unable to save profile", message);
    }
  };

  /* =================================================================
     DISPLAY HELPERS
     ================================================================= */

  const getInitials = () => {
    const firstInitial = firstName?.trim()?.charAt(0) || "";

    const lastInitial = lastName?.trim()?.charAt(0) || "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const initials = getInitials();

  const profileImageUri = getImageUri(profilePic);
  const courierNINImageUri = getImageUri(courierNINImage);

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
            <Text style={styles.title}>Review Profile</Text>

            <Text style={styles.reviewHeaderSubtitle}>
              Check your details before continuing
            </Text>
          </View>

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
                    {initials || "?"}
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
                  Courier profile
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
              ERROR MESSAGE
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
              COMPLETION NOTICE
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
                Save your courier information and continue to provide your
                guarantor details.
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
            accessibilityLabel="Save courier information and continue"
          >
            <View style={styles.nextButtonContent}>
              <View style={styles.nextButtonCopy}>
                <Text style={styles.nextButtonTitle}>
                  {saving ? "Saving..." : "Save and continue"}
                </Text>

                <Text style={styles.nextButtonSubtitle}>
                  {saving ? "Please wait" : "Add guarantor information"}
                </Text>
              </View>

              <View style={styles.nextButtonIconContainer}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <MaterialIcons
                    name="arrow-forward"
                    style={styles.nxtBtnIcon}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReviewCourierCom;
