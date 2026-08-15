import Ionicons from "@expo/vector-icons/Ionicons";
import { DataStore } from "aws-amplify/datastore";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Payout, Transaction } from "@/src/models";

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

const formatShortDate = (dateString) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
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

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return "—";
  }

  const lastFour = String(accountNumber).slice(-4);

  return `•••• ${lastFour}`;
};

/*
==========================================================
STATUS HELPERS
==========================================================
*/

const getStatusLabel = (status) => {
  switch (status) {
    case "PAID":
      return "Paid";

    case "PROCESSING":
      return "Processing";

    case "PENDING":
      return "Pending";

    case "FAILED":
      return "Failed";

    default:
      return status || "Unknown";
  }
};

const getStatusDescription = (status) => {
  switch (status) {
    case "PAID":
      return "Your payout has been successfully transferred to your registered bank account.";

    case "PROCESSING":
      return "Your payout is being processed. The transfer has been submitted and is awaiting completion.";

    case "PENDING":
      return "Your payout request has been received and is waiting to be processed.";

    case "FAILED":
      return "Your payout could not be completed. Please review the failure information below.";

    default:
      return "Payout status information.";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "#059669";

    case "PROCESSING":
      return "#2563EB";

    case "PENDING":
      return "#D97706";

    case "FAILED":
      return "#DC2626";

    default:
      return "#6B7280";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "PAID":
      return "checkmark-circle-outline";

    case "PROCESSING":
      return "sync-outline";

    case "PENDING":
      return "time-outline";

    case "FAILED":
      return "close-circle-outline";

    default:
      return "ellipse-outline";
  }
};

/*
==========================================================
COMPONENT
==========================================================
*/

