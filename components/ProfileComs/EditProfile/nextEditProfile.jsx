import { View, Text, TextInput,Pressable, Alert, ScrollView, Image, TouchableOpacity} from 'react-native'
import React, {useState} from 'react'
import * as ImagePicker from 'expo-image-picker';
import styles from './styles'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProfileContext } from '../../../providers/ProfileProvider';


const NextEditProfile = () => {

    const {
        guarantorName, setGuarantorName, guarantorLastName, setGuarantorLastName, guarantorProfession, setGuarantorProfession, guarantorNumber, setGuarantorNumber, guarantorRelationship, setGuarantorRelationship, guarantorAddress, setGuarantorAddress, guarantorEmail, setGuarantorEmail, guarantorNIN, setGuarantorNIN,errorMessage, onValidateGuarantorInput,
    } = useProfileContext()

    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled) {
        setProfilePic(result.assets[0].uri);
      }
    };
    
    // Navigation Function
    const handleNxtPage = () => {
      if (onValidateGuarantorInput()) {
          router.push('/profile/reviewprofile/reviewguarantor'); // Navigate to the profile screen upon successful validation
      }
    };

    return (
    <View style={styles.container}>

      <Text style={styles.title}>Edit Profile</Text>

      {/* Back Button */}
      <TouchableOpacity onPress={()=>router.back()} style={styles.bckBtnCon}>
            <Ionicons name={'arrow-back'} style={styles.bckBtnIcon}/>
      </TouchableOpacity>

      <Text style={styles.addGuarantorSub}>Add Guarantor</Text>
        
      <ScrollView>
        <TextInput 
        value={guarantorName}
        onChangeText={setGuarantorName}
        placeholder="Guarantor's first Name"
        style={styles.input}
        />
        <TextInput 
        value={guarantorLastName}
        onChangeText={setGuarantorLastName}
        placeholder="Guarantor's surname"
        style={styles.input}
        />
        <TextInput 
        value={guarantorProfession}
        onChangeText={setGuarantorProfession}
        placeholder="Guarantor's profession eg: Lawyer, plumber"
        style={styles.input}
        />

        <TextInput 
        value={guarantorAddress}
        onChangeText={setGuarantorAddress}
        placeholder="Guarantor's address"
        multiline
        style={styles.input}
        />
      
        <TextInput
        value={guarantorNumber}
        onChangeText={setGuarantorNumber}
        placeholder="08000000000"
        style={styles.input}
        keyboardType='numeric'
        />

        <TextInput 
        value={guarantorRelationship}
        onChangeText={setGuarantorRelationship}
        placeholder="Relationship with Guarantor eg: Friend, Mother, Boss etc"
        multiline
        style={styles.input}
        />

        <TextInput
          value={guarantorEmail}
          onChangeText={setGuarantorEmail}
          placeholder="Guarantor's email (Optional)"
          style={styles.input}
        />
        <TextInput
          value={guarantorNIN}
          onChangeText={setGuarantorNIN}
          placeholder="Guarantor's NIN (Optional)"
          style={styles.input}
          keyboardType='numeric'
        />

        {/* Error Message */}
        <Text style={styles.error}>{errorMessage}</Text>
      </ScrollView>
      
        {/* Button */}
      <View>
        <TouchableOpacity onPress={handleNxtPage} style={styles.nxtBtn}>
            <MaterialIcons name="navigate-next" style={styles.nxtBtnIcon} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default NextEditProfile;