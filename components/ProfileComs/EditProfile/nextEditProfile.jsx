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
        guarantorName, setGuarantorName, guarantorLastName, setGuarantorLastName, guarantorProfession, setGuarantorProfession, guarantorNumber, setGuarantorNumber, guarantorRelationship, setGuarantorRelationship, guarantorAddress, setGuarantorAddress, guarantorEmail, setGuarantorEmail, guarantorNIN, setGuarantorNIN,guarantorNINImage, setGuarantorNINImage, errorMessage, onValidateGuarantorInput,
    } = useProfileContext()

    // Pick NIN Function
    const showImageOptions = () => {
      Alert.alert(
        "Upload NIN Image",
        "Choose an option",
        [
          { text: "Camera", onPress: openCamera },
          { text: "Gallery", onPress: pickNINImage },
          { text: "Cancel", style: "cancel" },
        ]
      );
    };

    const openCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Camera access is needed.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setGuarantorNINImage(result.assets[0].uri);
      }
    };

    const pickNINImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setGuarantorNINImage(result.assets[0].uri);
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
        <Text style={styles.subHeader}>
          Guarantor's First Name:
        </Text>
        <TextInput 
          value={guarantorName}
          onChangeText={setGuarantorName}
          placeholder="Guarantor's First Name"
          style={styles.input}
        />

        <Text style={styles.subHeader}>
          Guarantor's Last Name:
        </Text>
        <TextInput 
          value={guarantorLastName}
          onChangeText={setGuarantorLastName}
          placeholder="Guarantor's Last Name"
          style={styles.input}
        />
        <Text style={styles.subHeader}>
          Guarantor's Profession:
        </Text>
        <TextInput 
          value={guarantorProfession}
          onChangeText={setGuarantorProfession}
          placeholder="Guarantor's profession eg: Lawyer, plumber"
          style={styles.input}
        />

        <Text style={styles.subHeader}>
          Guarantor's Address:
        </Text>
        <TextInput 
          value={guarantorAddress}
          onChangeText={setGuarantorAddress}
          placeholder="Guarantor's address"
          multiline
          style={styles.input}
        />
      
        <Text style={styles.subHeader}>
          Guarantor's Phone Number:
        </Text>
        <TextInput
          value={guarantorNumber}
          onChangeText={setGuarantorNumber}
          placeholder="08000000000"
          style={styles.input}
          keyboardType='numeric'
        />

        <Text style={styles.subHeader}>
          Relationship With Guarantor:
        </Text>
        <TextInput 
          value={guarantorRelationship}
          onChangeText={setGuarantorRelationship}
          placeholder="Relationship with Guarantor eg: Friend, Mother, Boss etc"
          multiline
          style={styles.input}
        />

        <Text style={styles.subHeader}>
          Guarantor's NIN:
        </Text>
        <TextInput
          value={guarantorNIN}
          onChangeText={setGuarantorNIN}
          placeholder="Guarantor's NIN"
          style={styles.input}
          keyboardType='numeric'
        />

        {/* NIN Image Upload Section */}
        <Text style={styles.sectionTitle}>Guarantor National ID</Text>

        <View style={styles.ninCard}>
          {guarantorNINImage ? (
            <>
              <Image source={{ uri: guarantorNINImage }} style={styles.ninImage} />

              <View style={styles.ninActions}>
                <TouchableOpacity onPress={pickNINImage} style={styles.replaceBtn}>
                  <Text style={styles.replaceText}>Replace</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCourierNINImage(null)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={showImageOptions} style={styles.uploadBox}>
              <Ionicons name="cloud-upload-outline" size={40} color="#07a830" />
              <Text style={styles.uploadTitle}>Upload NIN Slip</Text>
              <Text style={styles.uploadSub}>
                Take a clear photo or upload from gallery
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.subHeader}>
          Guarantor's Email:
        </Text>
        <TextInput
          value={guarantorEmail}
          onChangeText={setGuarantorEmail}
          placeholder="Guarantor's email (Optional)"
          autoCapitalize="none"
          style={styles.input}
        /> 
      </ScrollView>

      {/* Error Message */}
      <Text style={styles.error}>{errorMessage}</Text>
      
      {/* Button */}
      <TouchableOpacity onPress={handleNxtPage} style={styles.nxtBtn}>
          <MaterialIcons name="navigate-next" style={styles.nxtBtnIcon} />
      </TouchableOpacity>
    </View>
  )
}

export default NextEditProfile;