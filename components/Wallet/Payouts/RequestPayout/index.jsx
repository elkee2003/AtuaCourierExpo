import Ionicons from "@expo/vector-icons/Ionicons";
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
PAYOUT RULES
==========================================================

Courier-requested payout rules:

1. Minimum payout amount = ₦3,000
2. Payout fee depends on the requested amount
3. Courier receives the full requested payout amount
4. The Atua payout fee is additionally deducted
   from the courier wallet

Fee schedule:

₦3,000 – ₦50,000       → ₦100 fee
₦50,001 – ₦100,000     → ₦200 fee
₦100,001 – ₦250,000    → ₦250 fee
₦250,001+              → ₦300 fee

Examples:

Requested payout: ₦5,000
Fee:              ₦100
Wallet deduction: ₦5,100
Courier receives: ₦5,000

Requested payout: ₦75,000
Fee:              ₦200
Wallet deduction: ₦75,200
Courier receives: ₦75,000

Requested payout: ₦150,000
Fee:              ₦250
Wallet deduction: ₦150,250
Courier receives: ₦150,000

Requested payout: ₦300,000
Fee:              ₦300
Wallet deduction: ₦300,300
Courier receives: ₦300,000

The backend remains authoritative and must enforce
these rules independently of the frontend.
==========================================================
*/

const MINIMUM_PAYOUT = 3000;

const getPayoutFee = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return 0;
  }

  if (numericAmount <= 50000) {
    return 100;
  }

  if (numericAmount <= 100000) {
    return 200;
  }

  if (numericAmount <= 250000) {
    return 250;
  }

  return 300;
};

/*
==========================================================
PAYOUT METHOD
==========================================================

This value is kept as BANK_TRANSFER because that is the
value currently expected by the requestPayout mutation.

The backend processPayouts function normalizes this legacy
value to:

    payoutMethod = MANUAL_SINGLE
    payoutSource = COURIER_REQUESTED

Do not change this to MANUAL_SINGLE here unless the
requestPayout resolver is also changed to expect that value.
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

const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return "No account number registered";
  }

  return String(accountNumber);
};

/*
==========================================================
GET CURRENT COURIER
==========================================================

Uses the authenticated Cognito user's userId to find the
matching Courier record.

Courier.sub === authenticated Cognito userId
==========================================================
*/

const getCurrentCourier = async () => {
  try {
    const { getCurrentUser } = await import("aws-amplify/auth");

    const currentUser = await getCurrentUser();

    if (!currentUser?.userId) {
      throw new Error("You are not signed in.");
    }

    const couriers = await DataStore.query(Courier, (courierQuery) =>
      courierQuery.sub.eq(currentUser.userId),
    );

    if (!couriers || couriers.length === 0) {
      return null;
    }

    return couriers[0];
  } catch (error) {
    console.error("Get current courier error:", error);
    throw error;
  }
};

/*
==========================================================
REQUEST PAYOUT MUTATION
==========================================================

The courier app only requests the payout.

The backend processPayouts Lambda is responsible for:

- validating the payout
- enforcing the ₦3,000 minimum
- calculating the applicable tiered fee
- reserving/debiting the wallet
- creating the Transaction
- creating the Payout
- initiating Paystack
- handling transfer failures
- reconciliation

The GraphQL mutation returns:

    ProcessPayoutsResponse

which contains:

    statusCode
    body

The detailed payout result is inside the JSON body.
==========================================================
*/

