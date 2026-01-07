import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import axios from "axios";
import RNPickerSelect from "react-native-picker-select";
import debounce from "lodash/debounce";
import Config from "react-native-config";
import { useProfileContext } from "@/providers/ProfileProvider";

const API_BASE_URL = Config.API_BASE_URL;

const BankDetailsScreen = () => {
  const [bankOptions, setBankOptions] = useState([]);
  const {bankCode, setBankCode, bankName, setBankName, accountName, setAccountName, accountNumber, setAccountNumber} = useProfileContext();
//   const [bankCode, setBankCode] = useState("");
//   const [bankName, setBankName] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STEP 5.1 — Fetch bank list
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bank`, {
          headers: { "X-APP": "atua" }
        });

        const banks = res?.data?.data || [];

        setBankOptions(
          banks.map(bank => ({
            label: bank.name,
            value: bank.code
          }))
        );
      } catch (err) {
        console.log("Failed to fetch banks", err);
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
            bank_code: bankCode
          },
          {
            headers: { "X-APP": "atua" }
          }
        );

        setAccountName(res.data.data.account_name);
      } catch (err) {
        setError("Unable to verify account");
        setAccountName("");
      } finally {
        setLoading(false);
      }
    }, 800),
    []
  );

  // STEP 5.3 — Trigger verification
  useEffect(() => {
    debouncedVerify(accountNumber, bankCode);
    return () => debouncedVerify.cancel();
  }, [accountNumber, bankCode]);

  return (
    <View style={styles.container}>
      {/* Bank Picker */}
      <RNPickerSelect
        placeholder={{ label: "Select bank", value: null }}
        items={bankOptions}
        onValueChange={(value) => {
          const bank = bankOptions.find(b => b.value === value);
          if (bank) {
            setBankCode(bank.value);
            setBankName(bank.label);
          }
        }}
      />

      {/* Account Number */}
      <TextInput
        style={styles.input}
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

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 15,
    padding: 10,
    borderRadius: 5
  },
  success: { color: "green", marginTop: 10 },
  error: { color: "red", marginTop: 10 }
});
