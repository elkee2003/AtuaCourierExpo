import { useAuthContext } from "@/providers/AuthProvider";
import { Transaction, Wallet } from "@/src/models";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DataStore } from "aws-amplify/datastore";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
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

const formatShortCurrency = (amount = 0) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/*
==========================================================
DATE HELPERS
==========================================================
*/

const getTransactionDate = (transaction) => {
  if (!transaction?.createdAt) {
    return new Date(0);
  }

  const date = new Date(transaction.createdAt);

  if (Number.isNaN(date.getTime())) {
    return new Date(0);
  }

  return date;
};

const getDateKey = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const isSameDay = (dateA, dateB) => {
  return getDateKey(dateA) === getDateKey(dateB);
};

const getDateLabel = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const now = new Date();

  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) {
    return "Today";
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-NG", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
};

/*
==========================================================
TRANSACTION HELPERS
==========================================================
*/

const getTransactionIcon = (transaction) => {
  if (transaction?.type === "CREDIT") {
    return "arrow-down-outline";
  }

  if (transaction?.type === "DEBIT") {
    return "arrow-up-outline";
  }

  return "swap-vertical-outline";
};

const getTransactionSubtitle = (transaction) => {
  /*
  --------------------------------------------------------
  DELIVERY TRANSACTION
  --------------------------------------------------------
  */

  if (transaction?.orderID) {
    return `Order #${String(transaction.orderID).slice(0, 8).toUpperCase()}`;
  }

  /*
  --------------------------------------------------------
  PAYMENT REFERENCE
  --------------------------------------------------------
  */

  if (transaction?.reference) {
    return transaction.reference;
  }

  /*
  --------------------------------------------------------
  DESCRIPTION
  --------------------------------------------------------
  */

  if (transaction?.description) {
    return transaction.description;
  }

  return "Wallet activity";
};

const getTransactionTitle = (transaction) => {
  if (transaction?.type === "CREDIT") {
    return "Delivery earnings";
  }

  if (transaction?.type === "DEBIT") {
    return "Payout";
  }

  return "Wallet transaction";
};

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

/*
==========================================================
TRANSACTIONS PAGE
==========================================================
*/

