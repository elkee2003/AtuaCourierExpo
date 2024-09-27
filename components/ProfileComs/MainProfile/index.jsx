import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useProfileContext } from '../../../providers/ProfileProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles';
import { router } from 'expo-router';
import { signOut } from 'aws-amplify/auth';

const MainProfile = () => {

    const {
      firstName, lastName, profilePic,  address, phoneNumber, landMark, courierNIN, courierBVN, bankName, accountName, accountNumber, guarantorName, guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN,
    } = useProfileContext()

    async function handleSignOut() {
      try {
        await signOut();
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
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Back Button */}
      <TouchableOpacity onPress={()=>router.back()} style={styles.bckBtnCon}>
            <Ionicons name={'arrow-back'} style={styles.bckBtnIcon}/>
      </TouchableOpacity>

      {/* Sign out button */}
      <TouchableOpacity style={styles.signoutBtn} onPress={onSignout}>
        <Text style={styles.signoutTxt}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.centerCon}>

        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
            <Image source={{ uri: profilePic }} style={styles.img} />
        </View>

        {/* Relevant Info section */}
        <View>
          <Text>{firstName}</Text>
          <Text>{phoneNumber}</Text>
          <Text>{firstName}</Text>
          <Text>{bankName}</Text>
          <Text>{accountName}</Text>
          <Text>{accountNumber}</Text>
          <Text>{guarantorName}</Text>
        </View>

        {/* Button Section */}
        <View style={styles.mainBtnRow}>
          <TouchableOpacity style={styles.viewInfo} onPress={()=>router.push('/profile/reviewinfo/reviewcourier')}>
              <Text style={styles.viewInfoText}>View Info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editProfile} onPress={()=>router.push('/profile/editprofile')}>
              <Text style={styles.editProfileTxt}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Cards container */}
          <View>
            <TouchableOpacity onPress={()=>router.push('/transportationtype')}>
              <Text>Transportation Type</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>router.push('/policies')}>
              <Text>Policies</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default MainProfile