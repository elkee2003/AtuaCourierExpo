import { Transaction } from "@/src/models";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DataStore } from "aws-amplify/datastore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import styles from "./styles";

/*
==========================================================
FORMATTERS
==========================================================
*/

const formatCurrency = (amount = 0) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
};

/*
==========================================================
STATUS HELPERS
==========================================================
*/

const getStatusLabel = (status) => {
  switch (status) {
    case "COMPLETED":
      return "Completed";

    case "PENDING":
      return "Pending";

    case "FAILED":
      return "Failed";

    default:
      return status || "Unknown";
  }
};

const getStatusDescription = (transaction) => {
  if (transaction?.status === "COMPLETED") {
    if (transaction?.type === "CREDIT") {
      return "This money has been successfully credited to your wallet.";
    }

    return "This transaction has been successfully processed.";
  }

  if (transaction?.status === "PENDING") {
    if (transaction?.type === "CREDIT") {
      return "This earning is currently being held and has not yet been released to your available balance.";
    }

    return "Your payout is currently being processed.";
  }

  if (transaction?.status === "FAILED") {
    return "This transaction could not be completed. No successful wallet movement was made.";
  }

  return "Transaction status information.";
};

/*
==========================================================
COMPONENT
==========================================================
*/

const TransactionDetails = ({ transactionId }) => {
  /*
  ========================================================
  NORMALIZE PARAMETER
  ========================================================
  */

  const normalizedTransactionId = Array.isArray(transactionId)
    ? transactionId[0]
    : transactionId;

  /*
  ========================================================
  STATE
  ========================================================
  */

  const [transaction, setTransaction] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /*
  ========================================================
  FETCH TRANSACTION
  ========================================================
  */

  useEffect(() => {
    let mounted = true;

    const fetchTransaction = async () => {
      /*
        ----------------------------------------------------
        INVALID ID
        ----------------------------------------------------
        */

      if (!normalizedTransactionId) {
        if (mounted) {
          setTransaction(null);
          setError("No transaction ID was provided.");
          setLoading(false);
        }

        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError(null);
        }

        /*
          --------------------------------------------------
          QUERY ACTUAL DATASTORE TRANSACTION
          --------------------------------------------------
          */

        const result = await DataStore.query(
          Transaction,
          normalizedTransactionId,
        );

        if (!mounted) {
          return;
        }

        if (!result) {
          setTransaction(null);
          setError("Transaction not found.");
          return;
        }

        /*
          --------------------------------------------------
          SAVE TRANSACTION
          --------------------------------------------------
          */

        setTransaction(result);
      } catch (err) {
        console.error("Transaction details fetch error:", err);

        if (mounted) {
          setTransaction(null);
          setError("Unable to load this transaction.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTransaction();

    return () => {
      mounted = false;
    };
  }, [normalizedTransactionId]);

  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.notFoundContainer}>
          <ActivityIndicator size="small" color="#111827" />

          <Text style={styles.loadingTitle}>Loading transaction</Text>

          <Text style={styles.loadingText}>
            Please wait while we retrieve the transaction details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  NOT FOUND / ERROR
  ========================================================
  */

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <Ionicons name="receipt-outline" size={30} color="#9CA3AF" />
          </View>

          <Text style={styles.notFoundTitle}>Transaction not found</Text>

          <Text style={styles.notFoundText}>
            {error || "We couldn't find the transaction you're looking for."}
          </Text>

          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  TRANSACTION STATE
  ========================================================
  */

  const isCredit = transaction.type === "CREDIT";

  const isPending = transaction.status === "PENDING";

  const isFailed = transaction.status === "FAILED";

  const statusLabel = getStatusLabel(transaction.status);

  /*
  ========================================================
  UI
  ========================================================
  */

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.headerTitle}>Transaction details</Text>

            <Text style={styles.headerSubtitle}>Wallet transaction</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* =================================================
            MAIN TRANSACTION CARD
        ================================================= */}

        <View style={styles.amountCard}>
          <View
            style={[
              styles.amountIcon,
              isCredit ? styles.amountIconCredit : styles.amountIconDebit,
            ]}
          >
            <Ionicons
              name={isCredit ? "arrow-down-outline" : "arrow-up-outline"}
              size={26}
              color={isCredit ? "#059669" : "#DC2626"}
            />
          </View>

          <Text style={styles.amountLabel}>
            {(
              transaction.description ||
              (isCredit ? "Delivery earnings" : "Payout")
            ).toUpperCase()}
          </Text>

          <Text
            style={[
              styles.amount,
              isCredit ? styles.amountCredit : styles.amountDebit,
            ]}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </Text>

          {/* STATUS */}

          <View
            style={[
              styles.statusBadge,
              isPending
                ? styles.statusBadgePending
                : isFailed
                  ? styles.statusBadgeFailed
                  : styles.statusBadgeCompleted,
            ]}
          >
            <View
              style={[
                styles.statusBadgeDot,
                isPending
                  ? styles.statusDotPending
                  : isFailed
                    ? styles.statusDotFailed
                    : styles.statusDotCompleted,
              ]}
            />

            <Text
              style={[
                styles.statusBadgeText,
                isPending
                  ? styles.statusTextPending
                  : isFailed
                    ? styles.statusTextFailed
                    : styles.statusTextCompleted,
              ]}
            >
              {statusLabel}
            </Text>
          </View>

          <Text style={styles.amountDate}>
            {formatDate(transaction.createdAt)}
          </Text>

          <Text style={styles.amountTime}>
            {formatTime(transaction.createdAt)}
          </Text>
        </View>

        {/* =================================================
            STATUS MESSAGE
        ================================================= */}

        <View
          style={[
            styles.statusMessage,
            isPending
              ? styles.statusMessagePending
              : isFailed
                ? styles.statusMessageFailed
                : styles.statusMessageCompleted,
          ]}
        >
          <Ionicons
            name={
              isPending
                ? "time-outline"
                : isFailed
                  ? "alert-circle-outline"
                  : "checkmark-circle-outline"
            }
            size={20}
            color={isPending ? "#D97706" : isFailed ? "#DC2626" : "#059669"}
          />

          <Text style={styles.statusMessageText}>
            {getStatusDescription(transaction)}
          </Text>
        </View>

        {/* =================================================
            TRANSACTION INFORMATION
        ================================================= */}

        <Text style={styles.sectionTitle}>Transaction information</Text>

        <View style={styles.detailsCard}>
          <DetailRow label="Transaction ID" value={transaction.id} mono />

          <DetailRow
            label="Transaction type"
            value={transaction.type === "CREDIT" ? "Credit" : "Debit"}
          />

          <DetailRow
            label="Amount"
            value={formatCurrency(transaction.amount)}
          />

          <DetailRow
            label="Status"
            value={statusLabel}
            status={transaction.status}
          />

          <DetailRow label="Wallet" value={transaction.walletID || "—"} mono />

          {transaction.orderID && (
            <DetailRow label="Order" value={`#${transaction.orderID}`} />
          )}

          {transaction.paymentID && (
            <DetailRow label="Payment" value={transaction.paymentID} mono />
          )}

          {transaction.reference && (
            <DetailRow label="Reference" value={transaction.reference} mono />
          )}

          <DetailRow label="Date" value={formatDate(transaction.createdAt)} />

          <DetailRow
            label="Time"
            value={formatTime(transaction.createdAt)}
            last
          />
        </View>

        {/* =================================================
            DELIVERY EARNINGS CONTEXT
        ================================================= */}

        {transaction.type === "CREDIT" && (
          <View style={styles.contextCard}>
            <View style={styles.contextIcon}>
              <Ionicons name="bicycle-outline" size={21} color="#111827" />
            </View>

            <View style={styles.contextContent}>
              <Text style={styles.contextTitle}>Delivery earnings</Text>

              <Text style={styles.contextDescription}>
                This credit represents earnings allocated to you for completing
                a delivery.
              </Text>

              {transaction.orderID && (
                <TouchableOpacity
                  style={styles.contextButton}
                  activeOpacity={0.75}
                  onPress={() => {
                    router.push({
                      pathname: "/orderhistory/orderdetails/[id]",
                      params: {
                        id: String(transaction.orderID),
                      },
                    });
                  }}
                >
                  <Text style={styles.contextButtonText}>View order</Text>

                  <Ionicons name="arrow-forward" size={15} color="#111827" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* =================================================
            PAYOUT CONTEXT
        ================================================= */}

        {transaction.type === "DEBIT" && (
          <View style={styles.contextCard}>
            <View style={[styles.contextIcon, styles.contextIconPayout]}>
              <Ionicons name="cash-outline" size={21} color="#111827" />
            </View>

            <View style={styles.contextContent}>
              <Text style={styles.contextTitle}>Wallet payout</Text>

              <Text style={styles.contextDescription}>
                This debit represents money removed from your available wallet
                balance for payout to your registered bank account.
              </Text>

              {transaction.reference && (
                <Text style={styles.contextReference}>
                  Transfer reference: {transaction.reference}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          Transaction records are maintained as part of your Atua wallet
          history.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

/*
==========================================================
DETAIL ROW
==========================================================
*/

const DetailRow = ({
  label,
  value,
  mono = false,
  status = null,
  last = false,
}) => {
  let statusStyle = null;

  if (status === "COMPLETED") {
    statusStyle = styles.detailStatusCompleted;
  }

  if (status === "PENDING") {
    statusStyle = styles.detailStatusPending;
  }

  if (status === "FAILED") {
    statusStyle = styles.detailStatusFailed;
  }

  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>

      <Text
        style={[
          styles.detailValue,
          mono && styles.detailValueMono,
          statusStyle,
        ]}
        numberOfLines={2}
      >
        {value || "—"}
      </Text>
    </View>
  );
};

export default TransactionDetails;
