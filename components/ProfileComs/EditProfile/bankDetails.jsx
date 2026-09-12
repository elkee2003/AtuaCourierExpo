import { useProfileContext } from "@/providers/ProfileProvider";
import axios from "axios";
import Constants from "expo-constants";
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

/*
 * ============================================================
 * THEME-AWARE SHARED STYLES
 * ============================================================
 *
 * IMPORTANT:
 *
 * The shared styles.js exports:
 *
 *     createStyles(isDark)
 *
 * rather than relying on one static stylesheet object.
 *
 * Therefore this component creates its stylesheet using the
 * current device colour scheme.
 *
 * This also fixes errors such as:
 *
 *     TypeError: Cannot read property 'bankContainer' of undefined
 *
 * because `styles` will always be the actual StyleSheet object
 * returned by createStyles().
 */
import { createStyles } from "./styles";

/**
 * ============================================================
 * API CONFIGURATION
 * ============================================================
 *
 * We keep the existing API configuration.
 *
 * GET:
 *     /bank
 *
 * POST:
 *     /resolve-account
 *
 * The existing:
 *
 *     X-APP: atua
 *
 * header is also preserved.
 */
const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  Constants.manifest?.extra?.API_BASE_URL;

/**
 * ============================================================
 * BANK DETAILS
 * ============================================================
 *
 * This component handles:
 *
 * 1. Loading available banks
 * 2. Searching for a bank
 * 3. Selecting a bank
 * 4. Entering a 10-digit account number
 * 5. Resolving the account name
 * 6. Showing verification feedback
 *
 * IMPORTANT:
 * ------------------------------------------------------------
 * This is an embedded component inside the Edit Profile screen.
 *
 * Therefore, unlike the full-screen profile screens, we do NOT
 * use SafeAreaView here.
 *
 * The parent screen is responsible for safe-area handling.
 */
