import { View, Text, Alert, TouchableOpacity } from 'react-native'
import React, {useState} from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import styles from './styles'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useProfileContext } from '../../../providers/ProfileProvider'

const TransportationTypeCom = () => {

  const {transportationType, setTransportationType,} = useProfileContext()

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
                <AntDesign name="infocirlceo" size={20} color="gray" style={styles.infoIcon} />
              </TouchableOpacity>
            </View>
          )}
      />
    </View>
  )
}

export default TransportationTypeCom