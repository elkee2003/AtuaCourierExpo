import { View, Text, Alert, TouchableOpacity } from 'react-native'
import React, {useState} from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import styles from './styles'
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { useProfileContext } from '../../../../providers/ProfileProvider'
import { useAuthContext } from '../../../../providers/AuthProvider';
import { DataStore } from 'aws-amplify/datastore';
import {Courier} from '../../../../src/models'

const StandaloneTtypeCom = () => {

  const {transportationType, setTransportationType} = useProfileContext()
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

  const updateTransportType = async () => {
    try{
      const transportType = await DataStore.save(Courier.copyOf(dbUser, (updated)=>{
         
        updated.transportationType = transportationType 
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

      <TouchableOpacity style={styles.btnCon} onPress={updateTransportType}>
        <Text style={styles.btnTxt}>Change</Text>
      </TouchableOpacity>
    </View>
  )
}

export default StandaloneTtypeCom