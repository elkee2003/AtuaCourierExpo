import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useProfileContext } from '../../../providers/ProfileProvider'
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles'
import { router } from 'expo-router';
import { DataStore } from 'aws-amplify/datastore';
import {Courier} from '../../../src/models'

const ReviewGuarantorCom = () => {
    const {
        firstName, lastName, profilePic,  address, phoneNumber, landMark, courierNIN, courierBVN, bankName, accountName, accountNumber,
        guarantorName, guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN, setDbUser, sub
    } = useProfileContext()

    // Navigation Function
    const handleSave = () => {
        const createUser = async ()=>{
            try{
                const courier = await DataStore.save(new Courier({
                firstName, lastName, profilePic, address, landMark, phoneNumber, courierNIN, courierBVN, bankName, accountName, accountNumber, guarantorName,guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN, 
                sub,
                })
                );
                console.log("I am User:",user)
                setDbUser(courier)
            }catch(e){
                Alert.alert("Error", e.message)
            }
        };
    };

  return (
    <View style={styles.reviewContainer}>

        <Text style={styles.title}>Review Profile</Text>

        {/* Back Button */}
        <TouchableOpacity onPress={()=>router.back()} style={styles.bckBtnCon}>
                <Ionicons name={'arrow-back'} style={styles.bckBtnIcon}/>
        </TouchableOpacity>

        <Text style={styles.addGuarantorSub}>Guarantor Review</Text>

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

            <Text style={styles.subHeader}>Guarantor's NIN</Text>
            <Text style={styles.inputReviewLast}>{guarantorNIN}</Text>
        </ScrollView>
        
        {/* Button */}
        <View>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveBtnTxt}>Save</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default ReviewGuarantorCom;