import React, { createContext, useContext, useEffect, useState } from "react";
// import { getCurrentUser } from 'aws-amplify/auth';
// import { DataStore } from 'aws-amplify/datastore'
// import { Courier } from '@/src/models'
import { useAuthContext } from "./AuthProvider";

const ProfileContext = createContext({});

const ProfileProvider = ({ children }) => {
  const { dbCourier } = useAuthContext();

  const [isOnline, setIsOnline] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [transportationType, setTransportationType] = useState("");
  const [vehicleClass, setVehicleClass] = useState(null);
  const [model, setModel] = useState("");
  const [vehicleColour, setVehicleColour] = useState(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [maxiImages, setMaxiImages] = useState("");
  const [maxiDescription, setMaxiDescription] = useState("");
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
  const [errorMessage, setErrorMessage] = useState("");

  // Courier Function Validation
  const validateCourierInput = () => {
    setErrorMessage("");
    if (!profilePic) {
      setErrorMessage("Profile Photo is required");
      return false;
    }
    if (!firstName) {
      setErrorMessage("First Name is required");
      return false;
    }
    if (!lastName) {
      setErrorMessage("Last Name is required");
      return false;
    }
    if (!transportationType) {
      setErrorMessage("Transportation type is required");
      return false;
    }
    if (!address) {
      setErrorMessage("Address is required");
      return false;
    }
    if (phoneNumber.length < 10) {
      setErrorMessage("Kindly fill in Phone Number");
      return false;
    }
    if (courierNIN.length < 9) {
      setErrorMessage("Your NIN is required");
      return false;
    }
    if (!courierNINImage) {
      setErrorMessage("Your NIN Image is required");
      return false;
    }
    if (!bankName) {
      setErrorMessage("Bank name is required ");
      return false;
    }
    if (!accountName) {
      setErrorMessage("Account name linked to bank is required");
      return false;
    }
    if (!accountNumber) {
      setErrorMessage("Account number is required");
      return false;
    }

    return true;
  };

  const validateVehicleInfo = () => {
    setErrorMessage("");

    // Moto
    if (transportationType === "MOTO") {
      if (!vehicleClass) {
        setErrorMessage("Vehicle type is required");
        return false;
      }
      if (!model) {
        setErrorMessage("Model is required");
        return false;
      }
      if (!vehicleColour) {
        setErrorMessage("Vehicle colour is required");
        return false;
      }
      if (!plateNumber) {
        setErrorMessage("Plate number is required");
        return false;
      }
    }

    // maxi verfication
    if (transportationType === "MAXI") {
      if (!vehicleClass) {
        setErrorMessage("Vehicle class is required");
        return false;
      }
      if (!model) {
        setErrorMessage("Model is required");
        return false;
      }
      if (!vehicleColour) {
        setErrorMessage("Vehicle colour is required");
        return false;
      }
      if (!plateNumber) {
        setErrorMessage("Plate number is required");
        return false;
      }
      if (!maxiDescription) {
        setErrorMessage("Vehicle description is required");
        return false;
      }
      if (maxiImages?.length < 3) {
        setErrorMessage("Kindly select at least 3 images");
        return false;
      }
    }
    return true;
  };

  const onValidateCourierInput = () => {
    if (validateCourierInput() && validateVehicleInfo()) {
      return true;
    } else {
      return false;
    }
  };

  // Guarantor function validation
  const validateGuarantorInput = () => {
    setErrorMessage("");
    if (!guarantorName) {
      setErrorMessage("Guarantor's first name is required");
      return false;
    }
    if (!guarantorLastName) {
      setErrorMessage("Guarantor's last Name is required");
      return false;
    }
    if (!guarantorProfession) {
      setErrorMessage("Guarantor's Profession is required");
      return false;
    }
    if (!guarantorAddress) {
      setErrorMessage("Guarantor's Address is required");
      return false;
    }
    if (guarantorNumber.length < 10) {
      setErrorMessage("Guarantor's number is required");
      return false;
    }
    if (guarantorNIN.length < 9) {
      setErrorMessage("Guarantor NIN is required");
      return false;
    }
    if (!guarantorRelationship) {
      setErrorMessage("Relationship with Guarantor is required");
      return false;
    }
    return true;
  };

  const onValidateGuarantorInput = () => {
    if (validateGuarantorInput()) {
      return true;
    } else {
      return false;
    }
  };

  // useEffect for setting transportation type
  useEffect(() => {
    if (transportationType === "Micro") {
      setVehicleClass(null);
      setModel(null);
      setVehicleColour(null);
      setPlateNumber(null);
      setMaxiImages(null);
    }

    if (transportationType === "Moto") {
      setMaxiImages(null);
    }
  }, [transportationType]);

  // useEffect for setting dbCourier
  useEffect(() => {
    if (dbCourier) {
      setIsOnline(dbCourier?.isOnline || false);
      setProfilePic(dbCourier?.profilePic);
      setFirstName(dbCourier?.firstName || "");
      setLastName(dbCourier?.lastName || "");
      setTransportationType(dbCourier.transportationType || "");
      setVehicleClass(dbCourier?.vehicleClass || "");
      setModel(dbCourier?.model || "");
      setVehicleColour(dbCourier?.vehicleColour || "");
      setPlateNumber(dbCourier.plateNumber || "");
      setMaxiImages(dbCourier?.maxiImages || []);
      setMaxiDescription(dbCourier?.maxiDescription || "");
      setAddress(dbCourier?.address || "");
      setLandMark(dbCourier?.landMark || "");
      setPhoneNumber(dbCourier?.phoneNumber || "");
      setCourierNIN(dbCourier?.courierNIN || "");
      setCourierNINImage(dbCourier?.courierNINImage || "");
      setBankCode(dbCourier?.bankCode || "");
      setBankName(dbCourier?.bankName || "");
      setAccountName(dbCourier?.accountName || "");
      setAccountNumber(dbCourier?.accountNumber || "");
      setGuarantorName(dbCourier?.guarantorName || "");
      setGuarantorLastName(dbCourier?.guarantorLastName || "");
      setGuarantorProfession(dbCourier?.guarantorProfession || "");
      setGuarantorNumber(dbCourier?.guarantorNumber || "");
      setGuarantorRelationship(dbCourier?.guarantorRelationship || "");
      setGuarantorAddress(dbCourier?.guarantorAddress || "");
      setGuarantorEmail(dbCourier?.guarantorEmail || "");
      setGuarantorNIN(dbCourier?.guarantorNIN || "");
      setGuarantorNINImage(dbCourier?.guarantorNINImage || "");
      setLat(dbCourier?.lat?.toString() || "0");
      setLng(dbCourier?.lng?.toString() || "0");
      setHeading(dbCourier.heading || heading);
    }
  }, [dbCourier]); // This effect runs whenever dbCourier changes

  return (
    <ProfileContext.Provider
      value={{
        isOnline,
        setIsOnline,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        transportationType,
        setTransportationType,
        vehicleClass,
        setVehicleClass,
        model,
        setModel,
        vehicleColour,
        setVehicleColour,
        plateNumber,
        setPlateNumber,
        maxiImages,
        setMaxiImages,
        maxiDescription,
        setMaxiDescription,
        validateVehicleInfo,
        address,
        setAddress,
        phoneNumber,
        setPhoneNumber,
        errorMessage,
        setErrorMessage,
        profilePic,
        setProfilePic,
        landMark,
        setLandMark,
        courierNIN,
        setCourierNIN,
        courierNINImage,
        setCourierNINImage,
        bankCode,
        setBankCode,
        bankName,
        setBankName,
        accountName,
        setAccountName,
        accountNumber,
        setAccountNumber,
        guarantorName,
        setGuarantorName,
        guarantorLastName,
        setGuarantorLastName,
        guarantorProfession,
        setGuarantorProfession,
        guarantorNumber,
        setGuarantorNumber,
        guarantorRelationship,
        setGuarantorRelationship,
        guarantorAddress,
        setGuarantorAddress,
        guarantorEmail,
        setGuarantorEmail,
        guarantorNIN,
        setGuarantorNIN,
        guarantorNINImage,
        setGuarantorNINImage,
        lat,
        setLat,
        lng,
        setLng,
        heading,
        setHeading,
        onValidateCourierInput,
        onValidateGuarantorInput,
        validateVehicleInfo,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;

export const useProfileContext = () => useContext(ProfileContext);
