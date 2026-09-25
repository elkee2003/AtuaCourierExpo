import { useAuthContext } from "@/providers/AuthProvider";
import { Transaction, Wallet } from "@/src/models";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DataStore } from "aws-amplify/datastore";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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

const formatCompactCurrency = (amount = 0) => {
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

  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

const isToday = (date) => {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

/*
==========================================================
TRANSACTION DISPLAY HELPERS
==========================================================
*/

const getTransactionTitle = (transaction) => {
  if (transaction?.type === "CREDIT") {
    return "Delivery earnings";
  }

  if (transaction?.type === "DEBIT") {
    return "Payout";
  }

  return "Wallet transaction";
};

const getTransactionDescription = (transaction) => {
  /*
  --------------------------------------------------------
  If the transaction is linked to an order,
  show the order first.
  --------------------------------------------------------
  */

  if (transaction?.orderID) {
    return `Order #${String(transaction.orderID).slice(0, 8).toUpperCase()}`;
  }

  /*
  --------------------------------------------------------
  Otherwise use the transaction description.
  --------------------------------------------------------
  */

  if (transaction?.description) {
    return transaction.description;
  }

  /*
  --------------------------------------------------------
  Finally use the transaction reference.
  --------------------------------------------------------
  */

  if (transaction?.reference) {
    return transaction.reference;
  }

  return "Wallet activity";
};

const getTransactionIcon = (transaction) => {
  if (transaction?.type === "CREDIT") {
    return "arrow-down-outline";
  }

  if (transaction?.type === "DEBIT") {
    return "arrow-up-outline";
  }

  return "swap-vertical-outline";
};

/*
==========================================================
WALLET OVERVIEW
==========================================================
*/

const WalletOverview = () => {
  const { dbCourier } = useAuthContext();

  /*
  ========================================================
  STATE
  ========================================================
  */

  const [wallet, setWallet] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [todaysEarnings, setTodaysEarnings] = useState(0);

  const [todaysDeliveries, setTodaysDeliveries] = useState(0);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /*
  ========================================================
  REALTIME SUBSCRIPTION REFS
  ========================================================

  We keep the DataStore subscriptions in refs so that
  they can be safely cleaned up whenever the courier or
  wallet changes.

  Wallet observer:
    Watches wallet balance changes.

  Transaction observer:
    Watches new/updated wallet transactions.
  ========================================================
  */

  const walletSubscriptionRef = useRef(null);

  const transactionSubscriptionRef = useRef(null);

  /*
  ========================================================
  FETCH WALLET
  ========================================================
  */

  const fetchWallet = useCallback(async () => {
    /*
    ------------------------------------------------------
    No courier yet
    ------------------------------------------------------
    */

    if (!dbCourier?.id) {
      setWallet(null);
      setTransactions([]);
      setTodaysEarnings(0);
      setTodaysDeliveries(0);
      setLoading(false);
      setRefreshing(false);

      return;
    }

    try {
      /*
      ------------------------------------------------------
      MAKE SURE WE HAVE A WALLET
      ------------------------------------------------------

      Courier schema:

        walletID
        wallet

      We deliberately use walletID instead of relying
      on the relationship being hydrated.
      ------------------------------------------------------
      */

      if (!dbCourier?.walletID) {
        console.log("Wallet Overview: courier has no walletID.");

        setWallet(null);
        setTransactions([]);
        setTodaysEarnings(0);
        setTodaysDeliveries(0);

        return;
      }

      /*
      ------------------------------------------------------
      QUERY WALLET
      ------------------------------------------------------
      */

      const walletResult = await DataStore.query(Wallet, dbCourier.walletID);

      if (!walletResult) {
        console.log("Wallet Overview: wallet not found:", dbCourier.walletID);

        setWallet(null);
        setTransactions([]);
        setTodaysEarnings(0);
        setTodaysDeliveries(0);

        return;
      }

      /*
      ------------------------------------------------------
      SAVE WALLET
      ------------------------------------------------------
      */

      setWallet(walletResult);

      /*
      ------------------------------------------------------
      QUERY WALLET TRANSACTIONS
      ------------------------------------------------------

      Transaction has:

        walletID
        type
        amount
        description
        orderID
        paymentID
        reference
        status
      ------------------------------------------------------
      */

      const walletTransactions = await DataStore.query(
        Transaction,
        (transaction) => transaction.walletID.eq(walletResult.id),
      );

      /*
      ------------------------------------------------------
      SORT NEWEST FIRST
      ------------------------------------------------------
      */

      const sortedTransactions = [...walletTransactions].sort(
        (a, b) =>
          getTransactionDate(b).getTime() - getTransactionDate(a).getTime(),
      );

      setTransactions(sortedTransactions);

      /*
      ------------------------------------------------------
      TODAY'S EARNINGS
      ------------------------------------------------------

      A CREDIT represents money entering the courier's
      wallet.

      We count today's CREDIT transactions as today's
      earnings.

      This intentionally includes both:

        PENDING
        COMPLETED

      because the courier generated the earnings today
      even if the funds have not yet become available.

      This is different from:

        wallet.availableBalance
      ------------------------------------------------------
      */

      const todayCredits = sortedTransactions.filter((transaction) => {
        const transactionDate = getTransactionDate(transaction);

        return transaction.type === "CREDIT" && isToday(transactionDate);
      });

      const todayAmount = todayCredits.reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );

      setTodaysEarnings(todayAmount);

      /*
      ------------------------------------------------------
      TODAY'S DELIVERIES
      ------------------------------------------------------

      A delivery earning should have an orderID.

      We count UNIQUE order IDs rather than simply
      counting CREDIT transactions.

      This protects us if one order ever creates more
      than one financial CREDIT transaction.
      ------------------------------------------------------
      */

      const todayOrderIds = new Set(
        todayCredits.map((transaction) => transaction.orderID).filter(Boolean),
      );

      setTodaysDeliveries(todayOrderIds.size);
    } catch (error) {
      console.error("Wallet Overview fetch error:", error);

      /*
      ------------------------------------------------------
      Do not destroy the previous wallet state if
      a refresh fails.
      ------------------------------------------------------
      */

      if (!wallet) {
        setWallet(null);
      }
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
    fetchWallet();
  }, [fetchWallet]);

  /*
  ========================================================
  REALTIME WALLET + TRANSACTION SUBSCRIPTIONS
  ========================================================

  THIS IS THE IMPORTANT NEW SECTION.

  DataStore.observe() listens for local/cloud DataStore
  changes.

  When a Lambda updates the Wallet through AppSync,
  DataStore receives the synced change and this observer
  fires.

  When a Lambda creates or updates a Transaction,
  the Transaction observer fires.

  We then re-fetch the wallet and transactions so the
  complete Wallet Overview stays synchronized.
  ========================================================
  */

  useEffect(() => {
    /*
    ------------------------------------------------------
    CLEAN UP ANY PREVIOUS SUBSCRIPTIONS
    ------------------------------------------------------

    This is important when:

      - courier changes
      - walletID changes
      - component remounts

    We do not want duplicate listeners.
    ------------------------------------------------------
    */

    if (walletSubscriptionRef.current) {
      walletSubscriptionRef.current.unsubscribe();
      walletSubscriptionRef.current = null;
    }

    if (transactionSubscriptionRef.current) {
      transactionSubscriptionRef.current.unsubscribe();
      transactionSubscriptionRef.current = null;
    }

    /*
    ------------------------------------------------------
    NO COURIER / NO WALLET
    ------------------------------------------------------
    */

    if (!dbCourier?.id || !dbCourier?.walletID) {
      return undefined;
    }

    /*
    ------------------------------------------------------
    WATCH WALLET
    ------------------------------------------------------

    This watches specifically this courier's wallet.

    Examples of changes this catches:

      availableBalance
      pendingBalance
      lifetimeEarnings
      any other Wallet field update

    When releaseFunds changes:

      pendingBalance
      availableBalance

    this observer fires.

    When releaseCourierMilestoneFunds changes the wallet,
    this observer fires.

    When processPayouts changes the wallet later,
    this observer will also fire.
    ------------------------------------------------------
    */

    walletSubscriptionRef.current = DataStore.observe(Wallet, (walletRecord) =>
      walletRecord.id.eq(dbCourier.walletID),
    ).subscribe({
      next: (change) => {
        /*
        --------------------------------------------------
        Ignore deleted records.
        --------------------------------------------------
        */

        if (change?.element?._deleted) {
          return;
        }

        console.log(
          "Wallet Overview realtime update:",
          change?.op,
          change?.element?.id,
        );

        /*
        --------------------------------------------------
        Re-fetch the wallet and transactions.

        We intentionally re-query instead of manually
        changing only one balance field.

        This keeps the entire overview synchronized.
        --------------------------------------------------
        */

        fetchWallet();
      },

      error: (error) => {
        console.error(
          "Wallet Overview wallet realtime subscription error:",
          error,
        );
      },
    });

    /*
    ------------------------------------------------------
    WATCH TRANSACTIONS
    ------------------------------------------------------

    This watches transactions belonging to this wallet.

    It catches:

      new CREDIT transaction
      CREDIT status changing
      new DEBIT transaction
      payout transaction updates

    This is important because Today's Earnings,
    Today's Deliveries and Recent Activity are based on
    Transaction records.
    ------------------------------------------------------
    */

    transactionSubscriptionRef.current = DataStore.observe(
      Transaction,
      (transaction) => transaction.walletID.eq(dbCourier.walletID),
    ).subscribe({
      next: (change) => {
        /*
          ------------------------------------------------
          Ignore deleted transactions.
          ------------------------------------------------
          */

        if (change?.element?._deleted) {
          return;
        }

        console.log(
          "Wallet Overview transaction realtime update:",
          change?.op,
          change?.element?.id,
        );

        /*
          ------------------------------------------------
          Re-fetch everything so:

            Today's Earnings
            Today's Deliveries
            Recent Activity

          remain synchronized.
          ------------------------------------------------
          */

        fetchWallet();
      },

      error: (error) => {
        console.error(
          "Wallet Overview transaction realtime subscription error:",
          error,
        );
      },
    });

    /*
    ------------------------------------------------------
    CLEANUP
    ------------------------------------------------------

    React calls this when:

      - component unmounts
      - dbCourier.id changes
      - dbCourier.walletID changes
      - fetchWallet dependency changes
    ------------------------------------------------------
    */

    return () => {
      if (walletSubscriptionRef.current) {
        walletSubscriptionRef.current.unsubscribe();
        walletSubscriptionRef.current = null;
      }

      if (transactionSubscriptionRef.current) {
        transactionSubscriptionRef.current.unsubscribe();
        transactionSubscriptionRef.current = null;
      }
    };
  }, [dbCourier?.id, dbCourier?.walletID, fetchWallet]);

  /*
  ========================================================
  REFRESH
  ========================================================
  */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchWallet();
  }, [fetchWallet]);

  /*
  ========================================================
  NAVIGATION
  ========================================================
  */

  const handleRequestPayout = () => {
    router.push("/wallet/payouts/requestpayout");
  };

  const handleViewTransactions = () => {
    router.push("/wallet/transactions");
  };

  const handleViewEarnings = () => {
    router.push("/wallet/earnings");
  };

  const handleViewPayouts = () => {
    router.push("/wallet/payouts");
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

        <Text style={styles.loadingText}>Loading wallet...</Text>
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
        <View style={styles.emptyWalletIcon}>
          <Ionicons name="wallet-outline" size={27} color="#64748B" />
        </View>

        <Text style={styles.emptyWalletTitle}>Wallet unavailable</Text>

        <Text style={styles.emptyWalletText}>
          Your courier wallet has not been set up yet. Please try again later.
        </Text>

        <TouchableOpacity
          style={styles.emptyWalletButton}
          onPress={fetchWallet}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyWalletButtonText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  RECENT TRANSACTIONS
  ========================================================
  */

  const recentTransactions = transactions.slice(0, 3);

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
          <View>
            <Text style={styles.eyebrow}>ATUA WALLET</Text>

            <Text style={styles.headerTitle}>Your money</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleViewTransactions}
            activeOpacity={0.75}
          >
            <Ionicons name="receipt-outline" size={21} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* =================================================
            AVAILABLE BALANCE
        ================================================= */}

        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>

              <Text style={styles.balanceAmount}>
                {formatCurrency(wallet.availableBalance)}
              </Text>
            </View>

            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceBottomRow}>
            <View style={styles.balanceBottomInfo}>
              <Text style={styles.balanceSmallLabel}>Ready for payout</Text>

              <Text style={styles.balanceSmallText}>
                Funds available to withdraw
              </Text>
            </View>

            <TouchableOpacity
              style={styles.payoutButton}
              onPress={handleRequestPayout}
              activeOpacity={0.8}
            >
              <Text style={styles.payoutButtonText}>Request payout</Text>

              <Ionicons name="arrow-forward" size={16} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* =================================================
            BALANCE SUMMARY
        ================================================= */}

        <View style={styles.summaryRow}>
          {/* PENDING */}

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="time-outline" size={19} color="#D97706" />
            </View>

            <Text style={styles.summaryLabel}>Pending earnings</Text>

            <Text style={styles.summaryAmount}>
              {formatCompactCurrency(wallet.pendingBalance)}
            </Text>

            <Text style={styles.summaryDescription}>Currently being held</Text>
          </View>

          {/* LIFETIME */}

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="trending-up-outline" size={19} color="#059669" />
            </View>

            <Text style={styles.summaryLabel}>Lifetime earnings</Text>

            <Text style={styles.summaryAmount}>
              {formatCompactCurrency(wallet.lifetimeEarnings)}
            </Text>

            <Text style={styles.summaryDescription}>Total earned on Atua</Text>
          </View>
        </View>

        {/* =================================================
            TODAY'S EARNINGS
        ================================================= */}

        <TouchableOpacity
          style={styles.todayCard}
          onPress={handleViewEarnings}
          activeOpacity={0.85}
        >
          <View style={styles.todayLeft}>
            <View style={styles.todayIcon}>
              <Ionicons name="calendar-outline" size={21} color="#FFFFFF" />
            </View>

            <View>
              <Text style={styles.todayLabel}>TODAY'S EARNINGS</Text>

              <Text style={styles.todayAmount}>
                {formatCurrency(todaysEarnings)}
              </Text>

              <Text style={styles.todaySubtext}>
                {todaysDeliveries}{" "}
                {todaysDeliveries === 1 ? "delivery" : "deliveries"} completed
              </Text>
            </View>
          </View>

          <View style={styles.todayArrow}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wallet</Text>
        </View>

        <View style={styles.quickActions}>
          {/* EARNINGS */}

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleViewEarnings}
            activeOpacity={0.75}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="stats-chart-outline" size={21} color="#111827" />
            </View>

            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Earnings history</Text>

              <Text style={styles.quickActionDescription}>
                See what you've earned
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={19} color="#9CA3AF" />
          </TouchableOpacity>

          {/* TRANSACTIONS */}

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleViewTransactions}
            activeOpacity={0.75}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="swap-vertical-outline"
                size={21}
                color="#111827"
              />
            </View>

            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Transactions</Text>

              <Text style={styles.quickActionDescription}>
                View wallet activity
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={19} color="#9CA3AF" />
          </TouchableOpacity>

          {/* PAYOUTS */}

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleViewPayouts}
            activeOpacity={0.75}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="cash-outline" size={21} color="#111827" />
            </View>

            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Payouts</Text>

              <Text style={styles.quickActionDescription}>
                View your payout history
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={19} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>

          <TouchableOpacity
            onPress={handleViewTransactions}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyActivity}>
              <View style={styles.emptyActivityIcon}>
                <Ionicons
                  name="swap-vertical-outline"
                  size={22}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.emptyActivityTitle}>
                No wallet activity yet
              </Text>

              <Text style={styles.emptyActivityText}>
                Your earnings and payouts will appear here.
              </Text>
            </View>
          ) : (
            recentTransactions.map((transaction, index) => {
              const isCredit = transaction.type === "CREDIT";

              const isPending = transaction.status === "PENDING";

              const isCompleted = transaction.status === "COMPLETED";

              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={[
                    styles.activityRow,
                    index !== recentTransactions.length - 1 &&
                      styles.activityRowBorder,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (!transaction?.id) {
                      return;
                    }

                    router.push({
                      pathname: "/wallet/transactions/[transactionId]",
                      params: {
                        transactionId: String(transaction.id),
                      },
                    });
                  }}
                >
                  {/* ICON */}

                  <View
                    style={[
                      styles.activityIcon,
                      isCredit ? styles.creditIcon : styles.debitIcon,
                    ]}
                  >
                    <Ionicons
                      name={getTransactionIcon(transaction)}
                      size={18}
                      color={isCredit ? "#059669" : "#DC2626"}
                    />
                  </View>

                  {/* DETAILS */}

                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {getTransactionTitle(transaction)}
                    </Text>

                    <Text style={styles.activityDescription} numberOfLines={1}>
                      {getTransactionDescription(transaction)}
                    </Text>

                    <View style={styles.activityStatusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          isPending
                            ? styles.pendingDot
                            : isCompleted
                              ? styles.completedDot
                              : styles.failedDot,
                        ]}
                      />

                      <Text
                        style={[
                          styles.activityStatus,
                          isPending
                            ? styles.pendingStatus
                            : isCompleted
                              ? styles.completedStatus
                              : styles.failedStatus,
                        ]}
                      >
                        {transaction.status || "UNKNOWN"}
                      </Text>
                    </View>
                  </View>

                  {/* AMOUNT */}

                  <Text
                    style={[
                      styles.activityAmount,
                      isCredit ? styles.creditAmount : styles.debitAmount,
                    ]}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          Your wallet reflects earnings generated from deliveries, funds being
          held, and payouts made to your bank account.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WalletOverview;
