import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import { useProfileContext } from '../../../providers/ProfileProvider'
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles'
import { router } from 'expo-router';
import { getUrl } from 'aws-amplify/storage';

const ReviewGuarantorCom = () => {
    const {
        guarantorName, guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN, guarantorNINImage
    } = useProfileContext()

    const [ninImageUrl, setNinImageUrl] = useState(null);

    // Navigation Function
    const goToProfile = () => {
        router.push('/profile'); 
    };

    // useEffect for fetching NINImage
    useEffect(() => {
        const fetchNinImage = async () => {
            if (!guarantorNINImage) return;

            // If already a signed URL, use it directly
            if (guarantorNINImage.startsWith('http')) {
            setNinImageUrl(guarantorNINImage);
            return;
            }

            try {
            const result = await getUrl({
                path: guarantorNINImage,
                options: { validateObjectExistence: true },
            });

            setNinImageUrl(result.url.toString());
            } catch (error) {
            console.log("Error fetching NIN image:", error);
            }
        };

        fetchNinImage();
    }, [guarantorNINImage]);

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

            {/* NIN Image */}
            {ninImageUrl && (
                <>
                    <Text style={styles.subHeader}>NIN Slip:</Text>
                    <Image
                    source={{ uri: ninImageUrl }}
                    style={styles.reviewNinImage}
                    />
                </>
            )}
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