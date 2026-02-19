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
      firstName,setFirstName, lastName, setLastName, profilePic, setProfilePic, address, setAddress, phoneNumber, setPhoneNumber, landMark, setLandMark, courierNIN, setCourierNIN,courierNINImage, setCourierNINImage, bankName, setBankName, accountName, setAccountName, accountNumber, setAccountNumber,errorMessage, onValidateCourierInput,
    } = useProfileContext();

    // ===== PROFILE IMAGE FUNCTIONS =====

    const showProfileImageOptions = () => {
      Alert.alert(
        "Update Profile Picture",
        "Choose an option",
        [
          {
            text: "Camera",
            onPress: openProfileCamera,
          },
          {
            text: "Gallery",
            onPress: pickProfileImage,
          },
          {
            text: "Remove",
            onPress: () => setProfilePic(null),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        {
          cancelable: true, // 👈 IMPORTANT FOR ANDROID
        }
      );
    };

    const openProfileCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Camera access is needed.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // perfect square for profile
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePic(result.assets[0].uri);
      }
    };

    const pickProfileImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1], // square crop like top apps
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePic(result.assets[0].uri);
      }
    };

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
        setCourierNINImage(result.assets[0].uri);
      }
    };

    const pickNINImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setCourierNINImage(result.assets[0].uri);
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
        <View style={styles.profilePicWrapper}>
          <TouchableOpacity
            style={styles.profilePicContainer}
            onPress={showProfileImageOptions}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.img} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="person-outline" size={50} color="#777" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </View>
            )}

            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

          <Text style={styles.subHeader}>
            First Name / Company name:
          </Text>
          <TextInput 
            value={firstName}
            onChangeText={setFirstName}
            placeholder='First Name / Company name'
            style={styles.input}
          />

          <Text style={styles.subHeader}>
            Last Name:
          </Text>
          <TextInput 
            value={lastName}
            onChangeText={setLastName}
            placeholder='Last Name'
            style={styles.input}
          />
          
          <Text style={styles.subHeader}>
            Transportation Type:
          </Text>
          <TranportionType/>

          <Text style={styles.subHeader}>
            Address:
          </Text>
          <TextInput 
            value={address}
            onChangeText={setAddress}
            placeholder='Address'
            multiline
            style={styles.input}
          />

          <Text style={styles.subHeader}>
            Landmark:
          </Text>
          <TextInput 
            value={landMark}
            onChangeText={setLandMark}
            placeholder='Choose your land mark (Optional)'
            style={{...styles.input, color: '#04df04'}}
          />
        
          <Text style={styles.subHeader}>
            Phone Number:
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder='Phone Number'
            style={styles.input}
            keyboardType='numeric'
          />

          <Text style={styles.subHeader}>
            NIN:
          </Text>
          <TextInput
            value={courierNIN}
            onChangeText={setCourierNIN}
            placeholder='Enter your NIN'
            style={styles.input}
            keyboardType='numeric'
          />

          {/* NIN Image Upload Section */}
          <Text style={styles.sectionTitle}>National ID Verification</Text>

          <View style={styles.ninCard}>
            {courierNINImage ? (
              <>
                <Image source={{ uri: courierNINImage }} style={styles.ninImage} />

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

          {/* BankDetails */}
          <Text style={styles.subHeader}>
            Bank Details:
          </Text>
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