import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, {useState} from 'react';
import * as Crypto from 'expo-crypto';
import * as ImageManipulator from 'expo-image-manipulator';
import { useProfileContext } from '../../../providers/ProfileProvider';
import { useAuthContext } from '../../../providers/AuthProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles'
import { router } from 'expo-router';
import { DataStore } from '@aws-amplify/datastore';
import { uploadData, remove } from 'aws-amplify/storage';
import {Courier} from '../../../src/models';

const ReviewGuarantorCom = () => {
    const {
        firstName, lastName, profilePic, transportationType, vehicleType, model, plateNumber, images,  address, phoneNumber, landMark, courierNIN, bankCode, bankName, accountName, accountNumber,
        guarantorName, guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN,
    } = useProfileContext()

    const {dbUser, setDbUser, sub} = useAuthContext();

    console.log(dbUser, firstName, lastName)

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    async function uploadImage() {
        try {

            // Step 1: Delete the previous profile photo if it exists
            if (dbUser?.profilePic) {
                console.log("Deleting previous profile photo:", dbUser.profilePic);
                await remove({ path: dbUser.profilePic });
            }

            // Step 2: Process and upload the new profile photo
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                profilePic,
                [{ resize: { width: 250 } }],  // Adjust width as needed
                { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } // Compress quality between 0 and 1
            );
            const response = await fetch(manipulatedImage.uri);
            const blob = await response.blob();

            // Generate a unique file key
            const fileKey = `public/profilePhoto/${sub}/${Crypto.randomUUID()}.jpg`; // New path format

            // Upload the new image to S3
            const result = await uploadData({
                path: fileKey,
                data: blob,
                options:{
                    contentType:'image/jpeg', // contentType is optional
                    onProgress:({ transferredBytes, totalBytes }) => {
                        if(totalBytes){
                            const progress = Math.round((transferredBytes / totalBytes) * 100);
                            setUploadProgress(progress); // Update upload progress
                            console.log(`Upload progress: ${progress}%`);
                        }
                    }
                }
            }).result

            return result.path;  // Updated to return `path`
            } catch (err) {
            console.log('Error uploading file:', err);
            }
    }

    // function for maxi images
    const uploadMaxiImages = async () => {
        try {
          // Step 1: Delete existing maxiImages
          if (dbUser?.maxiImages?.length) {
            await Promise.all(
              dbUser.maxiImages.map(async (oldImage) => {
                try {
                    console.log("Deleting old maxi image:", oldImage);
                    await remove({ path: oldImage });
                } catch (err) {
                    console.error(`Failed to delete image ${oldImage}:`, err);
                }
              })
            );
          }

          // Step 2: Check if images array has data before proceeding
            if (!images || images.length === 0) {
                console.log("No images to upload.");
                return [];
            }
      
          // Step 3: Upload new images
            const uploadPromises = images.map(async (item) => {
                // Resize and compress image
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    item.uri,
                    [{ resize: { width: 600 } }],  // Adjust width as needed
                    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } // Compress quality between 0 and 1
                );

                const response = await fetch(manipulatedImage.uri);
                const blob = await response.blob();

                const fileKey = `public/maxiImages/${sub}/${Crypto.randomUUID()}.jpg`;

                const result = await uploadData({
                    path: fileKey,
                    data: blob,
                    options: {
                        contentType: 'image/jpeg',
                        onProgress: ({ transferredBytes, totalBytes }) => {
                            if (totalBytes) {
                                const progress = Math.round((transferredBytes / totalBytes) * 100);
                                setUploadProgress(progress); // Update upload progress
                                console.log(`Upload progress: ${progress}%`);
                            }
                        }
                    }
                }).result;

                return result.path;
            });

            // Wait for all upload promises to complete
            const maxiImageUrls = await Promise.all(uploadPromises);
            return maxiImageUrls;
          
        } catch (err) {
          console.log("Error managing maxi images:", err);
          Alert.alert('Upload Maxi Error', 'Failed to upload Maxi Images. Please try again.');
          throw err;
        }
    };

    // Function to create and update courier
    const createCourier = async ()=>{
        if (uploading) return;
        setUploading(true);

        try{
            const uploadedImagePath = await uploadImage();  // Upload image first
            const uploadedMaxiImages = await uploadMaxiImages(); // Upload Maxi Images

            const courier = await DataStore.save(new Courier({
                firstName, lastName, transportationType, vehicleType, model, plateNumber,
                profilePic: uploadedImagePath,
                maxiImages: uploadedMaxiImages,
                address, landMark, phoneNumber, courierNIN,  bankCode, bankName, accountName, accountNumber, guarantorName,guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN, 
                sub,
                isOnline:false,
                isApproved:false,
            })
            );
            setDbUser(courier)
        }catch(e){
            Alert.alert("Error", e.message)
        }
    };

    const updateCourier = async () => {
        if (uploading) return;
        setUploading(true);
        try{
            const uploadedImagePath = await uploadImage();
            const uploadedMaxiImages = await uploadMaxiImages();

            const courier = await DataStore.save(Courier.copyOf(dbUser, (updated)=>{
                updated.firstName = firstName;
                updated.lastName = lastName; 
                updated.profilePic = uploadedImagePath;
                updated.maxiImages = uploadedMaxiImages;
                updated.transportationType = transportationType,
                updated.vehicleType = vehicleType,
                updated.model = model,
                updated.plateNumber = plateNumber,
                updated.address = address, 
                updated.landMark = landMark, 
                updated.phoneNumber = phoneNumber, 
                updated.courierNIN = courierNIN, 
                updated.bankCode = bankCode,
                updated.bankName = bankName, 
                updated.accountName = accountName, 
                updated.accountNumber = accountNumber, 
                updated.guarantorName = guarantorName,
                updated.guarantorLastName = guarantorLastName, 
                updated.guarantorProfession = guarantorProfession, 
                updated.guarantorNumber = guarantorNumber, 
                updated.guarantorRelationship = guarantorRelationship, 
                updated.guarantorAddress = guarantorAddress, 
                updated.guarantorEmail = guarantorEmail, 
                updated.guarantorNIN = guarantorNIN
            }))
            setDbUser(courier)
        }catch(e){
            Alert.alert('Error', e.message)
        }finally{
            setUploading(false);
        }
    }
    
    const handleSave = async () => {
        if(dbUser){
            await updateCourier()
            router.push('/profile')

            setTimeout(() => {
                router.push('/home');
            }, 1000);
        }else {
            await createCourier ()
            router.push('/profile')

            setTimeout(() => {
                router.push('/home');
            }, 1000);
        }
    }
    


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
            <TouchableOpacity 
                style={styles.saveBtn}
                disabled={uploading} 
                onPress={handleSave}
            >
                <Text style={styles.saveBtnTxt}>
                    {uploading ? `Saving... ${uploadProgress}%` : 'Save'}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default ReviewGuarantorCom;