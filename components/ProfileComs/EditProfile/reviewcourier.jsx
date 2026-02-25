import { View, Text, Image, ScrollView, TouchableOpacity,  } from 'react-native'
import React from 'react'
import { useProfileContext } from '../../../providers/ProfileProvider'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles'
import { router } from 'expo-router';

const ReviewCourierCom = () => {
    const {
        firstName, lastName, profilePic, transportationType, vehicleClass, model, plateNumber, maxiImages, address, phoneNumber, landMark, courierNIN, courierNINImage, bankName, accountName, accountNumber,
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

        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reviewScrollContent}
        >

        
    
                {/* Profile Image */}
                <View style={styles.profilePicWrapper}>
                {profilePic && (
                    <Image source={{ uri: profilePic }} style={styles.reviewProfileImage} />
                )}
                </View>

                {/* User Info */}
                {renderField("First Name", firstName)}
                {renderField("Last Name", lastName)}
                {renderField("Transportation Type", transportationType)}
                {vehicleClass && renderField("Vehicle Class", vehicleClass)}
                {model && renderField("Model", model)}
                {plateNumber && renderField("Plate Number", plateNumber)}

                {/* Vehicle Images (Maxi Only) */}
                {transportationType === 'Maxi' && maxiImages?.length > 0 && (
                <>
                    <Text style={styles.subHeader}>Vehicle Photos:</Text>

                    <View style={styles.imageListContainer}>
                    {maxiImages.map((uri, index) => (
                        <Image
                        key={index}
                        source={{ uri }}
                        style={styles.maxiImages}
                        />
                    ))}
                    </View>
                </>
                )}
                {renderField("Address", address)}
                {renderField("Land Mark", landMark)}
                {renderField("Phone Number", phoneNumber)}
                {renderField("NIN", courierNIN)}

                {/* NIN Image */}
                {courierNINImage && (
                <>
                    <Text style={styles.subHeader}>NIN Slip:</Text>
                    <Image
                    source={{ uri: courierNINImage }}
                    style={styles.reviewNinImage}
                    />
                </>
                )}

                {renderField("Bank Name", bankName)}
                {renderField("Account Name", accountName)}
                {renderField("Account Number", accountNumber, true)}

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

export default ReviewCourierCom;

const renderField = (label, value, isLast = false) => (
  <>
    <Text style={styles.subHeader}>{label}:</Text>
    <Text style={isLast ? styles.inputReviewLast : styles.inputReview}>
      {value}
    </Text>
  </>
);