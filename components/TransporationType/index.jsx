import { View, Text, Alert, TouchableOpacity, TextInput } from 'react-native'
import React, {useState} from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import styles from './styles'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useProfileContext } from '../../../providers/ProfileProvider'

const TransportationTypeCom = () => {

  const {transportationType, setTransportationType, vehicleType, setVehicleType, model, setModel, plateNumber, setPlateNumber, images, setImages} = useProfileContext()

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

  return (
    <View style={styles.container}>
      {/* <Text>TransportationTypeCom</Text> */}
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
                <AntDesign name="info-cirlce" style={styles.infoIcon} />
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
          placeholder='Eg: Moving Van, Pickup Van, Cooling Van'
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
          <TouchableOpacity style={styles.addPhotoCon} onPress={pickImages}>
            <Text style={styles.addPhotoTxt}>Add Photos</Text>
            {/* <AntDesign name="pluscircle" style={styles.plusIconBtn} /> */}
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

export default TransportationTypeCom