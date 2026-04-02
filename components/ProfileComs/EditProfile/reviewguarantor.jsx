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
        firstName, lastName, profilePic, transportationType, vehicleClass, model, plateNumber, maxiImages, maxiDescription, address, phoneNumber, landMark, courierNIN, courierNINImage, bankCode, bankName, accountName, accountNumber,
        guarantorName, guarantorLastName, guarantorProfession, guarantorNumber, guarantorRelationship, guarantorAddress, guarantorEmail, guarantorNIN, guarantorNINImage, 
    } = useProfileContext()

    const {dbUser, setDbUser, sub, userMail} = useAuthContext();

    console.log(dbUser, firstName, lastName)

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadSingleImage = async (localUri, folder) => {
        if (!localUri) return null;

        const manipulatedImage = await ImageManipulator.manipulateAsync(
            localUri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();

        const fileKey = `public/${folder}/${sub}/${Crypto.randomUUID()}.jpg`;

        const result = await uploadData({
            path: fileKey,
            data: blob,
            options: {
            contentType: "image/jpeg",
            },
        }).result;

        return result.path;
        };

    

    // function for maxi images
    const uploadMaxiImages = async () => {
        try {
            if (!maxiImages || maxiImages.length === 0) {
            return dbUser?.maxiImages || [];
            }

            const uploadedPaths = [];

            for (const item of maxiImages) {

            const localUri = typeof item === "string" ? item : item?.uri;

            if (!localUri) continue;

            // ✅ If already uploaded (S3 path), keep it
            if (localUri.startsWith("public/")) {
                uploadedPaths.push(localUri);
                continue;
            }

            // ✅ Only upload local files
            if (localUri.startsWith("file://")) {

                const manipulatedImage = await ImageManipulator.manipulateAsync(
                localUri,
                [{ resize: { width: 600 } }],
                { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
                );

                const response = await fetch(manipulatedImage.uri);
                const blob = await response.blob();

                const fileKey = `public/maxiImages/${sub}/${Crypto.randomUUID()}.jpg`;

                const result = await uploadData({
                path: fileKey,
                data: blob,
                options: {
                    contentType: "image/jpeg",
                    onProgress: ({ transferredBytes, totalBytes }) => {
                    if (totalBytes) {
                        setUploadProgress(
                        Math.round((transferredBytes / totalBytes) * 100)
                        );
                    }
                    },
                },
                }).result;

                uploadedPaths.push(result.path);
            }
            }

            // ✅ Delete only removed images
            if (dbUser?.maxiImages?.length) {

            const removedImages = dbUser.maxiImages.filter(
                oldPath => !uploadedPaths.includes(oldPath)
            );

            await Promise.all(
                removedImages.map(path =>
                remove({ path }).catch(() => {})
                )
            );
            }

            return uploadedPaths;

        } catch (err) {
            console.log("Error uploading maxi images:", err);
            Alert.alert("Upload Error", "Failed to upload Maxi Images.");
            throw err;
        }
    };

    // Validation for maximages before saving
    const validateMaxiRequirements = () => {

        if (transportationType === "Maxi") {

            if (!maxiImages || maxiImages.length < 3) {
                Alert.alert(
                    "Maxi Images Required",
                    "Please upload at least 3 vehicle images for Maxi."
                )
                return false
            }

            if (!maxiDescription || maxiDescription.trim() === "") {
                Alert.alert(
                    "Maxi Description Required",
                    "Please enter vehicle description for Maxi."
                )
                return false
            }
        }

        return true
    }

    // Function to create and update courier
    const createCourier = async () => {
        if (uploading) return;
        setUploading(true);

        if (!profilePic) {
            Alert.alert("Profile Photo Required", "Please upload a profile picture.");
            setUploading(false);
            return;
        }

        try {
            // ✅ 1. Check if courier already exists
            let existingCouriers = await DataStore.query(Courier, (c) =>
            c.sub.eq(sub)
            );

            // 🔁 Retry after clearing (handles schema / sync issues)
            if (existingCouriers.length === 0) {
            console.log("No local courier — retrying sync...");

            await DataStore.clear();
            await DataStore.start();

            existingCouriers = await DataStore.query(Courier, (c) =>
                c.sub.eq(sub)
            );
            }

            // ✅ 2. If exists → DON'T create another one
            if (existingCouriers.length > 0) {
            console.log("Courier already exists, skipping creation");

            setDbUser(existingCouriers[0]);
            return;
            }

            // ✅ 3. Only now upload images
            const uploadedProfilePic = await uploadSingleImage(profilePic, "profilePhoto");
            const uploadedMaxiImages = await uploadMaxiImages();
            const uploadedCourierNINImage = await uploadSingleImage(courierNINImage, "courierNIN");
            const uploadedGuarantorNINImage = await uploadSingleImage(guarantorNINImage, "guarantorNIN");

            // ✅ 4. Create courier
            const courier = await DataStore.save(
            new Courier({
                firstName,
                lastName,
                transportationType,
                vehicleClass,
                model,
                plateNumber,
                email: userMail,
                profilePic: uploadedProfilePic,
                maxiImages: transportationType === "Maxi" ? uploadedMaxiImages : [],
                maxiDescription: transportationType === "Maxi" ? maxiDescription : "",
                courierNINImage: uploadedCourierNINImage,
                guarantorNINImage: uploadedGuarantorNINImage,
                address,
                landMark,
                phoneNumber,
                courierNIN,
                bankCode,
                bankName,
                accountName,
                accountNumber,
                guarantorName,
                guarantorLastName,
                guarantorProfession,
                guarantorNumber,
                guarantorRelationship,
                guarantorAddress,
                guarantorEmail,
                guarantorNIN,
                sub,
                isOnline: false,
                isApproved: false,
            })
            );

            setDbUser(courier);

        } catch (e) {
            Alert.alert("Error", e.message);
        } finally {
            setUploading(false);
        }
    };

    const updateCourier = async () => {
        if (uploading) return;
        setUploading(true);
        try{
            let uploadedProfilePic = dbUser?.profilePic;
            
            const uploadedMaxiImages = await uploadMaxiImages();
            let uploadedCourierNINImage = dbUser?.courierNINImage;
            let uploadedGuarantorNINImage = dbUser?.guarantorNINImage;

            // Only uploads if changed; deletes if replaced

            // Only upload if profilePic changed
            if (profilePic && profilePic !== dbUser?.profilePic) {
            // 1️⃣ Upload first
            uploadedProfilePic = await uploadSingleImage(profilePic, "profilePhoto");

            // 2️⃣ Delete old AFTER successful upload
            if (dbUser?.profilePic) {
                await remove({ path: dbUser.profilePic });
            }
            }

            // courierNIN Image
            if (courierNINImage && courierNINImage !== dbUser?.courierNINImage) {
            uploadedCourierNINImage = await uploadSingleImage(courierNINImage, "courierNIN");
            if (dbUser?.courierNINImage) {
                await remove({ path: dbUser.courierNINImage });
            }
            }

            // guarantorNIN Image
            if (guarantorNINImage && guarantorNINImage !== dbUser?.guarantorNINImage) {
            uploadedGuarantorNINImage = await uploadSingleImage(guarantorNINImage, "guarantorNIN");
            if (dbUser?.guarantorNINImage) {
                await remove({ path: dbUser.guarantorNINImage });
            }
            }

            const courier = await DataStore.save(Courier.copyOf(dbUser, (updated)=>{
                updated.firstName = firstName;
                updated.lastName = lastName; 
                updated.profilePic = uploadedProfilePic;

                if (transportationType === "Maxi") {
                    updated.maxiImages = uploadedMaxiImages;
                    updated.maxiDescription = maxiDescription;
                } else {
                    updated.maxiImages = [];
                    updated.maxiDescription = "";
                }

                updated.transportationType = transportationType,
                updated.vehicleClass = vehicleClass,
                updated.model = model,
                updated.plateNumber = plateNumber,
                updated.address = address, 
                updated.landMark = landMark, 
                updated.email = userMail; 
                updated.phoneNumber = phoneNumber, 
                updated.courierNIN = courierNIN, 
                updated.courierNINImage = uploadedCourierNINImage,
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
                updated.guarantorNIN = guarantorNIN,
                updated.guarantorNINImage = uploadedGuarantorNINImage
            }))
            setDbUser(courier)
        }catch(e){
            Alert.alert('Error', e.message)
        }finally{
            setUploading(false);
        }
    }
    
    // Function to save
    const handleSave = async () => {
        if (!validateMaxiRequirements()) return

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
            <Text style={styles.inputReview}>{guarantorNIN}</Text>

            {/* NIN Image */}
            {guarantorNINImage && (
            <>
                <Text style={styles.subHeader}>Guarantor NIN Slip:</Text>
                <Image
                source={{ uri: guarantorNINImage }}
                style={styles.reviewNinImage}
                />
            </>
            )}
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