import { useProfileContext } from "@/providers/ProfileProvider";
import axios from "axios";
import Constants from "expo-constants";
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import styles from './styles';
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  Constants.manifest?.extra?.API_BASE_URL;

const BankDetailsScreen = () => {
  const [bankOptions, setBankOptions] = useState([]);
  const [bankQuery, setBankQuery] = useState("");

  const {
    bankCode,
    setBankCode,
    bankName,
    setBankName,
    accountName,
    setAccountName,
    accountNumber,
    setAccountNumber,
  } = useProfileContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
  }, []);

  // STEP 5.1 — Fetch bank list
  useEffect(() => {
    if (!API_BASE_URL) {
      console.error("❌ API_BASE_URL is missing");
      return;
    }

    const fetchBanks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bank`, {
          headers: { "X-APP": "atua" },
        });

        const banks = res?.data?.data || [];

        setBankOptions(
          banks.map((bank) => ({
            id: bank.code,
            title: bank.name,
          })),
        );
      } catch (err) {
        console.log("Failed to fetch banks", err?.response || err);
      }
    };

    fetchBanks();
  }, []);

  // STEP 5.2 — Debounced verification
  const debouncedVerify = useCallback(
    debounce(async (accountNumber, bankCode) => {
      if (accountNumber.length !== 10 || !bankCode) {
        setAccountName("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await axios.post(
          `${API_BASE_URL}/resolve-account`,
          {
            account_number: accountNumber,
            bank_code: bankCode,
          },
          {
            headers: { "X-APP": "atua" },
          },
        );

        setAccountName(res.data.data.account_name);
      } catch (err) {
        setError("Unable to verify account");
        setAccountName("");
      } finally {
        setLoading(false);
      }
    }, 800),
    [],
  );

  // STEP 5.3 — Trigger verification
  useEffect(() => {
    debouncedVerify(accountNumber, bankCode);
    return () => debouncedVerify.cancel();
  }, [accountNumber, bankCode]);

  return (
    <View style={styles.bankContainer}>
      {/* Bank Picker */}
      <AutocompleteDropdown
        clearOnFocus={false}
        closeOnBlur={true}
        closeOnSubmit={false}
        dataSet={bankOptions}
        containerStyle={styles.autocompleteContainer}
        inputContainerStyle={
          styles.inputContainerStyle
        }
        suggestionsListContainerStyle={styles.autocompleteList}
        rightButtonsContainerStyle={
          styles.rightButtonsContainerStyle
        }
        ChevronColor="#000"

        inputValue={bankQuery}
        onChangeText={(text) => {
          setBankQuery(text);
        }}

        onSelectItem={(item) => {
          if (item) {
            setBankCode(item.id);
            setBankName(item.title);
            setBankQuery(item.title); // 👈 show selected bank
          }
        }}

        textInputProps={{
          placeholder: "Type bank name",
          autoCorrect: false,
          autoCapitalize: "none",
          style: styles.autocompleteInput,
        }}
      />

      {/* Account Number */}
      <TextInput
        style={styles.bankLastInput}
        placeholder="Account number"
        keyboardType="number-pad"
        value={accountNumber}
        onChangeText={(text) => {
          if (/^\d{0,10}$/.test(text)) {
            setAccountNumber(text);
          }
        }}
      />

      {/* Feedback */}
      {loading && <Text>Verifying...</Text>}
      {accountName && !loading && (
        <Text style={styles.success}>{accountName}</Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default BankDetailsScreen;