const BankDetailsScreen = () => {
  /* ============================================================
     THEME
     ============================================================ */

  /*
   * Detect the device's current appearance.
   *
   * Possible values:
   *
   *     "light"
   *     "dark"
   *     null
   */
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";

  /*
   * Create the active stylesheet.
   *
   * useMemo prevents the stylesheet from being unnecessarily
   * recreated on every normal component render.
   */
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  /**
   * ============================================================
   * TEXT INPUT COLORS
   * ============================================================
   *
   * TextInput text and placeholder colours are explicitly
   * supplied because these values are not automatically
   * controlled by the StyleSheet.
   *
   * DARK MODE:
   * - Entered text = bright white
   * - Placeholder = visible muted gray
   *
   * LIGHT MODE:
   * - Entered text = dark
   * - Placeholder = medium gray
   */
  const inputColors = useMemo(
    () => ({
      text: isDark ? "#F5F7FA" : "#171A1F",
      placeholder: isDark ? "#8F98A8" : "#858B95",
      selection: isDark ? "#FFFFFF" : "#111111",
    }),
    [isDark],
  );

  /* ============================================================
     STATE
     ============================================================ */

  /*
   * Banks returned by the API and formatted for
   * AutocompleteDropdown.
   */
  const [bankOptions, setBankOptions] = useState([]);

  /*
   * Text currently visible inside the bank search field.
   */
  const [bankQuery, setBankQuery] = useState("");

  /*
   * Loading state used while resolving the account.
   */
  const [loading, setLoading] = useState(false);

  /*
   * Account verification error.
   */
  const [error, setError] = useState("");

  /* ============================================================
     PROFILE CONTEXT
     ============================================================ */

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

  /* ============================================================
     INITIAL BANK VALUE
     ============================================================
     
     When editing an existing courier profile, the bank name may
     already exist in ProfileContext.

     If the search field is empty, populate it with the saved
     bank name.
     */

  useEffect(() => {
    if (bankName && !bankQuery) {
      setBankQuery(bankName);
    }
  }, [bankName, bankQuery]);

  /* ============================================================
     FETCH BANK LIST
     ============================================================ */

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is missing");
      return;
    }

    let mounted = true;

    const fetchBanks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bank`, {
          headers: {
            "X-APP": "atua",
          },
        });

        /*
         * Protect against the component being unmounted before
         * the request finishes.
         */
        if (!mounted) return;

        const banks = res?.data?.data || [];

        /*
         * ======================================================
         * IMPORTANT: REMOVE DUPLICATE BANK KEYS
         * ======================================================
         *
         * AutocompleteDropdown uses the `id` of each item as
         * part of its React identity/key handling.
         *
         * If the API returns two records with the same bank code,
         * React can produce:
         *
         *     Encountered two children with the same key
         *
         * For example:
         *
         *     { code: "50572", name: "Some Bank" }
         *     { code: "50572", name: "Some Bank" }
         *
         * We therefore use a Map keyed by the bank code.
         *
         * This guarantees that each bank code appears only once
         * in the dropdown.
         */
        const uniqueBanks = Array.from(
          new Map(
            banks
              .filter((bank) => bank?.code && bank?.name)
              .map((bank) => [
                String(bank.code),
                {
                  id: String(bank.code),
                  title: String(bank.name),
                },
              ]),
          ).values(),
        );

        setBankOptions(uniqueBanks);
      } catch (err) {
        console.log("Failed to fetch banks:", err?.response || err);
      }
    };

    fetchBanks();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     ACCOUNT VERIFICATION
     ============================================================ */

  /*
   * The API should not be called on every keystroke.
   *
   * Instead, debounce the verification request by 800ms.
   *
   * The verification only happens when:
   *
   * 1. The account number contains exactly 10 digits.
   * 2. A bank has been selected.
   */
  const debouncedVerify = useCallback(
    debounce(async (number, code) => {
      /*
       * Do not attempt account verification until:
       *
       * 1. Exactly 10 digits have been entered.
       * 2. A bank has been selected.
       */
      if (number.length !== 10 || !code) {
        setAccountName("");
        setError("");
        setLoading(false);

        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await axios.post(
          `${API_BASE_URL}/resolve-account`,
          {
            account_number: number,
            bank_code: code,
          },
          {
            headers: {
              "X-APP": "atua",
            },
          },
        );

        const resolvedAccountName = res?.data?.data?.account_name;

        /*
         * The API responded successfully but did not provide
         * an account name.
         */
        if (!resolvedAccountName) {
          setAccountName("");

          setError("We couldn't find an account name for these details.");

          return;
        }

        /*
         * Successful account verification.
         */
        setAccountName(resolvedAccountName);
      } catch (err) {
        console.log("Account verification failed:", err?.response || err);

        setAccountName("");

        setError(
          "We couldn't verify this account. Check the bank and account number.",
        );
      } finally {
        setLoading(false);
      }
    }, 800),
    [],
  );

  /* ============================================================
     TRIGGER ACCOUNT VERIFICATION
     ============================================================ */

  useEffect(() => {
    debouncedVerify(accountNumber || "", bankCode);

    /*
     * Cancel the pending debounced request whenever the
     * component is cleaned up or the dependencies change.
     */
    return () => {
      debouncedVerify.cancel();
    };
  }, [accountNumber, bankCode, debouncedVerify]);

  /* ============================================================
     ACCOUNT NUMBER HANDLER
     ============================================================ */

  const handleAccountNumberChange = (text) => {
    /*
     * Only allow numbers.
     *
     * Maximum:
     *     10 digits
     */
    if (!/^\d{0,10}$/.test(text)) {
      return;
    }

    setAccountNumber(text);

    /*
     * Clear the previous verification error as soon as the
     * user starts correcting the account number.
     */
    if (error) {
      setError("");
    }

    /*
     * If the account number is no longer complete, the account
     * name should not continue to look verified.
     *
     * The debounced verification effect will also handle this,
     * but clearing immediately gives the UI a more responsive
     * feel.
     */
    if (text.length !== 10 && accountName) {
      setAccountName("");
    }
  };

  /* ============================================================
     BANK SELECTION
     ============================================================ */

  const handleBankSelect = (item) => {
    if (!item) return;

    /*
     * Save the selected bank into ProfileContext.
     */
    setBankCode(item.id);

    setBankName(item.title);

    setBankQuery(item.title);

    /*
     * A bank change invalidates the previous account
     * verification.
     */
    setAccountName("");

    setError("");
  };

  /* ============================================================
     ACCOUNT NUMBER PROGRESS
     ============================================================ */

  const accountDigits = accountNumber?.length || 0;

  const accountComplete = accountDigits === 10;

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <View style={styles.bankContainer}>
      {/* ======================================================
          BANK SELECTOR
      ====================================================== */}

      <View style={styles.bankFieldGroup}>
        {/* ----------------------------------------------------
            LABEL
        ---------------------------------------------------- */}

        <View style={styles.bankFieldLabelRow}>
          <View style={styles.bankFieldLabelContent}>
            {/* Bank icon */}

            <View style={styles.bankFieldIconContainer}>
              <Text style={styles.bankFieldIcon}>₦</Text>
            </View>

            {/* Label and description */}

            <View>
              <Text style={styles.bankFieldLabel}>Bank</Text>

              <Text style={styles.bankFieldDescription}>
                Select your payout bank
              </Text>
            </View>
          </View>

          {/* Selected badge */}

          {bankCode && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>Selected</Text>
            </View>
          )}
        </View>

        {/* ----------------------------------------------------
            BANK AUTOCOMPLETE
        ---------------------------------------------------- */}

        {/*
         * AutocompleteDropdown contains its own internal
         * TextInput.
         *
         * We intentionally do NOT wrap it in another TextInput.
         *
         * The outer `autocompleteContainer` is only a View-style
         * container supplied to the dropdown library.
         */}
        <AutocompleteDropdown
          clearOnFocus={false}
          closeOnBlur={true}
          closeOnSubmit={false}
          dataSet={bankOptions}
          containerStyle={styles.autocompleteContainer}
          inputContainerStyle={styles.inputContainerStyle}
          suggestionsListContainerStyle={styles.autocompleteList}
          rightButtonsContainerStyle={styles.rightButtonsContainerStyle}
          ChevronColor={isDark ? "#AAB2C0" : "#555D68"}
          inputValue={bankQuery}
          onChangeText={(text) => {
            setBankQuery(text);

            /*
             * If the user starts typing something different
             * from the currently selected bank, clear the
             * previous bank selection.
             *
             * This prevents the bank code from silently referring
             * to a different bank than the visible search text.
             */
            if (bankCode && text !== bankName) {
              setBankCode("");

              setBankName("");

              setAccountName("");

              setError("");
            }
          }}
          onSelectItem={handleBankSelect}
          textInputProps={{
            placeholder: "Search for your bank",
            placeholderTextColor: inputColors.placeholder,
            autoCorrect: false,
            autoCapitalize: "words",
            selectionColor: inputColors.selection,

            /*
             * Explicitly set the text colour.
             *
             * This is especially important in dark mode because
             * the entered bank name must remain clearly visible
             * against the dark input background.
             */
            style: [
              styles.autocompleteInput,
              {
                color: inputColors.text,
              },
            ],
          }}
        />
      </View>

      {/* ======================================================
          ACCOUNT NUMBER
      ====================================================== */}

      <View style={styles.bankFieldGroup}>
        {/* ----------------------------------------------------
            ACCOUNT LABEL
        ---------------------------------------------------- */}

        <View style={styles.bankFieldLabelRow}>
          <View style={styles.bankFieldLabelContent}>
            <View style={styles.bankFieldIconContainer}>
              <Text style={styles.bankFieldIcon}>#</Text>
            </View>

            <View>
              <Text style={styles.bankFieldLabel}>Account number</Text>

              <Text style={styles.bankFieldDescription}>
                Enter the account you want to receive payouts with
              </Text>
            </View>
          </View>

          {/* Character counter */}

          <Text style={styles.accountCounter}>{accountDigits}/10</Text>
        </View>

        {/* ----------------------------------------------------
            ACCOUNT INPUT
        ---------------------------------------------------- */}

        {/*
         * This is the ONLY TextInput for the account number.
         *
         * The surrounding View is not another TextInput.
         *
         * It only exists so we can display the verification
         * spinner or verified check on the right side.
         */}
        <View
          style={[
            styles.accountInputWrapper,
            accountComplete && styles.accountInputWrapperComplete,
            error && styles.accountInputWrapperError,
          ]}
        >
          <TextInput
            style={[
              styles.bankLastInput,
              {
                color: inputColors.text,
              },
            ]}
            placeholder="0000000000"
            placeholderTextColor={inputColors.placeholder}
            keyboardType="number-pad"
            maxLength={10}
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
            selectionColor={inputColors.selection}
          />

          {/* ------------------------------------------------
              VERIFICATION SPINNER
          ------------------------------------------------ */}

          {loading && (
            <View style={styles.accountStatusIcon}>
              <ActivityIndicator
                size="small"
                color={isDark ? "#FFFFFF" : "#111111"}
              />
            </View>
          )}

          {/* ------------------------------------------------
              VERIFIED CHECK
          ------------------------------------------------ */}

          {!loading && accountName && !error && (
            <View style={styles.accountVerifiedIcon}>
              <Text style={styles.accountVerifiedCheck}>✓</Text>
            </View>
          )}
        </View>
      </View>

      {/* ======================================================
          VERIFICATION STATUS
      ====================================================== */}

      {/* ------------------------------------------------------
          LOADING
      ------------------------------------------------------ */}

      {loading && (
        <View style={styles.bankFeedbackCard}>
          <View style={styles.bankFeedbackIconContainer}>
            <ActivityIndicator
              size="small"
              color={isDark ? "#FFFFFF" : "#111111"}
            />
          </View>

          <View style={styles.bankFeedbackContent}>
            <Text style={styles.bankFeedbackTitle}>Verifying account</Text>

            <Text style={styles.bankFeedbackDescription}>
              We're confirming the account details with your bank.
            </Text>
          </View>
        </View>
      )}

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {!loading && accountName && !error && (
        <View style={[styles.bankFeedbackCard, styles.bankSuccessCard]}>
          <View
            style={[
              styles.bankFeedbackIconContainer,
              styles.bankSuccessIconContainer,
            ]}
          >
            <Text style={styles.bankSuccessCheck}>✓</Text>
          </View>

          <View style={styles.bankFeedbackContent}>
            <View style={styles.bankSuccessTitleRow}>
              <Text style={styles.bankFeedbackTitle}>Account verified</Text>

              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
              </View>
            </View>

            <Text style={styles.accountNameValue}>{accountName}</Text>

            <Text style={styles.bankFeedbackDescription}>
              This account is ready to receive courier payouts.
            </Text>
          </View>
        </View>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <View style={[styles.bankFeedbackCard, styles.bankErrorCard]}>
          <View
            style={[
              styles.bankFeedbackIconContainer,
              styles.bankErrorIconContainer,
            ]}
          >
            <Text style={styles.bankErrorIcon}>!</Text>
          </View>

          <View style={styles.bankFeedbackContent}>
            <Text style={styles.bankFeedbackTitle}>Verification failed</Text>

            <Text style={styles.bankFeedbackDescription}>{error}</Text>
          </View>
        </View>
      )}

      {/* ======================================================
          SECURITY NOTE
      ====================================================== */}

      <View style={styles.bankSecurityNote}>
        <Text style={styles.bankSecurityIcon}>🔒</Text>

        <Text style={styles.bankSecurityText}>
          Your bank details are securely used for courier payout processing.
        </Text>
      </View>
    </View>
  );
};

export default BankDetailsScreen;
