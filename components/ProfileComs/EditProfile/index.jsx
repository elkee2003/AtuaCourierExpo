import { View, Text, TextInput, Alert, ScrollView, Image, TouchableOpacity} from 'react-native'
import React, {useState} from 'react';
import { KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import styles from './styles';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranportionType from '../TransporationType'
import BankDetails from './bankDetails';
import { signOut } from 'aws-amplify/auth';
import { useProfileContext } from '../../../providers/ProfileProvider';


const EditProfile = () => {

    const {
      firstName,setFirstName, lastName, setLastName, profilePic, setProfilePic, address, setAddress, phoneNumber, setPhoneNumber, landMark, setLandMark, courierNIN, setCourierNIN, bankName, setBankName, accountName, setAccountName, accountNumber, setAccountNumber,errorMessage, onValidateCourierInput,
    } = useProfileContext();

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
      if (onValidateCourierInput()) {
          router.push('/profile/reviewprofile/reviewcourier'); // Navigate to the profile screen upon successful validation
      }
    };

    async function handleSignOut() {
      try {
        const res = await signOut();
        console.log(res)
      } catch (error) {
        console.log('error signing out: ', error);
      }
    }

    const onSignout = ()=>{
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: "Cancel",
            style: "cancel",
            
          },
          {
            text: "Yes",
            onPress: () => handleSignOut(),
          },
        ],
        { cancelable: true }
      )
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80} // tweak if needed
      >
      <View style={styles.container}>

        <Text style={styles.title}>Edit Profile</Text>

        {/* Back Button */}
        <TouchableOpacity onPress={()=>router.back()} style={styles.bckBtnCon}>
              <Ionicons name={'arrow-back'} style={styles.bckBtnIcon}/>
        </TouchableOpacity>

        {/* Sign out button */}
        <TouchableOpacity style={styles.signoutBtn} onPress={onSignout}>
          <Text style={styles.signoutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <ScrollView
        >
          {/* Upload Profile Picture */}
          <View style={styles.profilePicContainer}>
            {profilePic && <Image source={{ uri: profilePic }} style={styles.img} />}
            <View style={styles.plusIconContainer}>
            <TouchableOpacity onPress={pickImage}>
              <AntDesign style={styles.plusIcon} name="plus-circle"  />
            </TouchableOpacity>
            </View>
          </View>
          {/* <TouchableOpacity onPress={pickImage}>
            <AntDesign style={styles.plusIcon} name="pluscircle" size={30} color="#03033b" />
          </TouchableOpacity> */}
            

          <TextInput 
          value={firstName}
          onChangeText={setFirstName}
          placeholder='First Name / Company name'
          style={styles.input}
          />
          <TextInput 
          value={lastName}
          onChangeText={setLastName}
          placeholder='Surname'
          style={styles.input}
          />
          
          <TranportionType/>

          <TextInput 
          value={address}
          onChangeText={setAddress}
          placeholder='Address'
          multiline
          style={styles.input}
          />

          <TextInput 
          value={landMark}
          onChangeText={setLandMark}
          placeholder='Choose your land mark (Optional)'
          style={{...styles.input, color: '#04df04'}}
          />
        
          <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder='Phone Number'
          style={styles.input}
          keyboardType='numeric'
          />

          <TextInput
            value={courierNIN}
            onChangeText={setCourierNIN}
            placeholder='Enter your NIN'
            style={styles.input}
            keyboardType='numeric'
          />

          {/* BankDetails */}
          <BankDetails/>

        </ScrollView>

        {/* Error Message */}
        <Text style={styles.error}>{errorMessage}</Text>
        
        {/* Button */}
        <TouchableOpacity onPress={handleNxtPage} style={styles.nxtBtn}>
            <MaterialIcons name="navigate-next" style={styles.nxtBtnIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default EditProfile;