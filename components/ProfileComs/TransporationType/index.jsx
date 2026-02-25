import { View, Text, Alert, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import * as ImagePicker from 'expo-image-picker'
import AntDesign from '@expo/vector-icons/AntDesign';
import styles from './styles'
import { useProfileContext } from '../../../providers/ProfileProvider'

const TransportationTypeCom = () => {

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
  } = useProfileContext()

  const [isFocus, setIsFocus] = useState(false)

  /* ---------------- Transportation Categories ---------------- */

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


  /* ---------------- Controlled Vehicle Classes ---------------- */

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

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (!result.canceled) {
      if (result.assets.length < 3) {
        Alert.alert('Error', 'Please select at least 3 images')
        return
      }

      const selectedImages = result.assets.map(asset => asset.uri)
      setMaxiImages(selectedImages)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Transportation Dropdown */}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: '#0F2D7A' }]}
        data={transportData}
        labelField="label"
        valueField="value"
        placeholder="Select category"
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

      {/* ---------------- MOTO ---------------- */}
      {transportationType === 'Moto' && (
        <>
          <Text style={styles.sectionSubtitle}>Vehicle Class</Text>
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
            placeholder="Vehicle Model (e.g. Toyota Corolla)"
          />

          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="Plate Number"
          />
        </>
      )}

      {/* ---------------- MAXI ---------------- */}
      {transportationType === 'Maxi' && (
        <>
          <Text style={styles.sectionSubtitle}>Vehicle Class</Text>
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

          <TouchableOpacity style={styles.photoButton} onPress={pickImages}>
            <AntDesign name="camera" size={18} color="#fff" />
            <Text style={styles.photoButtonText}>Upload Vehicle Photos</Text>
          </TouchableOpacity>

          {maxiImages?.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {maxiImages.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.previewImage}
                />
              ))}
            </View>
          )}
        </>
      )}

    </ScrollView>
  )
}

export default TransportationTypeCom