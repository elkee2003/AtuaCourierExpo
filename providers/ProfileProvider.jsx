import { View, Text } from 'react-native';
import React, {useState, useEffect, useContext, createContext} from 'react';
// import { getCurrentUser } from 'aws-amplify/auth';
// import { DataStore } from 'aws-amplify/datastore'
// import { Courier } from '@/src/models'
import { useAuthContext } from './AuthProvider';

const ProfileContext = createContext({})

const ProfileProvider = ({children}) => {

    const {dbUser} = useAuthContext()

    const [profilePic, setProfilePic] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [transportationType, setTransportationType] = useState("");
    const [address, setAddress] = useState("");
    const [landMark, setLandMark] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [courierNIN, setCourierNIN] = useState("");
    const [courierBVN, setCourierBVN] = useState("");
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
    const [lat, setLat] = useState("0");
    const [lng, setLng] = useState("0");
    const [heading, setHeading] = useState(heading);
    const [errorMessage, setErrorMessage] = useState('');

    // // Amplify states
    // const [authUser, setAuthUser] = useState(null);
    // const [dbUser, setDbUser] = useState(null);
    // const [sub, setSub] = useState(null); 

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
        if(!courierNIN){
          setErrorMessage('Your NIN is required')
          return false;
        }
        // if(!courierBVN){
        //   setErrorMessage('Your BVN is required')
        //   return false;
        // }
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

    const onValidateCourierInput = () =>{
        if(validateCourierInput()){
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
    useEffect(() => {
        if (dbUser) {
            setProfilePic(dbUser?.profilePic);
            setFirstName(dbUser.firstName || "");
            setLastName(dbUser.lastName || "");
            setTransportationType(dbUser.transportationType || "");
            setAddress(dbUser.address || "");
            setLandMark(dbUser.landMark || "");
            setPhoneNumber(dbUser.phoneNumber || "");
            setCourierNIN(dbUser.courierNIN || "");
            setCourierBVN(dbUser.courierBVN || "");
            setBankName(dbUser.bankName || "");
            setAccountName(dbUser.accountName || "");
            setAccountNumber(dbUser.accountNumber || "");
            setGuarantorName(dbUser.guarantorName || "");
            setGuarantorLastName(dbUser.guarantorLastName || "");
            setGuarantorProfession(dbUser.guarantorProfession || "");
            setGuarantorNumber(dbUser.guarantorNumber || "");
            setGuarantorRelationship(dbUser.guarantorRelationship || "");
            setGuarantorAddress(dbUser.guarantorAddress || "");
            setGuarantorEmail(dbUser.guarantorEmail || "");
            setGuarantorNIN(dbUser.guarantorNIN || "");
            setLat(dbUser.lat.toString() || "0");
            setLng(dbUser.lng.toString() || "0");
            setHeading(dbUser.heading || heading);
        }
    }, [dbUser]); // This effect runs whenever dbUser changes


  //   // Functions for useEffect
  //   const currentAuthenticatedUser = async () =>{
  //   try {
  //     const user = await getCurrentUser();
  //     setAuthUser(user)
  //     console.log('This is authuser:',user)
  //     const subId = authUser?.userId;
  //     setSub(subId);
  //     console.log('This is just subId raw:', subId);
  //     console.log('This is sub:',sub)
  //     console.log('This is dbuser from authcontext:', dbUser)
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // const dbCurrentUser = async () =>{
  //   try{
  //     const dbusercurrent = await DataStore.query(Courier, (courier)=>courier.sub.eq(sub))
  //     // DataStore.clear()
      
  //     setDbUser(dbusercurrent[0])
  //     console.log('This is current dbuser:',dbusercurrent)
  //   }catch(error){
  //     console.error('Error getting dbuser: ', error)
  //   }
  // }

  // useEffect(()=>{
  //   currentAuthenticatedUser()
  // },[sub])

  // useEffect(()=>{
  //   dbCurrentUser()
  // }, [sub,])

  return (
    <ProfileContext.Provider value={{
      firstName,setFirstName, lastName, setLastName, transportationType, setTransportationType, address, setAddress, phoneNumber, setPhoneNumber, errorMessage, setErrorMessage, profilePic, setProfilePic, landMark, setLandMark, courierNIN, setCourierNIN, courierBVN, setCourierBVN, bankName, setBankName, accountName, setAccountName, accountNumber, setAccountNumber, guarantorName, setGuarantorName, guarantorLastName, setGuarantorLastName, guarantorProfession, setGuarantorProfession, guarantorNumber, setGuarantorNumber, guarantorRelationship, setGuarantorRelationship, guarantorAddress, setGuarantorAddress, guarantorEmail, setGuarantorEmail, guarantorNIN, setGuarantorNIN, lat, setLat, lng, setLng, heading, setHeading,
      onValidateCourierInput, onValidateGuarantorInput, 
      }}>
        {children}
    </ProfileContext.Provider>
  )
}

export default ProfileProvider;

export const useProfileContext = () => useContext(ProfileContext);