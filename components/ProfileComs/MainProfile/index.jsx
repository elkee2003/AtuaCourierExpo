import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { useProfileContext } from '../../../providers/ProfileProvider';
import {useAuthContext} from '@/providers/AuthProvider';
import Placeholder from '../../../assets/images/placeholder.png'
import { DataStore } from 'aws-amplify/datastore';
import {Courier} from '@/src/models';
import { getUrl } from 'aws-amplify/storage';
import styles from './styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { signOut } from 'aws-amplify/auth';

const MainProfile = () => {

    const {
      firstName, lastName, profilePic, setProfilePic,  address, phoneNumber, landMark, courierNIN, courierBVN, bankName, accountName, accountNumber, guarantorName, guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN,
    } = useProfileContext()

    const {dbUser} = useAuthContext();
    const [loading, setLoading]= useState(true);

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

    // Fetch signed URL for profile picture
    const fetchImageUrl = async () => {
      setLoading(true);
      try {
        const result = await getUrl({
          path: dbUser.profilePic,
          options: {
            validateObjectExistence: true, 
            expiresIn: null, // No expiration limit
          },
        });

        if (result.url) {
          setProfilePic(result.url.toString());
        }
      } catch (error) {
        console.error('Error fetching profile pic URL:', error);
      }finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (dbUser.profilePic) {
        fetchImageUrl();
      }
  
      const subscription = DataStore.observe(Courier).subscribe(({opType})=>{
        if(opType === 'INSERT' || opType === 'UPDATE' || opType === 'DELETE'){
          fetchImageUrl();
        }
      });
  
      return () => subscription.unsubscribe();
    }, [dbUser.profilePic]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Back Button */}
      {/* <TouchableOpacity onPress={()=>router.back()} style={styles.bckBtnCon}>
            <Ionicons name={'arrow-back'} style={styles.bckBtnIcon}/>
      </TouchableOpacity> */}

      {/* Sign out button */}
      <TouchableOpacity style={styles.signoutBtn} onPress={onSignout}>
        <Text style={styles.signoutTxt}>Sign Out</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.centerCon} showsVerticalScrollIndicator={false}>

        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
          {loading ? (
            <Image 
              source={Placeholder} 
              style={styles.img} 
            /> // Show placeholder while loading
          ) : (
            <Image source={{ uri: profilePic }} style={styles.img} onError={() => setProfilePic(null)} />
          )}
        </View>

        {/* Relevant Info section */}
        <View>
          <Text style={styles.details}>{firstName}</Text>
          <Text style={styles.details}>{phoneNumber}</Text>
          <Text style={styles.details}>{bankName}</Text>
          <Text style={styles.details}>{accountName}</Text>
          <Text style={styles.details}>{accountNumber}</Text>
          <Text style={styles.details}>{guarantorName}</Text>
        </View>

        {/* Button Section */}
        <View>
          <View style={styles.mainBtnsCard}>
            <TouchableOpacity style={styles.viewInfo} onPress={()=>router.push('/profile/reviewinfo/reviewcourier')}>
                <Text style={styles.viewInfoText}>View Info</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editProfile} onPress={()=>router.push('/profile/editprofile')}>
                <Text style={styles.editProfileTxt}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Cards container */}
          <View style={styles.tetiaryCard}>
            <TouchableOpacity style={styles.btnTetiary} onPress={()=>router.push('/transportationtype')}>
              <Text style={styles.btnTetiaryTxt}>Transportation Type</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnTetiary} onPress={()=>router.push('/policies')}>
              <Text style={styles.btnTetiaryTxt}>Policies</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default MainProfile