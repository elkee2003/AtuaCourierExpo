import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

import styles from "./styles";

import { useAuthContext } from "../../../../providers/AuthProvider";
import { useProfileContext } from "../../../../providers/ProfileProvider";

import { DataStore } from "aws-amplify/datastore";
import { getUrl, remove, uploadData } from "aws-amplify/storage";
import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";
import { Courier } from "../../../../src/models";

const StandaloneTtypeCom = () => {
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
    errorMessage,
    validateVehicleInfo,
  } = useProfileContext();

  const { dbCourier, setDbCourier, sub } = useAuthContext();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [saving, setSaving] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [signedMaxiImages, setSignedMaxiImages] = useState([]);
  const [localMaxiImages, setLocalMaxiImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const displayImages =
    localMaxiImages.length > 0
      ? localMaxiImages
      : signedMaxiImages.length > 0
        ? signedMaxiImages
        : [];

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
        "This transportation method is suitable for faster, mid-sized deliveries that require speed and distance. This includes Motorcycles.",
    },
    {
      label: "Maxi",
      value: "MAXI",
      description:
        "This transportation method is best for large or bulky items that need spacious transport. This option includes Cars, Mini buses Vans, Moving Trucks, Large Cargo vehicles.",
    },
  ];

  const maxiClasses = [
    {
      label: "Car",
      value: "CAR",
      capacity: "Passenger car",
      description: "Suitable for smaller packages and lighter deliveries.",
      image: require("../../../../assets/maxiCategories/car.jpg"),
    },
    {
      label: "Wagon",
      value: "WAGON",
      capacity: "Larger cargo space",
      description: "A car-style vehicle with additional rear cargo space.",
      image: require("../../../../assets/maxiCategories/wagon.jpg"),
    },
    {
      label: "Minibus",
      value: "MINIBUS",
      capacity: "Multi-purpose cargo space",
      description:
        "Suitable for larger items and deliveries requiring more interior space.",
      image: require("../../../../assets/maxiCategories/minibus.jpg"),
    },
    {
      label: "Pickup",
      value: "PICKUP",
      capacity: "Open cargo bed",
      description:
        "Suitable for bulky items and goods that can be transported in an open cargo bed.",
      image: require("../../../../assets/maxiCategories/pickup.jpg"),
    },
    {
      label: "Small Van",
      value: "SMALL_VAN",
      capacity: "1–1.5 tons",
      description: "Small commercial vans for lighter cargo loads.",
      image: require("../../../../assets/maxiCategories/smallvan.jpg"),
    },
    {
      label: "Medium Van",
      value: "MEDIUM_VAN",
      capacity: "2–3 tons",
      description: "Medium commercial vans for larger cargo loads.",
      image: require("../../../../assets/maxiCategories/mediumvan.jpg"),
    },
    {
      label: "Large Van",
      value: "LARGE_VAN",
      capacity: "3–5 tons",
      description:
        "Large commercial vans designed for bulky and heavier cargo.",
      image: require("../../../../assets/maxiCategories/largevan.jpg"),
    },
    {
      label: "5 Ton Truck",
      value: "TRUCK_5T",
      capacity: "Up to 5 tons",
      description: "Medium-duty truck suitable for heavier commercial cargo.",
      image: require("../../../../assets/maxiCategories/truck5t.jpg"),
    },
    {
      label: "10 Ton Truck",
      value: "TRUCK_10T",
      capacity: "Up to 10 tons",
      description: "Heavy-duty truck for large commercial cargo loads.",
      image: require("../../../../assets/maxiCategories/truck10t.jpg"),
    },
    {
      label: "Flatbed 5 Ton",
      value: "FLATBED_5T",
      capacity: "Up to 5 tons",
      description:
        "Open flatbed vehicle for bulky, oversized or difficult-to-load cargo.",
      image: require("../../../../assets/maxiCategories/flatbed5t.jpg"),
    },
    {
      label: "Tipper 5 Ton",
      value: "TIPPER_5T",
      capacity: "Up to 5 tons",
      description:
        "Tipper vehicle designed for materials such as sand, gravel and aggregates.",
      image: require("../../../../assets/maxiCategories/tipper5t.jpg"),
    },
    {
      label: "Refrigerated 5 Ton",
      value: "REFRIGERATED_5T",
      capacity: "Up to 5 tons",
      description:
        "Temperature-controlled cargo vehicle for goods requiring refrigeration.",
      image: require("../../../../assets/maxiCategories/refrigerated5t.jpg"),
    },
  ];

  const selectedMaxiVehicle =
    maxiClasses.find((item) => item.value === vehicleClass) || null;

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    if (!result.assets || result.assets.length < 3) {
      Alert.alert("Error", "Please select at least 3 images");
      return;
    }

    const selectedUris = result.assets.map((asset) => asset.uri);

    setLocalMaxiImages(selectedUris);
    setMaxiImages(selectedUris);
  };

  const uploadImagesToS3 = async (images) => {
    if (!images || images.length === 0) {
      return [];
    }

    const uploadedPaths = [];

    for (const image of images) {
      if (image.startsWith("public/")) {
        uploadedPaths.push(image);
        continue;
      }

      if (image.startsWith("http")) {
        uploadedPaths.push(image);
        continue;
      }

      const manipulated = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 600 } }],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      const response = await fetch(manipulated.uri);
      const blob = await response.blob();

      const path = `public/maxiImages/${sub}/${Crypto.randomUUID()}.jpg`;

      await uploadData({
        path,
        data: blob,
        options: {
          contentType: "image/jpeg",
        },
      }).result;

      uploadedPaths.push(path);
    }

    if (dbCourier?.maxiImages?.length) {
      const oldImages = dbCourier.maxiImages;

      for (const oldImage of oldImages) {
        if (!uploadedPaths.includes(oldImage)) {
          try {
            await remove({ path: oldImage });
          } catch (error) {
            console.log("Failed to remove old image:", error);
          }
        }
      }
    }

    return uploadedPaths;
  };

  const updateTransportType = async () => {
    const validationError = validateVehicleInfo();

    if (validationError) {
      return;
    }

    try {
      setSaving(true);

      let uploadedMaxiImages = [];

      if (transportationType === "MAXI") {
        uploadedMaxiImages = await uploadImagesToS3(maxiImages);
      } else if (dbCourier?.maxiImages?.length) {
        for (const oldImage of dbCourier.maxiImages) {
          try {
            await remove({ path: oldImage });
          } catch (error) {
            console.log("Failed to remove old MAXI image:", error);
          }
        }
      }

      if (!dbCourier?.id) {
        Alert.alert("Error", "Courier profile could not be found.");
        return;
      }

      const updatedCourier = await DataStore.save(
        Courier.copyOf(dbCourier, (updated) => {
          updated.transportationType = transportationType;

          if (transportationType === "MOTO") {
            updated.vehicleClass = "MOTORCYCLE";
            updated.model = model;
            updated.vehicleColour = vehicleColour;
            updated.plateNumber = plateNumber;
          } else if (transportationType === "MAXI") {
            updated.vehicleClass = vehicleClass;
            updated.model = model;
            updated.vehicleColour = vehicleColour;
            updated.plateNumber = plateNumber;
            updated.maxiDescription = maxiDescription;
            updated.maxiImages = uploadedMaxiImages;
          } else {
            updated.vehicleClass = null;
            updated.model = null;
            updated.vehicleColour = null;
            updated.plateNumber = null;
            updated.maxiDescription = null;
            updated.maxiImages = [];
          }
        }),
      );

      setDbCourier(updatedCourier);

      if (transportationType !== "MAXI") {
        setMaxiImages([]);
        setLocalMaxiImages([]);
        setSignedMaxiImages([]);
        setMaxiDescription("");
      } else {
        setMaxiImages(uploadedMaxiImages);
      }

      Alert.alert("Success", "Your transportation details have been updated.", [
        {
          text: "OK",
          onPress: () => router.replace("/profile"),
        },
      ]);
    } catch (error) {
      console.error("Failed to update transportation:", error);

      Alert.alert(
        "Error",
        "Unable to update your transportation details. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!dbCourier) return;

    setTransportationType(dbCourier.transportationType || "");
    setVehicleClass(dbCourier.vehicleClass || "");
    setModel(dbCourier.model || "");
    setVehicleColour(dbCourier.vehicleColour || "");
    setPlateNumber(dbCourier.plateNumber || "");
    setMaxiDescription(dbCourier.maxiDescription || "");

    if (dbCourier.transportationType !== "MAXI") {
      setSignedMaxiImages([]);
      return;
    }

    const loadImages = async () => {
      try {
        setLoadingImages(true);

        const images = dbCourier.maxiImages || [];

        if (images.length === 0) {
          setSignedMaxiImages([]);
          return;
        }

        const signedUrls = await Promise.all(
          images.map(async (path) => {
            try {
              if (path.startsWith("file://")) {
                return path;
              }

              if (path.startsWith("http")) {
                return path;
              }

              const result = await getUrl({
                path,
                options: {
                  expiresIn: 3600,
                },
              });

              return result.url.toString();
            } catch (error) {
              console.log("Failed to load image:", error);
              return null;
            }
          }),
        );

        setSignedMaxiImages(signedUrls.filter(Boolean));
      } catch (error) {
        console.log("Failed to load MAXI images:", error);
        setSignedMaxiImages([]);
      } finally {
        setLoadingImages(false);
      }
    };

    loadImages();
  }, [dbCourier]);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBlock}>
            <Text style={styles.header}>Update Transportation</Text>

            <Text style={styles.headerSubtitle}>
              Keep your vehicle information up to date so customers can see
              accurate delivery capabilities.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transportation type</Text>

            <Text style={styles.sectionSubtitle}>
              Select the type of transportation you use for deliveries.
            </Text>

            <Dropdown
              style={[styles.dropdown, isFocus && styles.dropdownFocused]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemContainerStyle={styles.dropdownItemContainer}
              itemTextStyle={styles.dropdownItemText}
              activeColor={isDark ? "#1D252F" : "#F3F5F7"}
              data={transportData}
              labelField="label"
              valueField="value"
              placeholder="Select transportation type"
              value={transportationType}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setTransportationType(item.value);
                setIsFocus(false);
              }}
              renderItem={(item) => (
                <View style={styles.dropdownItem}>
                  <View style={styles.dropdownItemCopy}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>

                  <AntDesign
                    name="info-circle"
                    size={17}
                    color={isDark ? "#A7B0BC" : "#7A838E"}
                    onPress={() => Alert.alert(item.label, item.description)}
                  />
                </View>
              )}
            />
          </View>

          {transportationType === "MOTO" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle information</Text>

              <Text style={styles.label}>Vehicle Class</Text>

              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.dropdownItemText}
                activeColor={isDark ? "#1D252F" : "#F3F5F7"}
                data={[
                  {
                    label: "Motorcycle",
                    value: "MOTORCYCLE",
                  },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select vehicle class"
                value={vehicleClass}
                onChange={(item) => setVehicleClass(item.value)}
              />

              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="Vehicle Model"
                placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              />

              <TextInput
                style={styles.input}
                value={vehicleColour}
                onChangeText={setVehicleColour}
                placeholder="Vehicle Colour (e.g. Red)"
                placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
              />

              <TextInput
                style={styles.input}
                value={plateNumber}
                onChangeText={setPlateNumber}
                placeholder="Plate Number"
                placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
                autoCapitalize="characters"
              />
            </View>
          )}

          {transportationType === "MAXI" && (
            <View style={styles.section}>
              <View style={styles.maxiIntro}>
                <Text style={styles.sectionTitle}>
                  Choose your vehicle type
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Select the category that best matches your vehicle. The
                  reference images are examples to help you identify the right
                  class.
                </Text>
              </View>

              <View style={styles.maxiVehicleGrid}>
                {maxiClasses.map((item) => {
                  const selected = vehicleClass === item.value;

                  return (
                    <TouchableOpacity
                      key={item.value}
                      activeOpacity={0.86}
                      style={[
                        styles.maxiVehicleCard,
                        selected && styles.maxiVehicleCardSelected,
                      ]}
                      onPress={() => setVehicleClass(item.value)}
                    >
                      <View style={styles.maxiVehicleImageWrapper}>
                        <Image
                          source={item.image}
                          style={styles.maxiVehicleImage}
                          resizeMode="contain"
                        />

                        {selected && (
                          <View style={styles.maxiSelectedBadge}>
                            <AntDesign name="check" size={13} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      <View style={styles.maxiVehicleCopy}>
                        <Text style={styles.maxiVehicleTitle} numberOfLines={2}>
                          {item.label}
                        </Text>

                        <Text style={styles.maxiVehicleCapacity}>
                          {item.capacity}
                        </Text>

                        <Text style={styles.maxiVehicleDescription}>
                          {item.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

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

              <View style={styles.vehicleInformationBlock}>
                <Text style={styles.sectionTitle}>Vehicle information</Text>

                <TextInput
                  style={styles.input}
                  value={model}
                  onChangeText={setModel}
                  placeholder="Vehicle Model"
                  placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
                />

                <TextInput
                  style={styles.input}
                  value={vehicleColour}
                  onChangeText={setVehicleColour}
                  placeholder="Vehicle Colour (e.g. White)"
                  placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
                />

                <TextInput
                  style={styles.input}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholder="Plate Number"
                  placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
                  autoCapitalize="characters"
                />

                <TextInput
                  style={styles.descriptionInput}
                  value={maxiDescription}
                  onChangeText={setMaxiDescription}
                  multiline
                  textAlignVertical="top"
                  placeholder="Describe the capacity of your vehicle and give examples of what it can carry."
                  placeholderTextColor={isDark ? "#8A95A2" : "#8A9099"}
                />
              </View>

              <View style={styles.photoSection}>
                <Text style={styles.photoSectionTitle}>Vehicle photos</Text>

                <Text style={styles.photoSectionSubtitle}>
                  Upload at least 3 clear photos of your actual vehicle.
                </Text>

                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={pickImages}
                  activeOpacity={0.85}
                >
                  <AntDesign
                    name="camera"
                    size={18}
                    color={isDark ? "#F5F7FA" : "#171A1F"}
                  />

                  <Text style={styles.photoButtonText}>
                    {displayImages.length > 0
                      ? "Replace Vehicle Photos"
                      : "Upload Vehicle Photos"}
                  </Text>
                </TouchableOpacity>

                {loadingImages && (
                  <Text style={styles.loadingImagesText}>
                    Loading current vehicle photos...
                  </Text>
                )}

                {displayImages.length > 0 && (
                  <>
                    <Text style={styles.savedImagesTitle}>
                      Current Vehicle Photos
                    </Text>

                    <View style={styles.imageGrid}>
                      {displayImages.map((uri, index) => (
                        <View key={`${uri}-${index}`} style={styles.imageItem}>
                          <Image source={{ uri }} style={styles.previewImage} />

                          <View style={styles.imageNumberBadge}>
                            <Text style={styles.imageNumberText}>
                              {index + 1}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={updateTransportType}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StandaloneTtypeCom;