const PayoutDetails = () => {
  /*
  ========================================================
  ROUTER PARAMETER
  ========================================================
  */

  const params = useLocalSearchParams();

  const payoutId = Array.isArray(params?.payoutId)
    ? params.payoutId[0]
    : params?.payoutId;

  /*
  ========================================================
  STATE
  ========================================================
  */

  const [payout, setPayout] = useState(null);

  const [transaction, setTransaction] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  /*
  ========================================================
  GET PAYOUT
  ========================================================
  */

  const fetchPayout = useCallback(async () => {
    if (!payoutId) {
      setPayout(null);
      return null;
    }

    try {
      const result = await DataStore.query(Payout, payoutId);

      /*
        --------------------------------------------------
        IMPORTANT:

        DataStore.query(Model, id)

        directly retrieves the record by ID.
        --------------------------------------------------
        */

      if (!result) {
        setPayout(null);

        return null;
      }

      setPayout(result);

      return result;
    } catch (queryError) {
      console.error("Failed to load payout:", queryError);

      throw queryError;
    }
  }, [payoutId]);

  /*
  ========================================================
  GET LINKED TRANSACTION
  ========================================================

  Your payout Lambda creates the debit transaction
  using the SAME reference as the payout.

      Payout.reference
              ↓
      Transaction.reference

  Therefore we can safely find the transaction
  through the payout reference.
  ========================================================
  */

  const fetchTransaction = useCallback(async (payoutRecord) => {
    if (!payoutRecord?.reference) {
      setTransaction(null);

      return null;
    }

    try {
      const transactions = await DataStore.query(
        Transaction,
        (transactionQuery) =>
          transactionQuery.reference.eq(payoutRecord.reference),
      );

      /*
        --------------------------------------------------
        We expect one transaction for the payout
        reference.

        Select the DEBIT transaction if more than
        one record somehow exists.
        --------------------------------------------------
        */

      const linkedTransaction =
        transactions.find((item) => item.type === "DEBIT") ||
        transactions[0] ||
        null;

      setTransaction(linkedTransaction);

      return linkedTransaction;
    } catch (queryError) {
      console.error("Failed to load linked payout transaction:", queryError);

      /*
        --------------------------------------------------
        Transaction lookup should not prevent the payout
        details from displaying.

        The payout itself remains the primary record.
        --------------------------------------------------
        */

      setTransaction(null);

      return null;
    }
  }, []);

  /*
  ========================================================
  LOAD DATA
  ========================================================
  */

  const loadPayoutDetails = useCallback(async () => {
    if (!payoutId) {
      setError("No payout was selected.");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError(null);

      const payoutRecord = await fetchPayout();

      if (payoutRecord) {
        await fetchTransaction(payoutRecord);
      } else {
        setError("We couldn't find this payout.");
      }
    } catch (loadError) {
      console.error("Failed to load payout details:", loadError);

      setError("We couldn't load this payout.");
    } finally {
      setLoading(false);
    }
  }, [payoutId, fetchPayout, fetchTransaction]);

  /*
  ========================================================
  INITIAL LOAD
  ========================================================
  */

  useEffect(() => {
    loadPayoutDetails();
  }, [loadPayoutDetails]);

  /*
  ========================================================
  OBSERVE PAYOUT

  This is important.

  If the Lambda changes:

      PENDING
          ↓
      PROCESSING
          ↓
      PAID

  this screen refreshes automatically.
  ========================================================
  */

  useEffect(() => {
    if (!payoutId) {
      return undefined;
    }

    const subscription = DataStore.observe(Payout).subscribe(
      ({ opType, element }) => {
        if (!["INSERT", "UPDATE", "DELETE"].includes(opType)) {
          return;
        }

        if (element?.id !== payoutId) {
          return;
        }

        /*
          ----------------------------------------------
          Refresh payout
          ----------------------------------------------
          */

        fetchPayout()
          .then((updatedPayout) => {
            if (updatedPayout) {
              return fetchTransaction(updatedPayout);
            }

            return null;
          })
          .catch((observeError) => {
            console.error("Failed to refresh payout:", observeError);
          });
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [payoutId, fetchPayout, fetchTransaction]);

  /*
  ========================================================
  OBSERVE TRANSACTION

  If the payout's debit transaction changes,
  refresh it too.
  ========================================================
  */

  useEffect(() => {
    if (!payout?.reference) {
      return undefined;
    }

    const subscription = DataStore.observe(Transaction).subscribe(
      ({ opType, element }) => {
        if (!["INSERT", "UPDATE", "DELETE"].includes(opType)) {
          return;
        }

        if (element?.reference !== payout.reference) {
          return;
        }

        fetchTransaction(payout).catch((observeError) => {
          console.error("Failed to refresh payout transaction:", observeError);
        });
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [payout, fetchTransaction]);

  /*
  ========================================================
  REFRESH
  ========================================================
  */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const payoutRecord = await fetchPayout();

      if (payoutRecord) {
        await fetchTransaction(payoutRecord);
      }
    } catch (refreshError) {
      console.error("Failed to refresh payout:", refreshError);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPayout, fetchTransaction]);

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

          <Text style={styles.loadingText}>Loading payout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  NOT FOUND
  ========================================================
  */

  if (!payout) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <Ionicons name="cash-outline" size={30} color="#9CA3AF" />
          </View>

          <Text style={styles.notFoundTitle}>Payout not found</Text>

          <Text style={styles.notFoundText}>
            {error || "We couldn't find the payout you're looking for."}
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
  STATUS STATE
  ========================================================
  */

  const isPaid = payout.status === "PAID";

  const isProcessing = payout.status === "PROCESSING";

  const isPending = payout.status === "PENDING";

  const isFailed = payout.status === "FAILED";

  const statusLabel = getStatusLabel(payout.status);

  const statusColor = getStatusColor(payout.status);

  const statusIcon = getStatusIcon(payout.status);

  /*
  ========================================================
  TIMELINE DATA
  ========================================================
  */

  const processingDate = payout.processedAt;

  const completedDate = payout.paidAt || payout.processedAt;

  const failedDate = payout.failedAt || payout.processedAt;

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
            <Text style={styles.headerTitle}>Payout details</Text>

            <Text style={styles.headerSubtitle}>Withdrawal information</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* =================================================
            PAYOUT SUMMARY
        ================================================= */}

        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              isPaid && styles.summaryIconPaid,
              isProcessing && styles.summaryIconProcessing,
              isPending && styles.summaryIconPending,
              isFailed && styles.summaryIconFailed,
            ]}
          >
            <Ionicons name="cash-outline" size={27} color={statusColor} />
          </View>

          <Text style={styles.summaryLabel}>PAYOUT AMOUNT</Text>

          <Text style={styles.summaryAmount}>
            {formatCurrency(payout.amount)}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isPaid && styles.statusBadgePaid,
              isProcessing && styles.statusBadgeProcessing,
              isPending && styles.statusBadgePending,
              isFailed && styles.statusBadgeFailed,
            ]}
          >
            <Ionicons name={statusIcon} size={15} color={statusColor} />

            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: statusColor,
                },
              ]}
            >
              {statusLabel}
            </Text>
          </View>

          <Text style={styles.summaryDate}>
            Requested {formatShortDate(payout.createdAt)}
            {" • "}
            {formatTime(payout.createdAt)}
          </Text>
        </View>

        {/* =================================================
            STATUS MESSAGE
        ================================================= */}

        <View
          style={[
            styles.statusMessage,
            isPaid && styles.statusMessagePaid,
            isProcessing && styles.statusMessageProcessing,
            isPending && styles.statusMessagePending,
            isFailed && styles.statusMessageFailed,
          ]}
        >
          <Ionicons name={statusIcon} size={21} color={statusColor} />

          <View style={styles.statusMessageContent}>
            <Text style={styles.statusMessageTitle}>{statusLabel}</Text>

            <Text style={styles.statusMessageText}>
              {getStatusDescription(payout.status)}
            </Text>
          </View>
        </View>

        {/* =================================================
            PAYOUT INFORMATION
        ================================================= */}

        <Text style={styles.sectionTitle}>Payout information</Text>

        <View style={styles.detailsCard}>
          <DetailRow label="Payout ID" value={payout.id} mono />

          <DetailRow label="Amount" value={formatCurrency(payout.amount)} />

          <DetailRow
            label="Status"
            value={statusLabel}
            status={payout.status}
          />

          <DetailRow
            label="Method"
            value={payout.payoutMethod || "Bank transfer"}
          />

          <DetailRow
            label="Requested"
            value={`${formatShortDate(payout.createdAt)} • ${formatTime(
              payout.createdAt,
            )}`}
          />

          {payout.processedAt && (
            <DetailRow
              label={isPaid ? "Processed" : "Processing started"}
              value={`${formatShortDate(payout.processedAt)} • ${formatTime(
                payout.processedAt,
              )}`}
            />
          )}

          {payout.paidAt && (
            <DetailRow
              label="Paid"
              value={`${formatShortDate(payout.paidAt)} • ${formatTime(
                payout.paidAt,
              )}`}
            />
          )}

          {payout.failedAt && (
            <DetailRow
              label="Failed"
              value={`${formatShortDate(payout.failedAt)} • ${formatTime(
                payout.failedAt,
              )}`}
            />
          )}

          {payout.reference && (
            <DetailRow
              label="Transfer reference"
              value={payout.reference}
              mono
              last
            />
          )}

          {!payout.reference && (
            <DetailRow
              label="Transfer reference"
              value="Not available yet"
              last
            />
          )}
        </View>

        {/* =================================================
            PAYSTACK TRANSFER INFORMATION
        ================================================= */}

        {(payout.transferCode || payout.transferID) && (
          <>
            <Text style={styles.sectionTitle}>Transfer information</Text>

            <View style={styles.detailsCard}>
              {payout.transferCode && (
                <DetailRow
                  label="Transfer code"
                  value={payout.transferCode}
                  mono
                />
              )}

              {payout.transferID && (
                <DetailRow
                  label="Transfer ID"
                  value={payout.transferID}
                  mono
                  last
                />
              )}
            </View>
          </>
        )}

        {/* =================================================
            DESTINATION ACCOUNT
        ================================================= */}

        <Text style={styles.sectionTitle}>Destination account</Text>

        <View style={styles.bankCard}>
          <View style={styles.bankIcon}>
            <Ionicons name="business-outline" size={22} color="#111827" />
          </View>

          <View style={styles.bankContent}>
            <Text style={styles.bankName}>
              {payout.bankName || "Registered bank"}
            </Text>

            <Text style={styles.accountName}>Registered payout account</Text>

            <Text style={styles.accountNumber}>
              {maskAccountNumber(payout.accountNumber)}
            </Text>
          </View>

          <View style={styles.bankVerified}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
          </View>
        </View>

        {/* =================================================
            FAILURE INFORMATION
        ================================================= */}

        {isFailed && payout.failureReason && (
          <>
            <Text style={styles.sectionTitle}>What happened?</Text>

            <View style={styles.failureCard}>
              <View style={styles.failureIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={21}
                  color="#DC2626"
                />
              </View>

              <View style={styles.failureContent}>
                <Text style={styles.failureTitle}>Payout failed</Text>

                <Text style={styles.failureText}>{payout.failureReason}</Text>
              </View>
            </View>
          </>
        )}

        {/* =================================================
            PAYOUT TIMELINE
        ================================================= */}

        <Text style={styles.sectionTitle}>Payout timeline</Text>

        <View style={styles.timelineCard}>
          {/* REQUESTED */}

          <TimelineItem
            title="Payout requested"
            description={`${formatShortDate(payout.createdAt)} • ${formatTime(
              payout.createdAt,
            )}`}
            active
            completed
            last={isPending}
          />

          {/* PROCESSING */}

          {(isProcessing || isPaid || isFailed) && (
            <TimelineItem
              title="Transfer processing"
              description={
                processingDate
                  ? `${formatShortDate(processingDate)} • ${formatTime(
                      processingDate,
                    )}`
                  : "Transfer submitted"
              }
              active
              completed={isPaid || isFailed}
              processing={isProcessing}
              failed={false}
              last={isProcessing || isFailed}
            />
          )}

          {/* PAID */}

          {isPaid && (
            <TimelineItem
              title="Payout completed"
              description={
                completedDate
                  ? `${formatShortDate(completedDate)} • ${formatTime(
                      completedDate,
                    )}`
                  : "Transfer completed"
              }
              active
              completed
              last
            />
          )}

          {/* FAILED */}

          {isFailed && (
            <TimelineItem
              title="Transfer failed"
              description={
                failedDate
                  ? `${formatShortDate(failedDate)} • ${formatTime(failedDate)}`
                  : "Transfer failed"
              }
              active
              completed={false}
              failed
              last
            />
          )}

          {/* PENDING */}

          {isPending && (
            <TimelineItem
              title="Awaiting processing"
              description="Your payout is waiting to be processed."
              active={false}
              completed={false}
              last
            />
          )}

          {/* PROCESSING WAIT */}

          {isProcessing && (
            <TimelineItem
              title="Awaiting completion"
              description="Waiting for the transfer to complete."
              active
              completed={false}
              processing
              last
            />
          )}
        </View>

        {/* =================================================
            LINKED WALLET TRANSACTION
        ================================================= */}

        {transaction && (
          <>
            <Text style={styles.sectionTitle}>Wallet transaction</Text>

            <TouchableOpacity
              style={styles.transactionCard}
              activeOpacity={0.75}
              onPress={() => {
                router.push({
                  pathname: "/wallet/transactions/[transactionId]",
                  params: {
                    transactionId: String(transaction.id),
                  },
                });
              }}
            >
              <View style={styles.transactionIcon}>
                <Ionicons name="arrow-down-outline" size={21} color="#111827" />
              </View>

              <View style={styles.transactionContent}>
                <Text style={styles.transactionTitle}>Payout debit</Text>

                <Text style={styles.transactionId} numberOfLines={1}>
                  {transaction.id}
                </Text>

                {transaction.reference && (
                  <Text style={styles.transactionReference} numberOfLines={1}>
                    {transaction.reference}
                  </Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </>
        )}

        {/* =================================================
            NO TRANSACTION YET
        ================================================= */}

        {!transaction && payout.reference && (
          <View style={styles.transactionPendingCard}>
            <View style={styles.transactionPendingIcon}>
              <Ionicons name="time-outline" size={19} color="#D97706" />
            </View>

            <View style={styles.transactionPendingContent}>
              <Text style={styles.transactionPendingTitle}>
                Wallet transaction
              </Text>

              <Text style={styles.transactionPendingText}>
                The associated wallet debit transaction is not available yet.
              </Text>
            </View>
          </View>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          Payout records show withdrawals requested from your available wallet
          balance. Transfer status may change as the payment provider processes
          the payout.
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

  if (status === "PAID") {
    statusStyle = styles.detailStatusPaid;
  }

  if (status === "PROCESSING") {
    statusStyle = styles.detailStatusProcessing;
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
        {value}
      </Text>
    </View>
  );
};

/*
==========================================================
TIMELINE ITEM
==========================================================
*/

const TimelineItem = ({
  title,
  description,
  active = false,
  completed = false,
  processing = false,
  failed = false,
  last = false,
}) => {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineDot,
            active && styles.timelineDotActive,
            completed && styles.timelineDotCompleted,
            processing && styles.timelineDotProcessing,
            failed && styles.timelineDotFailed,
          ]}
        >
          {completed && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}

          {failed && <Ionicons name="close" size={10} color="#FFFFFF" />}

          {processing && <View style={styles.timelineDotInner} />}
        </View>

        {!last && (
          <View
            style={[
              styles.timelineLine,
              completed && styles.timelineLineCompleted,
            ]}
          />
        )}
      </View>

      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineTitle,
            !active && styles.timelineTitleInactive,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.timelineDescription}>{description}</Text>
      </View>
    </View>
  );
};

export default PayoutDetails;
