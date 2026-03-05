import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useProfileContext } from '../../../providers/ProfileProvider'
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles'
import { router } from 'expo-router';

const ReviewGuarantorCom = () => {
    const {
        guarantorName, guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN,
    } = useProfileContext()

    // Navigation Function
    const goToProfile = () => {
        router.push('/profile'); 
    };

  return (
    <View style={styles.reviewContainer}>

        <Text style={styles.title}>Review Profile</Text>

        {/* Back Button */}
        <TouchableOpacity onPress={()=>router.back()} style={styles.bckBtnCon}>
                <Ionicons name={'arrow-back'} style={styles.bckBtnIcon}/>
        </TouchableOpacity>

        <Text style={styles.guarantorSub}>Guarantor Review</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.subHeader}>Guarantor's First Name:</Text>
            <Text style={styles.inputReview}>{guarantorName}</Text>

            <Text style={styles.subHeader}>Guarantor's Last Name:</Text>
            <Text style={styles.inputReview}>{guarantorLastName}</Text>

            <Text style={styles.subHeader}>Guarantor's Profession:</Text>
            <Text style={styles.inputReview}>{guarantorProfession}</Text>

            <Text style={styles.subHeader}>Guarantor's Address:</Text>
            <Text style={styles.inputReview}>{guarantorAddress}</Text>

            <Text style={styles.subHeader}>Guarantor's Number:</Text>
            <Text style={styles.inputReview}>{guarantorNumber}</Text>

            <Text style={styles.subHeader}>Guarantor's Relationship:</Text>
            <Text style={styles.inputReview}>{guarantorRelationship}</Text>

            <Text style={styles.subHeader}>Guarantor's Email:</Text>
            <Text style={styles.inputReview}>{guarantorEmail}</Text>

            <Text style={styles.subHeader}>Guarantor's NIN:</Text>
            <Text style={styles.inputReviewLast}>{guarantorNIN}</Text>
        </ScrollView>
        
        {/* Button */}
        <View>
            <TouchableOpacity onPress={goToProfile} style={styles.doneBtn}>
                <Text style={styles.doneTxt}>Done</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default ReviewGuarantorCom;