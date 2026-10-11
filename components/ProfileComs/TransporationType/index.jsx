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

const TransportationTypeCom = () => {
  const isDark = useColorScheme() === "dark";
  const styles = useMemo(() => createStyles(isDark), [isDark]);

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

  const [categoryFocused, setCategoryFocused] = useState(false);
  const [modelFocused, setModelFocused] = useState(false);
  const [colourFocused, setColourFocused] = useState(false);
  const [plateFocused, setPlateFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const transportationTypes = [
    {
      label: "Micro",
      value: "MICRO",
      description: "Bicycle and other small delivery vehicles.",
    },
    {
      label: "Moto",
      value: "MOTO",
      description: "Motorcycles and similar two-wheel delivery vehicles.",
    },
    {
      label: "Maxi",
      value: "MAXI",
      description: "Cars, vans, pickups and trucks for larger deliveries.",
    },
  ];

  const motoClasses = [
    {
      label: "Motorcycle",
      value: "MOTORCYCLE",
      description: "Standard motorcycle suitable for courier deliveries.",
    },
  ];

  const maxiClasses = [
    {
      label: "Car",
      value: "CAR",
      capacity: "Passenger car",
      description: "Suitable for smaller packages and lighter deliveries.",
      image: require("../../../assets/maxiCategories/car.jpg"),
    },

    {
      label: "Wagon",
      value: "WAGON",
      capacity: "Larger cargo space",
      description: "A car-style vehicle with additional rear cargo space.",
      image: require("../../../assets/maxiCategories/wagon.jpg"),
    },

    {
      label: "Minibus",
      value: "MINIBUS",
      capacity: "Multi-purpose cargo space",
      description:
        "Suitable for larger items and deliveries requiring more interior space.",
      image: require("../../../assets/maxiCategories/minibus.jpg"),
    },

    {
      label: "Pickup",
      value: "PICKUP",
      capacity: "Open cargo bed",
      description:
        "Suitable for bulky items and goods that can be transported in an open cargo bed.",
      image: require("../../../assets/maxiCategories/pickup.jpg"),
    },

    {
      label: "Small Van",
      value: "SMALL_VAN",
      capacity: "1-1.5 tons",
      description: "Small commercial vans for lighter cargo loads.",
      image: require("../../../assets/maxiCategories/smallvan.jpg"),
    },

    {
      label: "Medium Van",
      value: "MEDIUM_VAN",
      capacity: "2-3 tons",
      description: "Medium commercial vans for larger cargo loads.",
      image: require("../../../assets/maxiCategories/mediumvan.jpg"),
    },

    {
      label: "Large Van",
      value: "LARGE_VAN",
      capacity: "3-5 tons",
      description:
        "Large commercial vans designed for bulky and heavier cargo.",
      image: require("../../../assets/maxiCategories/largevan.jpg"),
    },

    {
      label: "5 Ton Truck",
      value: "TRUCK_5T",
      capacity: "Up to 5 tons",
      description: "Medium-duty truck suitable for heavier commercial cargo.",
      image: require("../../../assets/maxiCategories/truck5t.jpg"),
    },

    {
      label: "10 Ton Truck",
      value: "TRUCK_10T",
      capacity: "Up to 10 tons",
      description: "Heavy-duty truck for large commercial cargo loads.",
      image: require("../../../assets/maxiCategories/truck10t.jpg"),
    },

    {
      label: "Flatbed 5 Ton",
      value: "FLATBED_5T",
      capacity: "Up to 5 tons",
      description:
        "Open flatbed vehicle for bulky, oversized or difficult-to-load cargo.",
      image: require("../../../assets/maxiCategories/flatbed5t.jpg"),
    },

    {
      label: "Tipper 5 Ton",
      value: "TIPPER_5T",
      capacity: "Up to 5 tons",
      description:
        "Tipper vehicle designed for materials such as sand, gravel and aggregates.",
      image: require("../../../assets/maxiCategories/tipper5t.jpg"),
    },

    {
      label: "Refrigerated 5 Ton",
      value: "REFRIGERATED_5T",
      capacity: "Up to 5 tons",
      description:
        "Temperature-controlled cargo vehicle for goods requiring refrigeration.",
      image: require("../../../assets/maxiCategories/refrigerated5t.jpg"),
    },
  ];

  const selectedMaxiVehicle = useMemo(
    () => maxiClasses.find((item) => item.value === vehicleClass) || null,
    [vehicleClass],
  );

  const handleTransportationTypeChange = (value) => {
    setTransportationType(value);

    /*
     * Clear the vehicle class when switching transportation categories.
     * This prevents a previously selected MAXI/MOTO class from remaining
     * attached to a different transportation type.
     */
    if (value !== transportationType) {
      setVehicleClass("");
    }
  };

  const handleMaxiClassSelect = (value) => {
    setVehicleClass(value);
  };

  const handleInfoPress = (description) => {
    Alert.alert("Transportation Type Details", description);
  };

  const pickImages = async () => {
    if (maxiImages.length >= 3) {
      Alert.alert(
        "Maximum Photos Reached",
        "You have already uploaded the maximum number of vehicle photos.",
      );
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photos so you can upload vehicle images.",
      );
      return;
    }

    const remainingSlots = 3 - maxiImages.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const selectedImages = result.assets || [];

    if (selectedImages.length === 0) {
      return;
    }

    const imageUris = selectedImages.map((asset) => asset.uri);

    const updatedImages = [...maxiImages, ...imageUris].slice(0, 3);

    setMaxiImages(updatedImages);
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = maxiImages.filter(
      (_, index) => index !== indexToRemove,
    );

    setMaxiImages(updatedImages);
  };

  return (
    <View style={styles.container}>
      {/* =========================================================
          TRANSPORTATION CATEGORY
      ========================================================= */}
      <View style={styles.categoryGroup}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryHeaderIcon}>
            <AntDesign
              name="car"
              size={18}
              color={isDark ? "#F5F7FA" : "#171A1F"}
            />
          </View>

          <View style={styles.categoryHeaderCopy}>
            <Text style={styles.categoryTitle}>Transportation Type</Text>

            <Text style={styles.categoryDescription}>
              Select the type of vehicle you use for deliveries.
            </Text>
          </View>
        </View>

        <Dropdown
          style={[styles.dropdown, categoryFocused && styles.dropdownFocused]}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          itemContainerStyle={styles.dropdownItem}
          data={transportationTypes}
          labelField="label"
          valueField="value"
          placeholder="Select transportation type"
          value={transportationType}
          onFocus={() => setCategoryFocused(true)}
          onBlur={() => setCategoryFocused(false)}
          onChange={(item) => {
            setCategoryFocused(false);
            handleTransportationTypeChange(item.value);
          }}
          renderItem={(item) => (
            <View style={styles.dropdownItemCopy}>
              <Text style={styles.itemLabel}>{item.label}</Text>

              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          )}
          renderRightIcon={() => (
            <AntDesign
              name={categoryFocused ? "up" : "down"}
              size={14}
              color={isDark ? "#A7B0BC" : "#626C78"}
            />
          )}
        />
      </View>

      {/* =========================================================
          MOTO
      ========================================================= */}
      {transportationType === "MOTO" && (
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <View style={styles.detailIcon}>
              <AntDesign
                name="dashboard"
                size={17}
                color={isDark ? "#F5F7FA" : "#171A1F"}
              />
            </View>

            <View style={styles.detailHeaderCopy}>
              <Text style={styles.detailTitle}>Motorcycle Details</Text>

              <Text style={styles.detailSubtitle}>
                Tell us about the motorcycle you use for deliveries.
              </Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.inputLabel}>Vehicle Class</Text>

            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              itemContainerStyle={styles.dropdownItem}
              data={motoClasses}
              labelField="label"
              valueField="value"
              placeholder="Select vehicle class"
              value={vehicleClass}
              onChange={(item) => setVehicleClass(item.value)}
              renderItem={(item) => (
                <View style={styles.dropdownItemCopy}>
                  <Text style={styles.itemLabel}>{item.label}</Text>

                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              )}
            />

            <Text style={styles.inputLabel}>Model</Text>

            <TextInput
              style={[styles.input, modelFocused && styles.inputFocused]}
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Honda CG 125"
              placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              onFocus={() => setModelFocused(true)}
              onBlur={() => setModelFocused(false)}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Colour</Text>

            <TextInput
              style={[styles.input, colourFocused && styles.inputFocused]}
              value={vehicleColour}
              onChangeText={setVehicleColour}
              placeholder="e.g. Black"
              placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              onFocus={() => setColourFocused(true)}
              onBlur={() => setColourFocused(false)}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Plate Number</Text>

            <TextInput
              style={[styles.input, plateFocused && styles.inputFocused]}
              value={plateNumber}
              onChangeText={setPlateNumber}
              placeholder="e.g. ABC 123 XY"
              placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              onFocus={() => setPlateFocused(true)}
              onBlur={() => setPlateFocused(false)}
              autoCapitalize="characters"
            />
          </View>
        </View>
      )}

      {/* =========================================================
          MAXI
      ========================================================= */}
      {transportationType === "MAXI" && (
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <View style={styles.detailIcon}>
              <AntDesign
                name="car"
                size={17}
                color={isDark ? "#F5F7FA" : "#171A1F"}
              />
            </View>

            <View style={styles.detailHeaderCopy}>
              <Text style={styles.detailTitle}>Vehicle Details</Text>

              <Text style={styles.detailSubtitle}>
                Choose the vehicle category that best matches your vehicle.
              </Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            {/* =====================================================
                MAXI VEHICLE SELECTION INTRO
            ===================================================== */}
            <View style={styles.vehicleSelectionIntro}>
              <View style={styles.vehicleSelectionIntroIcon}>
                <AntDesign
                  name="picture"
                  size={17}
                  color={isDark ? "#F5F7FA" : "#171A1F"}
                />
              </View>

              <View style={styles.vehicleSelectionIntroCopy}>
                <Text style={styles.vehicleSelectionTitle}>
                  Identify your vehicle
                </Text>

                <Text style={styles.vehicleSelectionSubtitle}>
                  Choose the vehicle that looks most like yours. The images
                  below are reference examples only.
                </Text>
              </View>
            </View>

            {/* =====================================================
                MAXI VEHICLE VISUAL GRID
            ===================================================== */}
            <View style={styles.maxiVehicleGrid}>
              {maxiClasses.map((item) => {
                const isSelected = vehicleClass === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.85}
                    onPress={() => handleMaxiClassSelect(item.value)}
                    style={[
                      styles.maxiVehicleCard,
                      isSelected && styles.maxiVehicleCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.maxiVehicleImageWrapper,
                        isSelected && styles.maxiVehicleImageWrapperSelected,
                      ]}
                    >
                      <Image
                        source={item.image}
                        style={styles.maxiVehicleImage}
                        resizeMode="contain"
                      />

                      {isSelected && (
                        <View style={styles.maxiVehicleSelectedBadge}>
                          <AntDesign name="check" size={13} color="#FFFFFF" />
                        </View>
                      )}
                    </View>

                    <View style={styles.maxiVehicleCardContent}>
                      <Text
                        style={[
                          styles.maxiVehicleCardTitle,
                          isSelected && styles.maxiVehicleCardTitleSelected,
                        ]}
                      >
                        {item.label}
                      </Text>

                      <Text
                        style={styles.maxiVehicleCardCapacity}
                        numberOfLines={1}
                      >
                        {item.capacity}
                      </Text>

                      <Text style={styles.maxiVehicleCardDescription}>
                        {item.description}
                      </Text>

                      <View
                        style={[
                          styles.maxiVehicleSelectionIndicator,
                          isSelected &&
                            styles.maxiVehicleSelectionIndicatorSelected,
                        ]}
                      >
                        {isSelected && (
                          <View style={styles.maxiVehicleSelectionDot} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* =====================================================
                SELECTED VEHICLE SUMMARY
            ===================================================== */}
            {selectedMaxiVehicle && (
              <View style={styles.selectedVehicleSummary}>
                <View style={styles.selectedVehicleSummaryIcon}>
                  <Image
                    source={selectedMaxiVehicle.image}
                    style={styles.selectedVehicleSummaryImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.selectedVehicleSummaryCopy}>
                  <Text style={styles.selectedVehicleSummaryLabel}>
                    Selected vehicle
                  </Text>

                  <Text style={styles.selectedVehicleSummaryValue}>
                    {selectedMaxiVehicle.label}
                  </Text>

                  <Text style={styles.selectedVehicleSummaryDescription}>
                    {selectedMaxiVehicle.capacity}
                  </Text>
                </View>
              </View>
            )}

            {/* =====================================================
                VEHICLE INFORMATION
            ===================================================== */}
            <View style={styles.vehicleInformationDivider} />

            <View style={styles.vehicleInformationHeading}>
              <Text style={styles.vehicleInformationHeading}>
                Vehicle information
              </Text>
            </View>

            <Text style={styles.inputLabel}>Model</Text>

            <TextInput
              style={[styles.input, modelFocused && styles.inputFocused]}
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Toyota Hilux"
              placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              onFocus={() => setModelFocused(true)}
              onBlur={() => setModelFocused(false)}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Colour</Text>

            <TextInput
              style={[styles.input, colourFocused && styles.inputFocused]}
              value={vehicleColour}
              onChangeText={setVehicleColour}
              placeholder="e.g. White"
              placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              onFocus={() => setColourFocused(true)}
              onBlur={() => setColourFocused(false)}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Plate Number</Text>

            <TextInput
              style={[styles.input, plateFocused && styles.inputFocused]}
              value={plateNumber}
              onChangeText={setPlateNumber}
              placeholder="e.g. ABC 123 XY"
              placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              onFocus={() => setPlateFocused(true)}
              onBlur={() => setPlateFocused(false)}
              autoCapitalize="characters"
            />

            {/* =====================================================
                CAPACITY / DESCRIPTION
            ===================================================== */}
            <Text style={styles.inputLabel}>
              Vehicle Capacity / Description
            </Text>

            <TextInput
              style={[
                styles.descriptionInput,
                descriptionFocused && styles.inputFocused,
              ]}
              value={maxiDescription}
              onChangeText={setMaxiDescription}
              placeholder="Describe your vehicle, its capacity, or anything useful about it..."
              placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
              multiline
              textAlignVertical="top"
            />

            {/* =====================================================
                ACTUAL VEHICLE PHOTOS
            ===================================================== */}
            <View style={styles.photoSection}>
              <View style={styles.photoHeader}>
                <View style={styles.photoHeaderCopy}>
                  <Text style={styles.photoTitle}>Your Vehicle Photos</Text>

                  <Text style={styles.photoSubtitle}>
                    Upload clear photos of your actual vehicle.
                  </Text>
                </View>

                <View style={styles.photoCount}>
                  <Text style={styles.photoCountText}>
                    {maxiImages.length}/3
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.photoButton}
                onPress={pickImages}
                disabled={maxiImages.length >= 3}
              >
                <View style={styles.photoButtonIcon}>
                  <AntDesign
                    name="camera"
                    size={20}
                    color={isDark ? "#F5F7FA" : "#171A1F"}
                  />
                </View>

                <View style={styles.photoButtonCopy}>
                  <Text style={styles.photoButtonText}>
                    {maxiImages.length >= 3
                      ? "All photos uploaded"
                      : "Add vehicle photos"}
                  </Text>

                  <Text style={styles.photoButtonSubtext}>
                    {maxiImages.length >= 3
                      ? "You have uploaded the required photos."
                      : "Add up to 3 clear photos of your vehicle."}
                  </Text>
                </View>

                {maxiImages.length < 3 && (
                  <AntDesign
                    name="right"
                    size={16}
                    color={isDark ? "#A7B0BC" : "#626C78"}
                  />
                )}
              </TouchableOpacity>

              {maxiImages.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  {maxiImages.map((uri, index) => (
                    <View
                      key={`${uri}-${index}`}
                      style={styles.previewImageWrapper}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />

                      <View style={styles.previewImageNumber}>
                        <Text style={styles.previewImageNumberText}>
                          {index + 1}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => removeImage(index)}
                        style={styles.previewImageRemove}
                      >
                        <AntDesign name="close" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
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
