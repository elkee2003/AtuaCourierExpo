import Ionicons from "@expo/vector-icons/Ionicons";
import { generateClient } from "aws-amplify/api";
import { DataStore } from "aws-amplify/datastore";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Courier, Wallet } from "@/src/models";

import styles from "./styles";

/*
==========================================================
AMPLIFY API CLIENT
==========================================================
*/

const client = generateClient();

/*
==========================================================
PAYOUT RULES
==========================================================
*/

const MINIMUM_PAYOUT = 1000;

/*
==========================================================
PAYOUT METHOD
==========================================================
*/

const PAYOUT_METHOD = "BANK_TRANSFER";

/*
==========================================================
HELPERS
==========================================================
*/

const formatCurrency = (amount = 0) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatShortCurrency = (amount = 0) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return "—";
  }

  return `•••• ${String(accountNumber).slice(-4)}`;
};

/*
==========================================================
GET CURRENT COURIER ID
==========================================================

IMPORTANT:

Replace this function with however your app currently
gets the authenticated courier ID.

If you already have a CourierProvider/AuthProvider,
use that instead of querying all couriers.

The function below assumes the Courier model has
an owner/user identifier.

==========================================================
*/

const getCurrentCourier = async () => {
  /*
  --------------------------------------------------------
  OPTION 1

  If your Courier model has an `owner` field and your
  auth setup automatically scopes it to the current user,
  this query can be used.

  --------------------------------------------------------
  */

  const couriers = await DataStore.query(Courier);

  if (!couriers || couriers.length === 0) {
    return null;
  }

  /*
  --------------------------------------------------------
  TEMPORARY SAFE FALLBACK

  If your app already has a CourierProvider, replace
  this entire function with the provider's courier.

  DO NOT leave a hard-coded courier ID here.
  --------------------------------------------------------
  */

  return couriers[0];
};

/*
==========================================================
REQUEST PAYOUT MUTATION
==========================================================

IMPORTANT:

The exact GraphQL/Lambda operation name depends on the
Lambda/API wiring in your project.

This is the client-side mutation shape.

Your Lambda should receive:

    courierID
    requestedAmount
    payoutMethod

The Lambda then performs the secure payout process.

==========================================================
*/

const REQUEST_PAYOUT = /* GraphQL */ `
  mutation RequestPayout(
    $courierID: ID!
    $requestedAmount: Float
    $payoutMethod: String
  ) {
    requestPayout(
      courierID: $courierID
      requestedAmount: $requestedAmount
      payoutMethod: $payoutMethod
    ) {
      id
      status
      amount
      reference
    }
  }
`;

/*
==========================================================
COMPONENT
==========================================================
*/