const REQUEST_PAYOUT = /* GraphQL */ `
  mutation RequestPayout(
    $courierID: ID!
    $requestedAmount: Float!
    $payoutMethod: String!
  ) {
    requestPayout(
      courierID: $courierID
      requestedAmount: $requestedAmount
      payoutMethod: $payoutMethod
    ) {
      statusCode
      body
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

    const wallets = await DataStore.query(Wallet, (walletQuery) =>
      walletQuery.ownerID.eq(courierRecord.id),
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

        if (element?.ownerID !== courier.id) {
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
  BANK ACCOUNT CHECK
  ========================================================
  */

  const hasBankAccount = Boolean(
    courier?.bankName && courier?.accountName && courier?.accountNumber,
  );

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
    ==========================================================
    TOTAL WALLET DEDUCTION
    ==========================================================

    The courier receives the requested payout amount.

    The applicable Atua payout fee is additionally
    deducted from the wallet.

    Example:

    ₦75,000 payout
    + ₦200 fee
    = ₦75,200 wallet deduction

  ==========================================================
  */

  const payoutFee = getPayoutFee(numericAmount);

  const totalWalletDeduction = numericAmount + payoutFee;

  const getMaximumPayoutAmount = (availableBalance) => {
    const balance = Number(availableBalance || 0);

    if (!Number.isFinite(balance) || balance < 3100) {
      return 0;
    }

    // ₦250,001+ payout tier → ₦300 fee
    if (balance >= 250301) {
      return Number((balance - 300).toFixed(2));
    }

    // ₦100,001–₦250,000 payout tier → ₦250 fee
    if (balance >= 100251) {
      return Number(Math.min(balance - 250, 250000).toFixed(2));
    }

    // ₦50,001–₦100,000 payout tier → ₦200 fee
    if (balance >= 50201) {
      return Number(Math.min(balance - 200, 100000).toFixed(2));
    }

    // ₦3,000–₦50,000 payout tier → ₦100 fee
    return Number(Math.min(balance - 100, 50000).toFixed(2));
  };

  const maximumPayoutAmount = useMemo(
    () => getMaximumPayoutAmount(availableBalance),
    [availableBalance],
  );

  /*
  ========================================================
  REMAINING BALANCE
  ========================================================
  */

  const remainingBalance = Math.max(availableBalance - totalWalletDeduction, 0);

  /*
  ========================================================
  VALIDATION
  ========================================================
  */

  const validationMessage = useMemo(() => {
    if (!amount) {
      return null;
    }

    if (!hasBankAccount) {
      return "Please add your bank account details before requesting a payout.";
    }

    if (numericAmount <= 0) {
      return "Enter an amount to withdraw.";
    }

    /*
    IMPORTANT:

    Courier-requested payout minimum is ₦3,000.
    */

    if (numericAmount < MINIMUM_PAYOUT) {
      return `Minimum payout is ${formatShortCurrency(MINIMUM_PAYOUT)}.`;
    }

    /*
    The courier must have enough money for BOTH:

    requested payout
    +
    applicable Atua payout fee
    */

    if (totalWalletDeduction > availableBalance) {
      return `You don't have enough available balance to cover the payout and ${formatCurrency(
        payoutFee,
      )} payout fee.`;
    }

    return null;
  }, [
    amount,
    numericAmount,
    payoutFee,
    totalWalletDeduction,
    availableBalance,
    hasBankAccount,
  ]);

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
    hasBankAccount &&
    numericAmount >= MINIMUM_PAYOUT &&
    totalWalletDeduction <= availableBalance;

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

  Quick amounts below ₦3,000 are intentionally not offered.

  Also, the button is disabled when the courier's wallet
  cannot cover the payout amount plus its applicable fee.
  ========================================================
  */

  const quickAmounts = [3000, 5000, 10000, 20000];

  const handleQuickAmount = (value) => {
    if (value < MINIMUM_PAYOUT) {
      return;
    }

    const fee = getPayoutFee(value);

    if (value + fee > availableBalance) {
      return;
    }

    setAmount(String(value));
  };

  /*
  =======================================
    MAX PAYOUT
    ==========================================================

    Maximum payout is calculated based on the applicable
    tiered Atua payout fee.

    Examples:

    Available balance = ₦10,000
    Fee               = ₦100
    Maximum payout    = ₦9,900

    Available balance = ₦75,200
    Fee               = ₦200
    Maximum payout    = ₦75,000

    Available balance = ₦150,250
    Fee               = ₦250
    Maximum payout    = ₦150,000

  ==========================================================
  */

  const handleMaxAmount = () => {
    if (maximumPayoutAmount < MINIMUM_PAYOUT) {
      setAmount("");
      return;
    }

    setAmount(String(maximumPayoutAmount));
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
      --------------------------------------------------

      The wallet may have changed since the screen opened.
      */

      const freshWallet = await DataStore.query(Wallet, wallet.id);

      if (!freshWallet) {
        throw new Error("Your wallet could not be found.");
      }

      const freshBalance = Number(freshWallet.availableBalance || 0);

      /*
      * Recheck the complete wallet requirement:

      * payout amount + applicable Atua fee
      */

      const freshPayoutFee = getPayoutFee(numericAmount);
      const freshTotalWalletDeduction = numericAmount + freshPayoutFee;

      if (freshTotalWalletDeduction > freshBalance) {
        setWallet(freshWallet);

        setShowConfirmation(false);

        throw new Error(
          "Your available balance has changed. Please review the payout amount and try again.",
        );
      }

      /*
      --------------------------------------------------
      RECHECK MINIMUM PAYOUT
      --------------------------------------------------

      The frontend checks this already, but we also
      check immediately before submitting.
      */

      if (numericAmount < MINIMUM_PAYOUT) {
        setShowConfirmation(false);

        throw new Error(
          `Minimum payout is ${formatShortCurrency(MINIMUM_PAYOUT)}.`,
        );
      }

      /*
      --------------------------------------------------
      CALL SECURE BACKEND
      --------------------------------------------------

      The app does NOT:

        - create Payout
        - debit Wallet
        - create Transaction
        - call Paystack
        - use Paystack secret key

      The backend performs all financial operations.
      */

      const response = await client.graphql({
        query: REQUEST_PAYOUT,

        variables: {
          courierID: courier.id,

          requestedAmount: numericAmount,

          /*
          Keep BANK_TRANSFER for compatibility with the
          existing requestPayout resolver.

          processPayouts normalizes this to:

            MANUAL_SINGLE
            COURIER_REQUESTED
          */

          payoutMethod: PAYOUT_METHOD,
        },
      });

      /*
--------------------------------------------------
GRAPHQL RESPONSE
--------------------------------------------------

requestPayout returns:

    {
      statusCode,
      body
    }

The detailed payout result is contained inside
the JSON body.
--------------------------------------------------
*/

      const responseResult = response?.data?.requestPayout;

      if (!responseResult) {
        throw new Error("The payout service returned no response.");
      }

      /*
--------------------------------------------------
PARSE BACKEND RESPONSE
--------------------------------------------------
*/

      let result = responseResult.body;

      if (typeof result === "string") {
        try {
          result = JSON.parse(result);
        } catch (parseError) {
          console.error("Could not parse payout response:", parseError);

          throw new Error("The payout service returned an invalid response.");
        }
      }

      /*
--------------------------------------------------
CHECK BACKEND STATUS
--------------------------------------------------

The Lambda may return:

    statusCode = 200

while the actual payout result inside body
contains:

    success: false

Therefore check BOTH.
--------------------------------------------------
*/

      if (
        Number(responseResult.statusCode) >= 400 ||
        result?.success === false
      ) {
        throw new Error(
          result?.message || "The payout could not be initiated.",
        );
      }

      /*
--------------------------------------------------
VERIFY PAYOUT ID
--------------------------------------------------

A successfully initiated payout should have
a Payout record ID.
--------------------------------------------------
*/

      if (!result?.payoutID) {
        throw new Error(
          "The payout was processed but no payout ID was returned.",
        );
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
      --------------------------------------------------

      The backend should have reserved/debited the wallet.
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
        )} has been submitted for payout.\n\n` +
          `Status: ${result.status || "PROCESSING"}`,
        [
          {
            text: "View payout",
            onPress: () => {
              router.replace({
                pathname: "/wallet/payouts/[payoutId]",
                params: {
                  payoutId: String(result.payoutID),
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
            {quickAmounts.map((value) => {
              const canAfford = value + getPayoutFee(value) <= availableBalance;

              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickAmountButton,

                    numericAmount === value && styles.quickAmountButtonActive,

                    !canAfford && styles.quickAmountButtonDisabled,
                  ]}
                  onPress={() => handleQuickAmount(value)}
                  disabled={!canAfford}
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
              );
            })}

            <TouchableOpacity
              style={[
                styles.quickAmountButton,

                numericAmount === maximumPayoutAmount &&
                  numericAmount >= MINIMUM_PAYOUT &&
                  styles.quickAmountButtonActive,

                maximumPayoutAmount < MINIMUM_PAYOUT &&
                  styles.quickAmountButtonDisabled,
              ]}
              onPress={handleMaxAmount}
              disabled={maximumPayoutAmount < MINIMUM_PAYOUT}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.quickAmountText,

                  numericAmount === maximumPayoutAmount &&
                    numericAmount >= MINIMUM_PAYOUT &&
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
                {formatAccountNumber(courier?.accountNumber)}
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
                A tiered payout fee applies to courier-requested payouts: ₦100
                for ₦3,000-₦50,000, ₦200 for ₦50,001-₦100,000, ₦250 for
                ₦100,001-₦250,000, and ₦300 above ₦250,000.
              </Text>

              <Text style={styles.infoText}>
                The minimum payout amount is ₦3,000.
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

                <SummaryRow
                  label="Payout fee"
                  value={formatCurrency(payoutFee)}
                />

                <SummaryRow
                  label="You will receive"
                  value={formatCurrency(numericAmount)}
                  strong
                />

                <View style={styles.summaryDivider} />

                <SummaryRow
                  label="Total wallet deduction"
                  value={formatCurrency(totalWalletDeduction)}
                />

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
            Minimum payout: {formatShortCurrency(MINIMUM_PAYOUT)}. A tiered
            payout fee applies. Your available balance must be sufficient to
            cover both the payout and the applicable fee.
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
                    {formatAccountNumber(courier?.accountNumber)}
                  </Text>
                </View>
              </View>

              {/* ==========================================
                  CONFIRMATION FEE BREAKDOWN
              ========================================== */}

              <View style={styles.confirmationRemaining}>
                <Text style={styles.confirmationRemainingLabel}>
                  Payout fee
                </Text>

                <Text style={styles.confirmationRemainingValue}>
                  {formatCurrency(payoutFee)}
                </Text>
              </View>

              <View style={styles.confirmationRemaining}>
                <Text style={styles.confirmationRemainingLabel}>
                  Total wallet deduction
                </Text>

                <Text style={styles.confirmationRemainingValue}>
                  {formatCurrency(totalWalletDeduction)}
                </Text>
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
