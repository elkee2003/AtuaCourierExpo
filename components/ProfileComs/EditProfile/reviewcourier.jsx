import { View, Text, Image, ScrollView, TouchableOpacity,  } from 'react-native'
import React from 'react'
import { useProfileContext } from '../../../providers/ProfileProvider'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles'
import { router } from 'expo-router';

const ReviewCourierCom = () => {
    const {
        firstName, lastName, profilePic, transportationType, vehicleType, model, plateNumber, images, address, phoneNumber, landMark, courierNIN, bankName, accountName, accountNumber,
    } = useProfileContext()

    // Navigation Function
    const handleNxtPage = () => {
        router.push('/profile/nexteditprofile'); 
    };

  return (
    <View style={styles.reviewContainer}>

        <Text style={styles.title}>Review Profile</Text>

        {/* Back Button */}
        <TouchableOpacity onPress={()=>router.back()} style={styles.bckBtnCon}>
                <Ionicons name={'arrow-back'} style={styles.bckBtnIcon}/>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profilePicContainer}>
                <Image source={{ uri: profilePic }} style={styles.img} />
            </View>

            <Text style={styles.subHeader}>First Name:</Text>
            <Text style={styles.inputReview}>{firstName}</Text>

            <Text style={styles.subHeader}>Last Name:</Text>
            <Text style={styles.inputReview}>{lastName}</Text>

            <Text style={styles.subHeader}>Transportation Type:</Text>
            <Text style={styles.inputReview}>{transportationType}</Text>

            {vehicleType && (
                <>
                    <Text style={styles.subHeader}>Vehicle Type:</Text>
                    <Text style={styles.inputReview}>{vehicleType}</Text>
                </>
            )}

            {model && (
                <>
                    <Text style={styles.subHeader}>Model:</Text>
                    <Text style={styles.inputReview}>{model}</Text>
                </>
            )}
            
            {plateNumber && (
                <>
                    <Text style={styles.subHeader}>Plate Number:</Text>
                    <Text style={styles.inputReview}>{plateNumber}</Text>
                </>
            )}

            {images && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.imageListContainer}
                >
                    {images.map((item, index) => (
                        <Image 
                            key={index} 
                            source={{ uri: item }} 
                            style={styles.maxiImages} 
                        />
                    ))}
                </ScrollView>
            )}

            <Text style={styles.subHeader}>Address:</Text>
            <Text style={styles.inputReview}>{address}</Text>

            <Text style={styles.subHeader}>Land Mark:</Text>
            <Text style={styles.inputReview}>{landMark}</Text>

            <Text style={styles.subHeader}>Phone Number:</Text>
            <Text style={styles.inputReview}>{phoneNumber}</Text>

            <Text style={styles.subHeader}>NIN:</Text>
            <Text style={styles.inputReview}>{courierNIN}</Text>

            <Text style={styles.subHeader}>Bank Name:</Text>
            <Text style={styles.inputReview}>{bankName}</Text>

            <Text style={styles.subHeader}>Account Name:</Text>
            <Text style={styles.inputReview}>{accountName}</Text>

            <Text style={styles.subHeader}>Account Number:</Text>
            <Text style={styles.inputReviewLast}>{accountNumber}</Text>
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

export default ReviewCourierCom