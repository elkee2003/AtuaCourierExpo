import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import { useProfileContext } from "../../../providers/ProfileProvider";
import { createStyles } from "./styles";

/**
 * ============================================================
 * TRANSPORTATION TYPE
 * ============================================================
 *
 * This component is intentionally designed as an EMBEDDED child
 * of EditProfile.
 *
 * IMPORTANT:
 * ------------------------------------------------------------
 * EditProfile already owns the main ScrollView.
 *
 * Therefore this component must NOT create another ScrollView.
 *
 * The previous implementation had:
 *
 *     ScrollView
 *        └── Transportation content
 *
 * while EditProfile also had:
 *
 *     ScrollView
 *        └── TransportationType
 *
 * That created nested scrolling/measurement behaviour.
 *
 * This version uses a normal View instead.
 *
 * The component still has its own styles.js because it lives in
 * a separate folder, but the visual language intentionally
 * matches the EditProfile design.
 * ============================================================
 */

const TransportationTypeCom = () => {
  /* ============================================================
     THEME
     ============================================================ */

  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";

  /*
   * Generate the local stylesheet from the current appearance.
   *
   * We intentionally do this locally because TransportationType
   * has its own styles.js.
   */
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  /* ============================================================
     INPUT COLORS
     ============================================================ */

  /*
   * TextInput text and placeholder colors are supplied explicitly.
   *
   * This prevents dark-mode inputs from appearing blank or having
   * invisible text.
   */
  const inputColors = useMemo(
    () => ({
      text: isDark ? "#F5F7FA" : "#171A1F",
      placeholder: isDark ? "#8F98A8" : "#858B95",
      selection: isDark ? "#FFFFFF" : "#111111",
    }),
    [isDark],
  );

  /* ============================================================
     PROFILE CONTEXT
     ============================================================ */

  const {
    transportationType,
    setTransportationType,

    vehicleClass,
    setVehicleClass,

    model,
    setModel,

    vehicleColour,
    setVehicleColour,

    plateNumber,
    setPlateNumber,

    maxiImages,
    setMaxiImages,

    maxiDescription,
    setMaxiDescription,
  } = useProfileContext();

  /* ============================================================
     LOCAL STATE
     ============================================================ */

  const [isFocus, setIsFocus] = useState(false);

  /* ============================================================
     TRANSPORTATION CATEGORIES
     ============================================================ */

  const transportData = [
    {
      label: "Micro",
      value: "MICRO",
      description:
        "This transportation method option includes eco-friendly transport methods such as Bicycles, Scooters, Skates for quick, short-distance deliveries.",
    },
    {
      label: "Moto",
      value: "MOTO",
      description:
        "This transportation method is suitable for faster, mid-sized deliveries that require speed and distance. This option includes Motorcycles, Mopeds, Car.",
    },
    {
      label: "Maxi",
      value: "MAXI",
      description:
        "This transportation method is best for large or bulky items that need spacious transport. This option includes Vans, Moving Trucks, Large Cargo vehicles.",
    },
  ];

  /* ============================================================
     MOTO VEHICLE CLASSES
     ============================================================ */

  const motoClasses = [
    {
      label: "Motorcycle",
      value: "Motorcycle",
    },

    /*
     * Additional vehicle classes can be enabled later.
     */
    // {
    //   label: "Car (Sedan)",
    //   value: "Car_Sedan",
    // },
    // {
    //   label: "Car (SUV)",
    //   value: "Car_SUV",
    // },
  ];

  /* ============================================================
     MAXI VEHICLE CLASSES
     ============================================================ */

  const maxiClasses = [
    {
      label: "Small Van (1-1.5 Tons)",
      value: "SMALL_VAN",
    },
    {
      label: "Medium Van (2-3 Tons)",
      value: "MEDIUM_VAN",
    },
    {
      label: "Large Van (3-5 Tons)",
      value: "LARGE_VAN",
    },
    {
      label: "5 Ton Truck",
      value: "TRUCK_5T",
    },
    {
      label: "10 Ton Truck",
      value: "TRUCK_10T",
    },

    /*
     * Future options.
     */
    // {
    //   label: "20 Ton Truck",
    //   value: "TRUCK_20T",
    // },

    {
      label: "Flatbed 5 Ton",
      value: "FLATBED_5T",
    },
    {
      label: "Flatbed 10 Ton",
      value: "FLATBED_10T",
    },

    // {
    //   label: "Flatbed 20 Ton",
    //   value: "FLATBED_20T",
    // },

    {
      label: "Tipper 5 Ton (Sand/Gravel)",
      value: "TIPPER_5T",
    },
    {
      label: "Tipper 10 Ton (Sand/Gravel)",
      value: "TIPPER_10T",
    },

    // {
    //   label: "Tipper 20 Ton (Sand/Gravel)",
    //   value: "TIPPER_20T",
    // },

    {
      label: "Refrigerated 5 Ton",
      value: "REFRIGERATED_5T",
    },
    {
      label: "Refrigerated 10 Ton",
      value: "REFRIGERATED_10T",
    },
  ];

  /* ============================================================
     TRANSPORTATION INFORMATION
     ============================================================ */

  const handleInfoPress = (description) => {
    Alert.alert("Transportation Type Details", description);
  };

  /* ============================================================
     MAXI IMAGE PICKER
     ============================================================ */

  const pickImages = async () => {
    try {
      /*
       * Open the device gallery.
       */
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      /*
       * User cancelled the picker.
       */
      if (result.canceled) {
        return;
      }

      /*
       * Maxi vehicles require at least three photos.
       */
      if (!result.assets || result.assets.length < 3) {
        Alert.alert(
          "More photos required",
          "Please select at least 3 vehicle images.",
        );

        return;
      }

      /*
       * Store only the image URIs in the profile context.
       */
      const selectedImages = result.assets.map((asset) => asset.uri);

      setMaxiImages(selectedImages);
    } catch (error) {
      console.log("Failed to select vehicle images:", error);

      Alert.alert(
        "Unable to select photos",
        "Something went wrong while selecting your vehicle photos. Please try again.",
      );
    }
  };

  /* ============================================================
     DROPDOWN COLORS
     ============================================================ */

  const dropdownColors = useMemo(
    () => ({
      activeColor: isDark ? "#1D252F" : "#F3F5F7",
      iconColor: isDark ? "#AAB2C0" : "#69727E",
    }),
    [isDark],
  );

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    /*
     * IMPORTANT:
     *
     * This is deliberately a normal View.
     *
     * EditProfile already provides the ScrollView.
     */
    <View style={styles.container}>
      {/* ======================================================
          TRANSPORTATION CATEGORY
          ====================================================== */}

      <View style={styles.categoryGroup}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryHeaderIcon}>
            <AntDesign
              name="car"
              size={16}
              color={isDark ? "#F5F7FA" : "#171A1F"}
            />
          </View>

          <View style={styles.categoryHeaderCopy}>
            <Text style={styles.categoryTitle}>Vehicle category</Text>

            <Text style={styles.categoryDescription}>
              Select the type of vehicle you operate
            </Text>
          </View>
        </View>

        {/* ====================================================
            TRANSPORTATION DROPDOWN
            ==================================================== */}

        <Dropdown
          style={[styles.dropdown, isFocus && styles.dropdownFocused]}
          data={transportData}
          labelField="label"
          valueField="value"
          placeholder="Select category"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          itemTextStyle={styles.dropdownItemText}
          value={transportationType || null}
          activeColor={dropdownColors.activeColor}
          iconColor={dropdownColors.iconColor}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            /*
             * Save the selected transportation category.
             */
            setTransportationType(item.value);

            /*
             * A vehicle class belongs to a specific category.
             *
             * Therefore, when the category changes, the old class
             * must be cleared.
             */
            setVehicleClass(null);

            setIsFocus(false);
          }}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              <View style={styles.dropdownItemCopy}>
                <Text style={styles.itemLabel}>{item.label}</Text>

                {!!item.description && (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleInfoPress(item.description)}
                style={styles.infoButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`More information about ${item.label}`}
              >
                <AntDesign name="info-circle" style={styles.infoIcon} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* ======================================================
          MOTO
          ====================================================== */}

      {transportationType === "MOTO" && (
        <View style={styles.detailSection}>
          {/* --------------------------------------------------
              MOTO HEADER
              -------------------------------------------------- */}

          <View style={styles.detailHeader}>
            <View style={styles.detailIcon}>
              <AntDesign
                name="dashboard"
                size={15}
                color={isDark ? "#F5F7FA" : "#171A1F"}
              />
            </View>

            <View style={styles.detailHeaderCopy}>
              <Text style={styles.detailTitle}>Vehicle details</Text>

              <Text style={styles.detailSubtitle}>
                Tell us about your motorcycle
              </Text>
            </View>
          </View>

          {/* --------------------------------------------------
              MOTO DETAILS CARD
              -------------------------------------------------- */}

          <View style={styles.detailCard}>
            {/* Vehicle class */}

            <Text style={styles.inputLabel}>Vehicle class</Text>

            <Dropdown
              style={styles.dropdown}
              data={motoClasses}
              labelField="label"
              valueField="value"
              placeholder="Select vehicle class"
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              itemTextStyle={styles.dropdownItemText}
              value={vehicleClass || null}
              activeColor={dropdownColors.activeColor}
              iconColor={dropdownColors.iconColor}
              onChange={(item) => setVehicleClass(item.value)}
            />

            {/* Vehicle model */}

            <Text style={styles.inputLabel}>Vehicle model</Text>

            <TextInput
              style={styles.input}
              value={model || ""}
              onChangeText={setModel}
              placeholder="Vehicle model (e.g. Honda CB125)"
              placeholderTextColor={inputColors.placeholder}
              selectionColor={inputColors.selection}
              autoCapitalize="words"
              autoCorrect={false}
              keyboardType="default"
              textContentType="none"
            />

            {/* Vehicle colour */}

            <Text style={styles.inputLabel}>Vehicle colour</Text>

            <TextInput
              style={styles.input}
              value={vehicleColour || ""}
              onChangeText={setVehicleColour}
              placeholder="Vehicle colour (e.g. Red)"
              placeholderTextColor={inputColors.placeholder}
              selectionColor={inputColors.selection}
              autoCapitalize="words"
              autoCorrect={false}
              keyboardType="default"
              textContentType="none"
            />

            {/* Plate number */}

            <Text style={styles.inputLabel}>Plate number</Text>

            <TextInput
              style={styles.input}
              value={plateNumber || ""}
              onChangeText={setPlateNumber}
              placeholder="Plate number"
              placeholderTextColor={inputColors.placeholder}
              selectionColor={inputColors.selection}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              textContentType="none"
            />
          </View>
        </View>
      )}

      {/* ======================================================
          MAXI
          ====================================================== */}

      {transportationType === "MAXI" && (
        <View style={styles.detailSection}>
          {/* --------------------------------------------------
              MAXI HEADER
              -------------------------------------------------- */}

          <View style={styles.detailHeader}>
            <View style={styles.detailIcon}>
              <AntDesign
                name="car"
                size={15}
                color={isDark ? "#F5F7FA" : "#171A1F"}
              />
            </View>

            <View style={styles.detailHeaderCopy}>
              <Text style={styles.detailTitle}>Vehicle details</Text>

              <Text style={styles.detailSubtitle}>
                Provide the details of your cargo vehicle
              </Text>
            </View>
          </View>

          {/* --------------------------------------------------
              MAXI DETAILS CARD
              -------------------------------------------------- */}

          <View style={styles.detailCard}>
            {/* Vehicle class */}

            <Text style={styles.inputLabel}>Vehicle class</Text>

            <Dropdown
              style={styles.dropdown}
              data={maxiClasses}
              labelField="label"
              valueField="value"
              placeholder="Select vehicle class"
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              itemTextStyle={styles.dropdownItemText}
              value={vehicleClass || null}
              activeColor={dropdownColors.activeColor}
              iconColor={dropdownColors.iconColor}
              onChange={(item) => setVehicleClass(item.value)}
            />

            {/* Vehicle model */}

            <Text style={styles.inputLabel}>Vehicle model</Text>

            <TextInput
              style={styles.input}
              value={model || ""}
              onChangeText={setModel}
              placeholder="Vehicle model"
              placeholderTextColor={inputColors.placeholder}
              selectionColor={inputColors.selection}
              autoCapitalize="words"
              autoCorrect={false}
              keyboardType="default"
              textContentType="none"
            />

            {/* Vehicle colour */}

            <Text style={styles.inputLabel}>Vehicle colour</Text>

            <TextInput
              style={styles.input}
              value={vehicleColour || ""}
              onChangeText={setVehicleColour}
              placeholder="Vehicle colour (e.g. Red)"
              placeholderTextColor={inputColors.placeholder}
              selectionColor={inputColors.selection}
              autoCapitalize="words"
              autoCorrect={false}
              keyboardType="default"
              textContentType="none"
            />

            {/* Plate number */}

            <Text style={styles.inputLabel}>Plate number</Text>

            <TextInput
              style={styles.input}
              value={plateNumber || ""}
              onChangeText={setPlateNumber}
              placeholder="Plate number"
              placeholderTextColor={inputColors.placeholder}
              selectionColor={inputColors.selection}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              textContentType="none"
            />

            {/* ==================================================
                VEHICLE CAPACITY / DESCRIPTION
                ================================================== */}

            <Text style={styles.inputLabel}>
              Vehicle capacity & description
            </Text>

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={maxiDescription || ""}
              onChangeText={setMaxiDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="Describe the capacity of your vehicle and give examples of what it can carry"
              placeholderTextColor={inputColors.placeholder}
              selectionColor={inputColors.selection}
            />

            {/* ==================================================
                VEHICLE PHOTOS
                ================================================== */}

            <View style={styles.photoSection}>
              <View style={styles.photoHeader}>
                <View style={styles.photoHeaderCopy}>
                  <Text style={styles.photoTitle}>Vehicle photos</Text>

                  <Text style={styles.photoSubtitle}>
                    Upload at least 3 clear photos of the vehicle
                  </Text>
                </View>

                {!!maxiImages?.length && (
                  <View style={styles.photoCount}>
                    <Text style={styles.photoCountText}>
                      {maxiImages.length}
                    </Text>
                  </View>
                )}
              </View>

              {/* Upload button */}

              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImages}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Upload vehicle photos"
              >
                <View style={styles.photoButtonIcon}>
                  <AntDesign name="camera" size={17} color="#FFFFFF" />
                </View>

                <View style={styles.photoButtonCopy}>
                  <Text style={styles.photoButtonText}>
                    {maxiImages?.length > 0
                      ? "Add or replace photos"
                      : "Upload vehicle photos"}
                  </Text>

                  <Text style={styles.photoButtonSubtext}>
                    Choose clear images from your gallery
                  </Text>
                </View>

                <AntDesign name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Image previews */}

              {maxiImages?.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  {maxiImages.map((uri, index) => (
                    <View
                      key={`${uri}-${index}`}
                      style={styles.previewImageWrapper}
                    >
                      <Image source={{ uri }} style={styles.previewImage} />

                      <View style={styles.previewImageNumber}>
                        <Text style={styles.previewImageNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default TransportationTypeCom;