const Transactions = () => {
  /*
  ========================================================
  AUTHENTICATED COURIER
  ========================================================
  */

  const { dbCourier } = useAuthContext();

  /*
  ========================================================
  STATE
  ========================================================
  */

  const [wallet, setWallet] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [filter, setFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /*
  ========================================================
  FETCH WALLET + TRANSACTIONS
  ========================================================
  */

  const fetchTransactions = useCallback(async () => {
    /*
      ------------------------------------------------------
      NO COURIER
      ------------------------------------------------------
      */

    if (!dbCourier?.id) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      setRefreshing(false);

      return;
    }

    try {
      /*
        ----------------------------------------------------
        CHECK WALLET ID
        ----------------------------------------------------
        */

      if (!dbCourier?.walletID) {
        console.log("Transactions: courier has no walletID.");

        setWallet(null);
        setTransactions([]);

        return;
      }

      /*
        ----------------------------------------------------
        QUERY WALLET
        ----------------------------------------------------
        */

      const walletResult = await DataStore.query(Wallet, dbCourier.walletID);

      if (!walletResult) {
        console.log("Transactions: wallet not found:", dbCourier.walletID);

        setWallet(null);
        setTransactions([]);

        return;
      }

      /*
        ----------------------------------------------------
        SAVE WALLET
        ----------------------------------------------------
        */

      setWallet(walletResult);

      /*
        ----------------------------------------------------
        QUERY TRANSACTIONS
        ----------------------------------------------------

        Only transactions belonging to this
        courier's wallet are returned.
        */

      const walletTransactions = await DataStore.query(
        Transaction,
        (transaction) => transaction.walletID.eq(walletResult.id),
      );

      /*
        ----------------------------------------------------
        SORT NEWEST FIRST
        ----------------------------------------------------
        */

      const sortedTransactions = [...walletTransactions].sort(
        (a, b) =>
          getTransactionDate(b).getTime() - getTransactionDate(a).getTime(),
      );

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Transactions fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dbCourier?.id, dbCourier?.walletID]);

  /*
  ========================================================
  INITIAL LOAD
  ========================================================
  */

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /*
  ========================================================
  REFRESH
  ========================================================
  */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchTransactions();
  }, [fetchTransactions]);

  /*
  ========================================================
  FILTER TRANSACTIONS
  ========================================================
  */

  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.type === filter);
  }, [filter, transactions]);

  /*
  ========================================================
  GROUP TRANSACTIONS BY DATE
  ========================================================
  */

  const groupedTransactions = useMemo(() => {
    const groups = {};

    filteredTransactions.forEach((transaction) => {
      const key = getDateKey(transaction.createdAt);

      if (!groups[key]) {
        groups[key] = {
          label: getDateLabel(transaction.createdAt),
          transactions: [],
        };
      }

      groups[key].transactions.push(transaction);
    });

    return Object.values(groups);
  }, [filteredTransactions]);

  /*
  ========================================================
  TOTAL CREDITS
  ========================================================
  */

  const totalCredits = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "CREDIT")
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );
  }, [transactions]);

  /*
  ========================================================
  TOTAL DEBITS
  ========================================================
  */

  const totalDebits = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "DEBIT")
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );
  }, [transactions]);

  /*
  ========================================================
  NAVIGATION
  ========================================================
  */

  const handleBack = () => {
    router.back();
  };

  /*
  ========================================================
  TRANSACTION DETAILS
  ========================================================
  */

  const handleTransactionPress = (transaction) => {
    if (!transaction?.id) {
      return;
    }

    router.push({
      pathname: "/wallet/transactions/[transactionId]",

      params: {
        transactionId: String(transaction.id),
      },
    });
  };

  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="small" color="#111827" />

        <Text style={styles.loadingText}>Loading transactions...</Text>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  NO WALLET
  ========================================================
  */

  if (!wallet) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <View style={styles.emptyIcon}>
          <Ionicons name="wallet-outline" size={28} color="#94A3B8" />
        </View>

        <Text style={styles.emptyTitle}>Wallet unavailable</Text>

        <Text style={styles.emptyDescription}>
          We could not find a wallet associated with your courier account.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchTransactions}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  UI
  ========================================================
  */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
            onPress={handleBack}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={21} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Transactions</Text>

            <Text style={styles.headerSubtitle}>
              Your complete wallet activity
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* =================================================
            BALANCE CARD
        ================================================= */}

        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>

              <Text style={styles.balanceAmount}>
                {formatCurrency(wallet.availableBalance)}
              </Text>
            </View>

            <View style={styles.balanceIcon}>
              <Ionicons name="wallet-outline" size={23} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.balanceBottom}>
            <View>
              <Text style={styles.pendingLabel}>Pending</Text>

              <Text style={styles.pendingAmount}>
                {formatCurrency(wallet.pendingBalance)}
              </Text>
            </View>

            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Credits</Text>

              <Text style={styles.balanceStatValue}>
                {formatShortCurrency(totalCredits)}
              </Text>
            </View>

            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Debits</Text>

              <Text style={styles.balanceStatValue}>
                {formatShortCurrency(totalDebits)}
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            FILTER HEADER
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wallet activity</Text>

          <Text style={styles.transactionCount}>
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1 ? "transaction" : "transactions"}
          </Text>
        </View>

        {/* =================================================
            FILTERS
        ================================================= */}

        <View style={styles.filterContainer}>
          {/* ALL */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "ALL" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("ALL")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === "ALL" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* CREDITS */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "CREDIT" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("CREDIT")}
            activeOpacity={0.8}
          >
            <View style={[styles.filterDot, styles.creditFilterDot]} />

            <Text
              style={[
                styles.filterText,
                filter === "CREDIT" && styles.filterTextActive,
              ]}
            >
              Credits
            </Text>
          </TouchableOpacity>

          {/* DEBITS */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "DEBIT" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("DEBIT")}
            activeOpacity={0.8}
          >
            <View style={[styles.filterDot, styles.debitFilterDot]} />

            <Text
              style={[
                styles.filterText,
                filter === "DEBIT" && styles.filterTextActive,
              ]}
            >
              Debits
            </Text>
          </TouchableOpacity>
        </View>

        {/* =================================================
            TRANSACTION LIST
        ================================================= */}

        {groupedTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={28} color="#9CA3AF" />
            </View>

            <Text style={styles.emptyTitle}>No transactions</Text>

            <Text style={styles.emptyDescription}>
              There are no transactions matching this filter.
            </Text>
          </View>
        ) : (
          groupedTransactions.map((group) => (
            <View key={group.label} style={styles.dateGroup}>
              {/* DATE */}

              <View style={styles.dateHeader}>
                <Text style={styles.dateLabel}>{group.label}</Text>

                <View style={styles.dateLine} />
              </View>

              {/* TRANSACTIONS */}

              <View style={styles.transactionCard}>
                {group.transactions.map((transaction, index) => {
                  const isCredit = transaction.type === "CREDIT";

                  const isPending = transaction.status === "PENDING";

                  const isFailed = transaction.status === "FAILED";

                  return (
                    <TouchableOpacity
                      key={transaction.id}
                      style={[
                        styles.transactionRow,
                        index !== group.transactions.length - 1 &&
                          styles.transactionRowBorder,
                      ]}
                      onPress={() => handleTransactionPress(transaction)}
                      activeOpacity={0.75}
                    >
                      {/* ICON */}

                      <View
                        style={[
                          styles.transactionIcon,
                          isCredit ? styles.creditIcon : styles.debitIcon,
                        ]}
                      >
                        <Ionicons
                          name={getTransactionIcon(transaction)}
                          size={19}
                          color={isCredit ? "#059669" : "#DC2626"}
                        />
                      </View>

                      {/* DETAILS */}

                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionTitle} numberOfLines={1}>
                          {getTransactionTitle(transaction)}
                        </Text>

                        <Text
                          style={styles.transactionSubtitle}
                          numberOfLines={1}
                        >
                          {getTransactionSubtitle(transaction)}
                        </Text>

                        <View style={styles.transactionMeta}>
                          <Text style={styles.transactionTime}>
                            {formatTime(transaction.createdAt)}
                          </Text>

                          <View style={styles.metaDivider} />

                          <View style={styles.statusWrapper}>
                            <View
                              style={[
                                styles.statusDot,
                                isPending
                                  ? styles.pendingDot
                                  : isFailed
                                    ? styles.failedDot
                                    : styles.completedDot,
                              ]}
                            />

                            <Text
                              style={[
                                styles.statusText,
                                isPending
                                  ? styles.pendingStatus
                                  : isFailed
                                    ? styles.failedStatus
                                    : styles.completedStatus,
                              ]}
                            >
                              {getStatusLabel(transaction.status)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* AMOUNT */}

                      <View style={styles.transactionRight}>
                        <Text
                          style={[
                            styles.transactionAmount,
                            isCredit ? styles.creditAmount : styles.debitAmount,
                          ]}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={15}
                          color="#CBD5E1"
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {/* =================================================
            INFORMATION
        ================================================= */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#6B7280"
            />
          </View>

          <Text style={styles.infoText}>
            Credits represent money added to your wallet, such as delivery
            earnings. Debits represent money removed from your wallet, such as
            payouts.
          </Text>
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          Transaction history helps you keep track of every movement in your
          Atua wallet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Transactions;
