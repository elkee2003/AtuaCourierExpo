import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native'
import React, {useState} from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import styles from './styles'
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Crypto from 'expo-crypto';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useProfileContext } from '../../../../providers/ProfileProvider'
import { useAuthContext } from '../../../../providers/AuthProvider';
import { DataStore } from 'aws-amplify/datastore';
import {Courier} from '../../../../src/models'

const StandaloneTtypeCom = () => {

  const {transportationType, setTransportationType, vehicleType, setVehicleType, model, setModel, plateNumber, setPlateNumber, images, setImages, errorMessage,validatVehicleInfo} = useProfileContext()
  const {dbUser, setDbUser} = useAuthContext()

  const [isFocus, setIsFocus] = useState(false);

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

  const pickImages = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {

      if(result.assets.length < 3){
        Alert.alert('Error', 'Please select at least 3 images');
        return;
      }

      const selectedImages = result.assets.map((asset)=>asset.uri)
      setImages(selectedImages);
    }
  };


  const updateTransportType = async () => {

    if (!validatVehicleInfo()) {
      Alert.alert('Error', errorMessage); // Display the validation error message
      return;
    }

    try{
      const transportType = await DataStore.save(Courier.copyOf(dbUser, (updated)=>{
         
        updated.transportationType = transportationType
        updated.transportationType = transportationType;
        updated.vehicleType = vehicleType;
        updated.model = model;
        updated.plateNumber = plateNumber;
        updated.maxiImages = images;
      }))
      setDbUser(transportType)
      Alert.alert('Successful', 'Changed Successfully')
      router.push('/profile')

    }catch(e){
      Alert.alert('Error', e.message)
    } 
  }

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Transportation Type</Text>

      <Text style={styles.subHeader}>Selected Transportation Type:</Text>
      <Text style={styles.selectTransportTypeTxt}>{transportationType}</Text>
      <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: '#0f238a' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={transportData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select transportation type' : '...'}
          searchPlaceholder="Search..."
          value={transportationType}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
              setTransportationType(item.value);
              setIsFocus(false);
          }}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              {/* Transportation Label */}
              <Text style={styles.itemLabel}>{item.label}</Text>
  
              {/* Info Icon next to each label */}
              <TouchableOpacity onPress={() => handleInfoPress(item.description)}>
                <AntDesign name="infocirlceo" size={20} color="gray" style={styles.infoIcon} />
              </TouchableOpacity>
            </View>
          )}
      />

      {/* Moto */}
      {(transportationType === "Moto") && (
        <>
          <TextInput
          style={styles.input}
          value={vehicleType}
          onChangeText={setVehicleType}
          placeholder='Vehicle type eg: Car, Bike, Cooling Van etc'
          />
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder='Vehicle model eg: Audi, Toyota, etc'
          />
          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder='Plate Number eg: RIV-90909'
          />
        </>
      )}

      {/* Maxi */}
      {(transportationType === 'Maxi') && (
        <>
          <TextInput
          style={styles.input}
          value={vehicleType}
          onChangeText={setVehicleType}
          placeholder='Vehicle type eg: Car, Bike, Cooling Van etc'
          />
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder='Eg: Moving Van, Pickup Van, Cooling Van'
          />
          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder='Plate Number eg: RIV-90909'
          />
          <TouchableOpacity style={styles.addPhotoCon} onPress={pickImages}>
            <Text style={styles.addPhotoTxt}>Add Photos</Text>
            {/* <AntDesign name="pluscircle" style={styles.plusIconBtn} /> */}
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.error}>{errorMessage}</Text>

      <TouchableOpacity style={styles.btnCon} onPress={updateTransportType}>
        <Text style={styles.btnTxt}>Change</Text>
      </TouchableOpacity>
    </View>
  )
}

export default StandaloneTtypeCom