const RequestPayout = () => {
  /*
  ========================================================
  STATE
  ========================================================
  */

  const [courier, setCourier] = useState(null);

  const [wallet, setWallet] = useState(null);

  const [amount, setAmount] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  /*
  ========================================================
  LOAD COURIER
  ========================================================
  */

  const fetchCourier = useCallback(async () => {
    const currentCourier = await getCurrentCourier();

    if (!currentCourier) {
      throw new Error("Courier account could not be found.");
    }

    setCourier(currentCourier);

    return currentCourier;
  }, []);

  /*
  ========================================================
  LOAD WALLET
  ========================================================
  */

  const fetchWallet = useCallback(async (courierRecord) => {
    if (!courierRecord?.id) {
      throw new Error("Courier ID is missing.");
    }

    /*
        --------------------------------------------------
        Your Wallet model should have courierID.

        If your schema uses a different field name,
        change only this predicate.
        --------------------------------------------------
        */

    const wallets = await DataStore.query(Wallet, (walletQuery) =>
      walletQuery.courierID.eq(courierRecord.id),
    );

    const currentWallet = wallets?.[0] || null;

    if (!currentWallet) {
      throw new Error("Courier wallet could not be found.");
    }

    setWallet(currentWallet);

    return currentWallet;
  }, []);

  /*
  ========================================================
  LOAD EVERYTHING
  ========================================================
  */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const currentCourier = await fetchCourier();

      await fetchWallet(currentCourier);
    } catch (error) {
      console.error("Request payout load error:", error);

      Alert.alert(
        "Unable to load payout",
        error?.message || "We couldn't load your payout information.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchCourier, fetchWallet]);

  /*
  ========================================================
  INITIAL LOAD
  ========================================================
  */

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
  ========================================================
  LIVE WALLET UPDATE
  ========================================================
  */

  useEffect(() => {
    if (!courier?.id) {
      return undefined;
    }

    const subscription = DataStore.observe(Wallet).subscribe(
      ({ opType, element }) => {
        if (!["INSERT", "UPDATE", "DELETE"].includes(opType)) {
          return;
        }

        if (element?.courierID !== courier.id) {
          return;
        }

        setWallet(element);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [courier?.id]);

  /*
  ========================================================
  REFRESH
  ========================================================
  */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const currentCourier = await fetchCourier();

      await fetchWallet(currentCourier);
    } catch (error) {
      console.error("Request payout refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCourier, fetchWallet]);

  /*
  ========================================================
  AVAILABLE BALANCE
  ========================================================
  */

  const availableBalance = Number(wallet?.availableBalance || 0);

  /*
  ========================================================
  PARSED AMOUNT
  ========================================================
  */

  const numericAmount = useMemo(() => {
    const cleaned = String(amount)
      .replace(/,/g, "")
      .replace(/[^\d.]/g, "");

    const parsed = Number(cleaned);

    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  /*
  ========================================================
  REMAINING BALANCE
  ========================================================
  */

  const remainingBalance = Math.max(availableBalance - numericAmount, 0);

  /*
  ========================================================
  VALIDATION
  ========================================================
  */

  const validationMessage = useMemo(() => {
    if (!amount) {
      return null;
    }

    if (numericAmount <= 0) {
      return "Enter an amount to withdraw.";
    }

    if (numericAmount < MINIMUM_PAYOUT) {
      return `Minimum payout is ${formatShortCurrency(MINIMUM_PAYOUT)}.`;
    }

    if (numericAmount > availableBalance) {
      return "You don't have enough available balance.";
    }

    return null;
  }, [amount, numericAmount, availableBalance]);

  /*
  ========================================================
  CAN SUBMIT
  ========================================================
  */

  const canSubmit =
    !loading &&
    !submitting &&
    !!courier &&
    !!wallet &&
    numericAmount >= MINIMUM_PAYOUT &&
    numericAmount <= availableBalance;

  /*
  ========================================================
  AMOUNT INPUT
  ========================================================
  */

  const handleAmountChange = (value) => {
    let cleaned = value.replace(/,/g, "");

    cleaned = cleaned.replace(/[^\d.]/g, "");

    const parts = cleaned.split(".");

    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    setAmount(cleaned);
  };

  /*
  ========================================================
  QUICK AMOUNTS
  ========================================================
  */

  const handleQuickAmount = (value) => {
    if (value > availableBalance) {
      return;
    }

    setAmount(String(value));
  };

  const handleMaxAmount = () => {
    setAmount(String(availableBalance));
  };

  /*
  ========================================================
  CONTINUE
  ========================================================
  */

  const handleContinue = () => {
    if (!canSubmit) {
      return;
    }

    setShowConfirmation(true);
  };

  /*
  ========================================================
  REAL PAYOUT REQUEST
  ========================================================
  */

  const handleConfirmPayout = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      /*
        --------------------------------------------------
        RECHECK THE WALLET BEFORE SUBMITTING

        This is important because another operation may
        have changed the available balance since the
        screen opened.
        --------------------------------------------------
        */

      const freshWallet = await DataStore.query(Wallet, wallet.id);

      if (!freshWallet) {
        throw new Error("Your wallet could not be found.");
      }

      const freshBalance = Number(freshWallet.availableBalance || 0);

      if (numericAmount > freshBalance) {
        setWallet(freshWallet);

        setShowConfirmation(false);

        throw new Error(
          "Your available balance has changed. Please review the payout amount and try again.",
        );
      }

      /*
        --------------------------------------------------
        CALL SECURE BACKEND
        --------------------------------------------------

        The app does NOT:

          ❌ create Payout
          ❌ debit Wallet
          ❌ create Transaction
          ❌ call Paystack
          ❌ use Paystack secret key

        The backend does all of those.
        --------------------------------------------------
        */

      const response = await client.graphql({
        query: REQUEST_PAYOUT,

        variables: {
          courierID: courier.id,

          requestedAmount: numericAmount,

          payoutMethod: PAYOUT_METHOD,
        },
      });

      /*
        --------------------------------------------------
        GRAPHQL RESPONSE
        --------------------------------------------------
        */

      const result = response?.data?.requestPayout;

      if (!result?.id) {
        throw new Error("The payout request was not created.");
      }

      /*
        --------------------------------------------------
        CLOSE CONFIRMATION
        --------------------------------------------------
        */

      setShowConfirmation(false);

      /*
        --------------------------------------------------
        CLEAR AMOUNT
        --------------------------------------------------
        */

      setAmount("");

      /*
        --------------------------------------------------
        REFRESH WALLET

        Backend has already reserved the money.
        --------------------------------------------------
        */

      const updatedWallet = await DataStore.query(Wallet, wallet.id);

      if (updatedWallet) {
        setWallet(updatedWallet);
      }

      /*
        --------------------------------------------------
        SUCCESS
        --------------------------------------------------
        */

      Alert.alert(
        "Payout requested",
        `${formatCurrency(
          result.amount || numericAmount,
        )} has been submitted for payout.`,
        [
          {
            text: "View payout",
            onPress: () => {
              router.replace({
                pathname: "/wallet/payouts/[payoutId]",
                params: {
                  payoutId: String(result.id),
                },
              });
            },
          },
          {
            text: "Done",
            style: "cancel",
          },
        ],
      );
    } catch (error) {
      console.error("Request payout error:", error);

      /*
        --------------------------------------------------
        CLOSE CONFIRMATION
        --------------------------------------------------
        */

      setShowConfirmation(false);

      /*
        --------------------------------------------------
        EXTRACT USEFUL ERROR
        --------------------------------------------------
        */

      let message = "We couldn't submit your payout request. Please try again.";

      if (error?.errors?.length) {
        message = error.errors[0]?.message || message;
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert("Payout failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  /*
  ========================================================
  CANCEL
  ========================================================
  */

  const handleCancelConfirmation = () => {
    if (submitting) {
      return;
    }

    setShowConfirmation(false);
  };

  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#111827" />

          <Text style={styles.loadingText}>Loading payout information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  UI
  ========================================================
  */

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#111827"
            />
          }
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={21} color="#111827" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Request payout</Text>

              <Text style={styles.headerSubtitle}>
                Withdraw your available earnings
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          {/* =================================================
              AVAILABLE BALANCE
          ================================================= */}

          <View style={styles.balanceCard}>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE TO WITHDRAW</Text>

              <Text style={styles.balanceAmount}>
                {formatCurrency(availableBalance)}
              </Text>
            </View>

            <View style={styles.balanceIcon}>
              <Ionicons name="wallet-outline" size={25} color="#FFFFFF" />
            </View>
          </View>

          {/* =================================================
              AMOUNT
          ================================================= */}

          <Text style={styles.sectionTitle}>
            How much do you want to withdraw?
          </Text>

          <View
            style={[
              styles.amountCard,
              validationMessage && styles.amountCardError,
            ]}
          >
            <Text style={styles.amountLabel}>PAYOUT AMOUNT</Text>

            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>₦</Text>

              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="#CBD5E1"
                keyboardType="decimal-pad"
                style={styles.amountInput}
                maxLength={15}
              />
            </View>

            {validationMessage && (
              <View style={styles.validationRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={15}
                  color="#DC2626"
                />

                <Text style={styles.validationText}>{validationMessage}</Text>
              </View>
            )}

            {!validationMessage && numericAmount > 0 && (
              <Text style={styles.amountHint}>
                You'll have{" "}
                <Text style={styles.amountHintStrong}>
                  {formatCurrency(remainingBalance)}
                </Text>{" "}
                remaining in your wallet.
              </Text>
            )}
          </View>

          {/* =================================================
              QUICK AMOUNTS
          ================================================= */}

          <View style={styles.quickAmountRow}>
            {[5000, 10000, 20000].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.quickAmountButton,
                  numericAmount === value && styles.quickAmountButtonActive,
                  value > availableBalance && styles.quickAmountButtonDisabled,
                ]}
                onPress={() => handleQuickAmount(value)}
                disabled={value > availableBalance}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    numericAmount === value && styles.quickAmountTextActive,
                  ]}
                >
                  {formatShortCurrency(value)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.quickAmountButton,
                numericAmount === availableBalance &&
                  styles.quickAmountButtonActive,
              ]}
              onPress={handleMaxAmount}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.quickAmountText,
                  numericAmount === availableBalance &&
                    styles.quickAmountTextActive,
                ]}
              >
                Max
              </Text>
            </TouchableOpacity>
          </View>

          {/* =================================================
              DESTINATION ACCOUNT
          ================================================= */}

          <Text style={styles.sectionTitle}>Destination account</Text>

          <View style={styles.bankCard}>
            <View style={styles.bankIcon}>
              <Ionicons name="business-outline" size={22} color="#111827" />
            </View>

            <View style={styles.bankContent}>
              <View style={styles.bankNameRow}>
                <Text style={styles.bankName}>
                  {courier?.bankName || "Registered bank"}
                </Text>

                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />

                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              <Text style={styles.accountName}>
                {courier?.accountName || "Registered account"}
              </Text>

              <Text style={styles.accountNumber}>
                {maskAccountNumber(courier?.accountNumber)}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </View>

          {/* =================================================
              IMPORTANT INFORMATION
          ================================================= */}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#64748B"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Before you request</Text>

              <Text style={styles.infoText}>
                Payouts are sent to your registered bank account. Make sure your
                account details are correct before continuing.
              </Text>

              <Text style={styles.infoText}>
                Once processing begins, a payout may not be cancellable.
              </Text>
            </View>
          </View>

          {/* =================================================
              PAYOUT SUMMARY
          ================================================= */}

          {numericAmount > 0 && !validationMessage && (
            <>
              <Text style={styles.sectionTitle}>Payout summary</Text>

              <View style={styles.summaryCard}>
                <SummaryRow
                  label="Payout amount"
                  value={formatCurrency(numericAmount)}
                />

                <SummaryRow label="Payout fee" value="₦0.00" />

                <SummaryRow
                  label="You will receive"
                  value={formatCurrency(numericAmount)}
                  strong
                />

                <View style={styles.summaryDivider} />

                <SummaryRow
                  label="Remaining wallet balance"
                  value={formatCurrency(remainingBalance)}
                />
              </View>
            </>
          )}

          {/* =================================================
              REQUEST BUTTON
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.requestButton,
              !canSubmit && styles.requestButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={21}
              color={canSubmit ? "#FFFFFF" : "#94A3B8"}
            />

            <Text
              style={[
                styles.requestButtonText,
                !canSubmit && styles.requestButtonTextDisabled,
              ]}
            >
              Continue
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={canSubmit ? "#FFFFFF" : "#94A3B8"}
            />
          </TouchableOpacity>

          {/* =================================================
              FOOTER
          ================================================= */}

          <Text style={styles.footerText}>
            Minimum payout: {formatShortCurrency(MINIMUM_PAYOUT)}. Your
            available balance must be sufficient to complete the request.
          </Text>
        </ScrollView>

        {/* =================================================
            CONFIRMATION OVERLAY
        ================================================= */}

        {showConfirmation && (
          <View style={styles.confirmationOverlay}>
            <View style={styles.confirmationBackdrop} />

            <View style={styles.confirmationCard}>
              <View style={styles.confirmationHandle} />

              <View style={styles.confirmationIcon}>
                <Ionicons name="arrow-up-outline" size={27} color="#111827" />
              </View>

              <Text style={styles.confirmationTitle}>Confirm payout</Text>

              <Text style={styles.confirmationDescription}>
                You are about to withdraw the following amount to your
                registered bank account.
              </Text>

              <Text style={styles.confirmationAmount}>
                {formatCurrency(numericAmount)}
              </Text>

              <View style={styles.confirmationBank}>
                <Ionicons name="business-outline" size={19} color="#111827" />

                <View style={styles.confirmationBankContent}>
                  <Text style={styles.confirmationBankName}>
                    {courier?.bankName || "Registered bank"}
                  </Text>

                  <Text style={styles.confirmationBankAccount}>
                    {maskAccountNumber(courier?.accountNumber)}
                  </Text>
                </View>
              </View>

              <View style={styles.confirmationRemaining}>
                <Text style={styles.confirmationRemainingLabel}>
                  Remaining balance
                </Text>

                <Text style={styles.confirmationRemainingValue}>
                  {formatCurrency(remainingBalance)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmPayout}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />

                    <Text style={styles.confirmButtonText}>Submitting...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.confirmButtonText}>Confirm payout</Text>

                    <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelConfirmation}
                disabled={submitting}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/*
==========================================================
SUMMARY ROW
==========================================================
*/

const SummaryRow = ({ label, value, strong = false }) => {
  return (
    <View style={styles.summaryRow}>
      <Text
        style={[styles.summaryRowLabel, strong && styles.summaryRowLabelStrong]}
      >
        {label}
      </Text>

      <Text
        style={[styles.summaryRowValue, strong && styles.summaryRowValueStrong]}
      >
        {value}
      </Text>
    </View>
  );
};

export default RequestPayout;
