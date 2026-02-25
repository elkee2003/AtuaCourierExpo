import {
  View, Text, TextInput, Alert, TouchableOpacity, ScrollView, Image
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import AntDesign from '@expo/vector-icons/AntDesign'
import * as ImagePicker from 'expo-image-picker'
import styles from './styles'
import { router } from 'expo-router'

import { useProfileContext } from '../../../../providers/ProfileProvider'
import { useAuthContext } from '../../../../providers/AuthProvider'

import { DataStore } from 'aws-amplify/datastore'
import { Courier } from '../../../../src/models'
import * as ImageManipulator from 'expo-image-manipulator'
import { uploadData, getUrl, remove } from 'aws-amplify/storage'
import * as Crypto from 'expo-crypto'

const StandaloneTtypeCom = () => {

  const {
    transportationType,
    setTransportationType,
    vehicleClass,
    setVehicleClass,
    model,
    setModel,
    plateNumber,
    setPlateNumber,
    maxiImages,
    setMaxiImages,
    errorMessage,
    validatVehicleInfo
  } = useProfileContext()

  const { dbUser, setDbUser, sub } = useAuthContext()

  const [isFocus, setIsFocus] = useState(false)

  // signed S3 images
  const [signedMaxiImages, setSignedMaxiImages] = useState([])

  // local images picked by user
  const [localMaxiImages, setLocalMaxiImages] = useState([])

  const [loadingImages, setLoadingImages] = useState(false)

  // decide what to display
  const displayImages =
    localMaxiImages.length > 0
      ? localMaxiImages
      : signedMaxiImages.length > 0
        ? signedMaxiImages
        : []

  /* ------------------ TRANSPORT TYPES ------------------ */

  const transportData = [
      { label: 'Micro', 
        value: 'Micro', 
        description: 'This transportation method option includes eco-friendly transport methods such as Bicycles, Scooters, Skates for quick, short-distance deliveries.' },
      { label: 'Moto', 
        value: 'Moto', 
        description: 'This transportation method is suitable for faster, mid-sized deliveries that require speed and distance. This option includes Motorcycles, Mopeds, Car.' },
      { label: 'Maxi', 
        value: 'Maxi', 
        description: 'This transportation method is best for large or bulky items that need spacious transport. This option includes Vans, Moving Trucks, Large Cargo vehicles' },
      
  ]

  // Function to handle icon press and show alert with description
  const handleInfoPress = (description) => {
    Alert.alert('Transportation Type Details', description);
  };

  const motoClasses = [
    { label: 'Motorcycle', value: 'Motorcycle' },
    // { label: 'Car (Sedan)', value: 'Car_Sedan' },
    // { label: 'Car (SUV)', value: 'Car_SUV' },
  ]

  const maxiClasses = [
    { label: 'Small Van (1-1.5 Tons)', value: 'Small_Van' },
    { label: 'Medium Van (2-3 Tons)', value: 'Medium_Van' },
    { label: 'Large Van (3-5 Tons)', value: 'Large_Van' },

    { label: '5 Ton Truck', value: 'Truck_5T' },
    { label: '10 Ton Truck', value: 'Truck_10T' },
    // { label: '20 Ton Truck', value: 'Truck_20T' },
    
    { label: 'Flatbed 5 Ton', value: 'FLATBED_5T' },
    { label: 'Flatbed 10 Ton', value: 'FLATBED_10T' },
    // { label: 'Flatbed 20 Ton', value: 'FLATBED_20T' },

    { label: 'Tipper 5 Ton (Sand/Gravel)', value: 'TIPPER_5T' },
    { label: 'Tipper 10 Ton (Sand/Gravel)', value: 'TIPPER_10T' },
    // { label: 'Tipper 20 Ton (Sand/Gravel)', value: 'TIPPER_20T' },

    { label: 'Refrigerated 5 Ton', value: 'REFRIGERATED_5T' },
    { label: 'Refrigerated 10 Ton', value: 'REFRIGERATED_10T' },
  ]

  /* ------------------ IMAGE PICKER ------------------ */

  const pickImages = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (result.canceled) return

    if (!result.assets || result.assets.length < 3) {

      Alert.alert('Error', 'Please select at least 3 images')
      return

    }

    const selectedUris = result.assets.map(asset => asset.uri)

    // local preview
    setLocalMaxiImages(selectedUris)

    // save to context for upload later
    setMaxiImages(selectedUris)
  }

  // Function to upload Image to S3 Bucket
  const uploadImagesToS3 = async () => {
    try {
      if (!maxiImages || maxiImages.length === 0) {
        return dbUser?.maxiImages || []
      }

      const uploadedPaths = []

      for (const item of maxiImages) {
        const localUri =
          typeof item === "string"
            ? item
            : item?.uri

        if (!localUri) continue

        // ✅ Already uploaded → keep it
        if (localUri.startsWith("public/")) {
          uploadedPaths.push(localUri)
          continue
        }

        // ✅ Upload only local images
        if (localUri.startsWith("file://")) {
          // Compress image
          const manipulatedImage =
            await ImageManipulator.manipulateAsync(
              localUri,
              [{ resize: { width: 600 } }],
              {
                compress: 0.6,
                format: ImageManipulator.SaveFormat.JPEG
              }
            )
          const response = await fetch(manipulatedImage.uri)
          const blob = await response.blob()

          const fileKey =
            `public/maxiImages/${sub}/${Crypto.randomUUID()}.jpg`

          const result = await uploadData({

            path: fileKey,
            data: blob,

            options: {
              contentType: "image/jpeg",
            },
          }).result
          uploadedPaths.push(result.path)
        }
      }

      // ✅ Delete removed images from S3
      if (dbUser?.maxiImages?.length) {
        const removedImages =
          dbUser.maxiImages.filter(
            oldPath => !uploadedPaths.includes(oldPath)
          )
        await Promise.all(
          removedImages.map(path =>
            remove({ path }).catch(() => {})
          )
        )
      }
      return uploadedPaths
    } catch (err) {

      console.log("Error uploading maxi images:", err)

      Alert.alert(
        "Upload Error",
        "Failed to upload vehicle images."
      )
      throw err
    }
  }

  /* ------------------ UPDATE ------------------ */

  const updateTransportType = async () => {
    if (!validatVehicleInfo()) {
      Alert.alert('Error', errorMessage)
      return
    }

    try {
      let imagesToSave = dbUser?.maxiImages || []

      // Upload new images if selected
      if (transportationType === "Maxi" && localMaxiImages.length > 0) {
        Alert.alert("Uploading", "Uploading vehicle images...")
        imagesToSave = await uploadImagesToS3()
      }

      const updatedCourier = await DataStore.save(
        Courier.copyOf(dbUser, updated => {
          updated.transportationType = transportationType
          updated.vehicleClass = vehicleClass
          updated.model = model
          updated.plateNumber = plateNumber

          if (transportationType === "Maxi") {
            updated.maxiImages = imagesToSave
          } else {
            updated.maxiImages = []
          }
        })
      )

      setDbUser(updatedCourier)

      Alert.alert("Success", "Transport updated successfully")

      router.push('/profile')

    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Failed to update transport")
    }
  }


  /* ------------------ LOAD EXISTING IMAGES INTO CONTEXT ------------------ */

  useEffect(() => {

    if (dbUser?.maxiImages?.length) {
      if (localMaxiImages.length === 0) {
        setMaxiImages(dbUser?.maxiImages)
      }
    }

  }, [dbUser])

  /* ------------------ FETCH SIGNED URLS ------------------ */

  useEffect(() => {
    const fetchImages = async () => {
      if (transportationType !== 'Maxi') {
        setSignedMaxiImages([])
        return
      }

      if (!dbUser?.maxiImages?.length) {
        setSignedMaxiImages([])
        return
      }

      setLoadingImages(true)

      try {
        const urls = await Promise.all(
          dbUser.maxiImages.map(async key => {
            // already local
            if (key.startsWith("file://")) {
              return key
            }

            const result = await getUrl({
              path: key,
              options: { validateObjectExistence: true },
            })

            return result.url.toString()

          })

        )

        setSignedMaxiImages(urls)

      } catch (err) {
        console.log("Image load error:", err)
      } finally {
        setLoadingImages(false)
      }
    }

    fetchImages()

  }, [transportationType, dbUser])

  /* ------------------ UI ------------------ */

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >

      <Text style={styles.header}>
        Update Transportation
      </Text>

      {/* TRANSPORT TYPE */}

      <Text style={styles.label}>
        Transportation Type
      </Text>

      <Dropdown
        style={[
          styles.dropdown,
          isFocus && { borderColor: '#0F2D7A' }
        ]}
        data={transportData}
        labelField="label"
        valueField="value"
        placeholder="Select transportation type"
        value={transportationType}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {

          setTransportationType(item.value)
          setVehicleClass(null)
          setIsFocus(false)

        }}

        renderItem={(item) => (
          <View style={styles.dropdownItem}>
            {/* Transportation Label */}
            <Text style={styles.itemLabel}>{item.label}</Text>

            {/* Info Icon next to each label */}
            <TouchableOpacity onPress={() => handleInfoPress(item.description)}>
              <AntDesign name="info-circle" style={styles.infoIcon} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* MOTO */}

      {transportationType === 'Moto' && (

        <>
          <Text style={styles.label}>
            Vehicle Class
          </Text>

          <Dropdown
            style={styles.dropdown}
            data={motoClasses}
            labelField="label"
            valueField="value"
            placeholder="Select vehicle class"
            value={vehicleClass}
            onChange={item => setVehicleClass(item.value)}
          />

          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="Vehicle Model"
          />

          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="Plate Number"
          />
        </>

      )}

      {/* MAXI */}

      {transportationType === 'Maxi' && (

        <>

          <Text style={styles.label}>
            Vehicle Class
          </Text>

          <Dropdown
            style={styles.dropdown}
            data={maxiClasses}
            labelField="label"
            valueField="value"
            placeholder="Select vehicle class"
            value={vehicleClass}
            onChange={item => setVehicleClass(item.value)}
          />

          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="Vehicle Model"
          />

          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="Plate Number"
          />

          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickImages}
          >
            <AntDesign
              name="camera"
              size={18}
              color="#fff"
            />

            <Text style={styles.photoButtonText}>
              {displayImages.length > 0
                ? "Replace Vehicle Photos"
                : "Upload Vehicle Photos"}
            </Text>
          </TouchableOpacity>

          {displayImages.length > 0 && (
            <>
              <Text style={styles.savedImagesTitle}>
                Current Vehicle Photos
              </Text>

              <View style={styles.imageGrid}>
                {displayImages.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.previewImage}
                  />
                ))}
              </View>
            </>
          )}
        </>
      )}

      {errorMessage && (
        <Text style={styles.error}>
          {errorMessage}
        </Text>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={updateTransportType}
      >
        <Text style={styles.saveButtonText}>
          Save Changes
        </Text>
      </TouchableOpacity>

    </ScrollView>

  )
}

export default StandaloneTtypeCom
