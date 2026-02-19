import { View, Text } from 'react-native';
import React, {useState, useEffect, useContext, createContext} from 'react';
// import { getCurrentUser } from 'aws-amplify/auth';
// import { DataStore } from 'aws-amplify/datastore'
// import { Courier } from '@/src/models'
import { useAuthContext } from './AuthProvider';

const ProfileContext = createContext({})

const ProfileProvider = ({children}) => {

    const {dbUser} = useAuthContext()

    const [isOnline, setIsOnline]= useState(false)
    const [profilePic, setProfilePic] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [transportationType, setTransportationType] = useState("");
    const [vehicleType, setVehicleType,] = useState("")
    const [model, setModel] = useState("")
    const [plateNumber, setPlateNumber] = useState("")
    const [images, setImages] = useState("")
    const [address, setAddress] = useState("");
    const [landMark, setLandMark] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [courierNIN, setCourierNIN] = useState("");
    const [courierNINImage, setCourierNINImage] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [guarantorName, setGuarantorName] = useState("");
    const [guarantorLastName, setGuarantorLastName] = useState("");
    const [guarantorProfession, setGuarantorProfession] = useState("");
    const [guarantorNumber, setGuarantorNumber] = useState("");
    const [guarantorRelationship, setGuarantorRelationship] = useState("");
    const [guarantorAddress, setGuarantorAddress] = useState("");
    const [guarantorEmail, setGuarantorEmail] = useState("");
    const [guarantorNIN, setGuarantorNIN] = useState("");
    const [guarantorNINImage, setGuarantorNINImage] = useState("");
    const [lat, setLat] = useState("0");
    const [lng, setLng] = useState("0");
    const [heading, setHeading] = useState(heading);
    const [errorMessage, setErrorMessage] = useState('');


    // Courier Function Validation
    const validateCourierInput = () =>{
        setErrorMessage('')
        if(!profilePic){
          setErrorMessage('Profile Photo is required')
          return false;
        }
        if(!firstName){
          setErrorMessage('First Name is required')
          return false;
        }
        if(!lastName){
          setErrorMessage('Last Name is required')
          return false;
        }
        if (!transportationType){
          setErrorMessage('Transportation type is required')
          return false;
        }
        if(!address){
          setErrorMessage('Address is required')
          return false;
        }
        if(phoneNumber.length < 10){
          setErrorMessage('Kindly fill in Phone Number')
          return false;
        }
        if(courierNIN.length < 9){
          setErrorMessage('Your NIN is required')
          return false;
        }
        if(!courierNINImage){
          setErrorMessage('Your NIN Image is required')
          return false;
        }
        if(!bankName){
          setErrorMessage('Bank name is required ')
          return false;
        }
        if(!accountName){
          setErrorMessage('Account name linked to bank is required')
          return false;
        }
        if (!accountNumber){
          setErrorMessage('Account number is required')
          return false;
        }

        return true;
    }

    const validatVehicleInfo =()=>{
      setErrorMessage('')

      // Moto
      if (transportationType === 'Moto') {
        if (!vehicleType) {
          setErrorMessage('Vehicle type is required')
          return false;
        }
        if (!model) {
          setErrorMessage('Model is required')
          return false;
        }
        if (!plateNumber) {
          setErrorMessage('Plate number is required')
          return false;
        }
      }

      // maxi verfication
      if (transportationType === 'Maxi') {
        if (!vehicleType) {
          setErrorMessage('Vehicle type is required')
          return false;
        }
        if (!model) {
          setErrorMessage('Model is required')
          return false;
        }
        if (!plateNumber) {
          setErrorMessage('Plate number is required')
          return false;
        }
        if (images?.length < 3) {
          setErrorMessage('Kindly select at least 3 images')
          return false;
        }
      }
      return true;
    }

    const onValidateCourierInput = () =>{
        if(validateCourierInput() && validatVehicleInfo()){
          return true;
        }else {
          return false;
        }
    }

    // Guarantor function validation
    const validateGuarantorInput = () =>{
      setErrorMessage('')
      if(!guarantorName){
        setErrorMessage("Guarantor's first name is required")
        return false;
      }
      if(!guarantorLastName){
        setErrorMessage("Guarantor's last Name is required")
        return false;
      }
      if(!guarantorProfession){
        setErrorMessage("Guarantor's Profession is required")
        return false;
      }
      if(!guarantorAddress){
        setErrorMessage("Guarantor's Address is required")
        return false;
      }
      if(guarantorNumber.length < 10){
        setErrorMessage("Guarantor's number is required")
        return false;
      }
      if(guarantorNIN.length < 9){
        setErrorMessage("Guarantor NIN is required")
        return false;
      }
      if(!guarantorRelationship){
        setErrorMessage("Relationship with Guarantor is required")
        return false;
      }
      return true;
    }

    const onValidateGuarantorInput = () =>{
        if(validateGuarantorInput()){
          return true;
        }else {
          return false;
        }
    }

    // useEffect for setting transportation type
    useEffect(() => {
      if (transportationType === 'Micro'){
        setVehicleType(null);
        setModel(null);
        setPlateNumber(null);
        setImages(null);
      }
    
      if (transportationType === 'Moto'){
        setImages(null);
      }
    }, [transportationType]);
    
    // useEffect for setting dbUser
    useEffect(() => {
        if (dbUser) {
            setIsOnline(dbUser?.isOnline || false)
            setProfilePic(dbUser?.profilePic);
            setFirstName(dbUser?.firstName || "");
            setLastName(dbUser?.lastName || "");
            setTransportationType(dbUser.transportationType || "");
            setVehicleType(dbUser?.vehicleType || "");
            setModel(dbUser?.model || "");
            setPlateNumber(dbUser.plateNumber || "");
            setAddress(dbUser?.address || "");
            setLandMark(dbUser?.landMark || "");
            setPhoneNumber(dbUser?.phoneNumber || "");
            setCourierNIN(dbUser?.courierNIN || "");
            setCourierNINImage(dbUser?.courierNINImage || "");
            setBankCode(dbUser?.bankCode || "");
            setBankName(dbUser?.bankName || "");
            setAccountName(dbUser?.accountName || "");
            setAccountNumber(dbUser?.accountNumber || "");
            setGuarantorName(dbUser?.guarantorName || "");
            setGuarantorLastName(dbUser?.guarantorLastName || "");
            setGuarantorProfession(dbUser?.guarantorProfession || "");
            setGuarantorNumber(dbUser?.guarantorNumber || "");
            setGuarantorRelationship(dbUser?.guarantorRelationship || "");
            setGuarantorAddress(dbUser?.guarantorAddress || "");
            setGuarantorEmail(dbUser?.guarantorEmail || "");
            setGuarantorNIN(dbUser?.guarantorNIN || "");
            setGuarantorNINImage(dbUser?.guarantorNINImage || "");
            setLat(dbUser?.lat?.toString() || "0");
            setLng(dbUser?.lng?.toString() || "0");
            setHeading(dbUser.heading || heading);
        }
    }, [dbUser]); // This effect runs whenever dbUser changes

  return (
    <ProfileContext.Provider value={{
      isOnline, setIsOnline,
      firstName, setFirstName, lastName, setLastName, transportationType, setTransportationType, vehicleType, setVehicleType, model, setModel, plateNumber, setPlateNumber,
      images, setImages, validatVehicleInfo,
      address, setAddress, phoneNumber, setPhoneNumber, errorMessage, setErrorMessage, profilePic, setProfilePic, landMark, setLandMark, courierNIN, setCourierNIN, courierNINImage, setCourierNINImage, bankCode, setBankCode,  bankName, setBankName, accountName, setAccountName, accountNumber, setAccountNumber, guarantorName, setGuarantorName, guarantorLastName, setGuarantorLastName, guarantorProfession, setGuarantorProfession, guarantorNumber, setGuarantorNumber, guarantorRelationship, setGuarantorRelationship, guarantorAddress, setGuarantorAddress, guarantorEmail, setGuarantorEmail, guarantorNIN, setGuarantorNIN, guarantorNINImage, setGuarantorNINImage, lat, setLat, lng, setLng, heading, setHeading,
      onValidateCourierInput, onValidateGuarantorInput, validatVehicleInfo,
      }}>
        {children}
    </ProfileContext.Provider>
  )
}

export default ProfileProvider;

export const useProfileContext = () => useContext(ProfileContext);