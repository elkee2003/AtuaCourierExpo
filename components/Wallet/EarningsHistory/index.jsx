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
    return null;
  }

  const date = new Date(transaction.createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const startOfDay = (date = new Date()) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const startOfWeek = (date = new Date()) => {
  const result = startOfDay(date);

  /*
  --------------------------------------------------------
  Monday = first day of week
  --------------------------------------------------------
  */

  const day = result.getDay();

  const daysFromMonday = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - daysFromMonday);

  return result;
};

const startOfMonth = (date = new Date()) => {
  const result = new Date(date);

  result.setDate(1);
  result.setHours(0, 0, 0, 0);

  return result;
};

const endOfPeriod = (period) => {
  const now = new Date();

  if (period === "today") {
    const end = new Date(now);

    end.setHours(23, 59, 59, 999);

    return end;
  }

  if (period === "week") {
    const start = startOfWeek(now);

    const end = new Date(start);

    end.setDate(end.getDate() + 6);

    end.setHours(23, 59, 59, 999);

    return end;
  }

  /*
  --------------------------------------------------------
  MONTH
  --------------------------------------------------------
  */

  const start = startOfMonth(now);

  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

  end.setHours(23, 59, 59, 999);

  return end;
};

const getPeriodStart = (period) => {
  if (period === "today") {
    return startOfDay();
  }

  if (period === "week") {
    return startOfWeek();
  }

  return startOfMonth();
};

const isWithinPeriod = (transaction, period) => {
  const date = getTransactionDate(transaction);

  if (!date) {
    return false;
  }

  const start = getPeriodStart(period);

  const end = endOfPeriod(period);

  return date >= start && date <= end;
};

/*
==========================================================
DISPLAY DATE HELPERS
==========================================================
*/

const getRecordDateLabel = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const today = startOfDay();

  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return "Today";
  }

  if (startOfDay(date).getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateValue) => {
  const date = new Date(dateValue);

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
COMPONENT
==========================================================
*/

const EarningsHistory = () => {
  /*
  ========================================================
  AUTH
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

  const [period, setPeriod] = useState("week");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /*
  ========================================================
  FETCH WALLET + TRANSACTIONS
  ========================================================
  */

  const fetchEarnings = useCallback(async () => {
    if (!dbCourier?.walletID) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      setRefreshing(false);

      return;
    }

    try {
      /*
        ----------------------------------------------------
        WALLET
        ----------------------------------------------------
        */

      const walletResult = await DataStore.query(Wallet, dbCourier.walletID);

      if (!walletResult) {
        setWallet(null);
        setTransactions([]);

        return;
      }

      setWallet(walletResult);

      /*
        ----------------------------------------------------
        TRANSACTIONS
        ----------------------------------------------------

        Only CREDIT transactions belong
        to courier earnings.
        */

      const result = await DataStore.query(Transaction, (transaction) =>
        transaction.walletID.eq(walletResult.id),
      );

      /*
        ----------------------------------------------------
        KEEP ONLY EARNINGS
        ----------------------------------------------------

        DEBIT transactions are payouts,
        so they must NOT appear as earnings.
        */

      const earnings = result
        .filter((transaction) => transaction.type === "CREDIT")
        .filter((transaction) => transaction.status !== "FAILED")
        .sort((a, b) => {
          const dateA = getTransactionDate(a);

          const dateB = getTransactionDate(b);

          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });

      setTransactions(earnings);
    } catch (error) {
      console.error("Earnings fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dbCourier?.walletID]);

  /*
  ========================================================
  INITIAL LOAD
  ========================================================
  */

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  /*
  ========================================================
  REFRESH
  ========================================================
  */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchEarnings();
  }, [fetchEarnings]);

  /*
  ========================================================
  CURRENT PERIOD TRANSACTIONS
  ========================================================
  */

  const currentPeriodTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      isWithinPeriod(transaction, period),
    );
  }, [transactions, period]);

  /*
  ========================================================
  PERIOD TOTALS
  ========================================================
  */

  const currentData = useMemo(() => {
    const total = currentPeriodTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0,
    );

    /*
    ------------------------------------------------------
    PENDING
    ------------------------------------------------------
    */

    const pending = currentPeriodTransactions
      .filter((transaction) => transaction.status === "PENDING")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    /*
    ------------------------------------------------------
    RELEASED
    ------------------------------------------------------

    COMPLETED CREDIT transactions
    represent earnings that have
    been released.
    */

    const released = currentPeriodTransactions
      .filter((transaction) => transaction.status === "COMPLETED")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    /*
    ------------------------------------------------------
    DELIVERIES
    ------------------------------------------------------

    One CREDIT normally represents
    one earnings allocation.

    We count unique order IDs where
    available.
    */

    const orderIds = currentPeriodTransactions
      .map((transaction) => transaction.orderID)
      .filter(Boolean);

    const uniqueOrders = new Set(orderIds);

    /*
    ------------------------------------------------------
    FALLBACK

    If a transaction has no orderID,
    count the transaction itself.
    ------------------------------------------------------
    */

    const deliveries =
      orderIds.length > 0
        ? uniqueOrders.size
        : currentPeriodTransactions.length;

    const average = deliveries > 0 ? total / deliveries : 0;

    return {
      total,
      deliveries,
      average,
      pending,
      released,
    };
  }, [currentPeriodTransactions]);

  /*
  ========================================================
  PERIOD LABEL
  ========================================================
  */

  const periodLabel =
    period === "today"
      ? "Today"
      : period === "week"
        ? "This week"
        : "This month";

  /*
  ========================================================
  WEEKLY CHART
  ========================================================
  */

  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek();

    const days = [];

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(weekStart);

      date.setDate(date.getDate() + index);

      const nextDay = new Date(date);

      nextDay.setDate(nextDay.getDate() + 1);

      const dayTransactions = transactions.filter((transaction) => {
        const transactionDate = getTransactionDate(transaction);

        if (!transactionDate) {
          return false;
        }

        return transactionDate >= date && transactionDate < nextDay;
      });

      const amount = dayTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0,
      );

      /*
      ------------------------------------------------------
      UNIQUE DELIVERIES
      ------------------------------------------------------
      */

      const orderIds = dayTransactions
        .map((transaction) => transaction.orderID)
        .filter(Boolean);

      const deliveries =
        orderIds.length > 0 ? new Set(orderIds).size : dayTransactions.length;

      days.push({
        day: date
          .toLocaleDateString("en-NG", {
            weekday: "short",
          })
          .charAt(0),

        date: date.toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
        }),

        amount,

        deliveries,
      });
    }

    return days;
  }, [transactions]);

  /*
  ========================================================
  MAX CHART VALUE
  ========================================================
  */

  const maxChartValue = useMemo(() => {
    return Math.max(...weeklyData.map((item) => item.amount), 1);
  }, [weeklyData]);

  /*
  ========================================================
  RECENT EARNINGS
  ========================================================
  */

  const recentEarnings = useMemo(() => {
    return currentPeriodTransactions.slice(0, 20);
  }, [currentPeriodTransactions]);

  /*
  ========================================================
  ORDER NAVIGATION
  ========================================================
  */

  const handleOrderPress = (transaction) => {
    if (!transaction?.orderID) {
      return;
    }

    router.push({
      pathname: "/orderhistory/orderdetails/[id]",
      params: {
        id: String(transaction.orderID),
      },
    });
  };

  /*
  ========================================================
  BACK
  ========================================================
  */

  const handleBack = () => {
    router.back();
  };

  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#111827" />

          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <Ionicons name="wallet-outline" size={30} color="#9CA3AF" />
          </View>

          <Text style={styles.notFoundTitle}>Wallet unavailable</Text>

          <Text style={styles.notFoundText}>
            We couldn't find a wallet associated with this courier account.
          </Text>

          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={fetchEarnings}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Try again</Text>
          </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Earnings</Text>

            <Text style={styles.headerSubtitle}>Your delivery performance</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* =================================================
            PERIOD SELECTOR
        ================================================= */}

        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "today" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("today")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.periodText,
                period === "today" && styles.periodTextActive,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "week" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("week")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.periodText,
                period === "week" && styles.periodTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "month" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("month")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.periodText,
                period === "month" && styles.periodTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* =================================================
            MAIN EARNINGS CARD
        ================================================= */}

        <View style={styles.mainEarningsCard}>
          <View style={styles.mainEarningsTop}>
            <View>
              <Text style={styles.mainEarningsLabel}>
                {periodLabel.toUpperCase()} EARNINGS
              </Text>

              <Text style={styles.mainEarningsAmount}>
                {formatCurrency(currentData.total)}
              </Text>
            </View>

            <View style={styles.trendBadge}>
              <Ionicons name="stats-chart-outline" size={15} color="#059669" />

              <Text style={styles.trendText}>
                {currentData.deliveries} deliveries
              </Text>
            </View>
          </View>

          <Text style={styles.mainEarningsSubtext}>
            Total courier earnings allocated during {periodLabel.toLowerCase()}.
          </Text>
        </View>

        {/* =================================================
            PERFORMANCE SUMMARY
        ================================================= */}

        <View style={styles.statsRow}>
          {/* DELIVERIES */}

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="cube-outline" size={20} color="#111827" />
            </View>

            <Text style={styles.statLabel}>Deliveries</Text>

            <Text style={styles.statValue}>{currentData.deliveries}</Text>

            <Text style={styles.statDescription}>Completed</Text>
          </View>

          {/* AVERAGE */}

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="calculator-outline" size={20} color="#111827" />
            </View>

            <Text style={styles.statLabel}>Average</Text>

            <Text style={styles.statValueSmall}>
              {formatShortCurrency(currentData.average)}
            </Text>

            <Text style={styles.statDescription}>Per delivery</Text>
          </View>

          {/* PENDING */}

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="time-outline" size={20} color="#D97706" />
            </View>

            <Text style={styles.statLabel}>Pending</Text>

            <Text style={styles.statValueSmall}>
              {formatShortCurrency(currentData.pending)}
            </Text>

            <Text style={styles.statDescription}>Being held</Text>
          </View>
        </View>

        {/* =================================================
            EARNINGS CHART
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Earnings activity</Text>

            <Text style={styles.sectionSubtitle}>Daily earnings this week</Text>
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendDot} />

            <Text style={styles.legendText}>Earnings</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartTopValue}>
            <Text style={styles.chartTopValueText}>
              {formatShortCurrency(maxChartValue)}
            </Text>
          </View>

          <View style={styles.chartArea}>
            {/* GRID */}

            <View style={styles.chartGridLineOne} />

            <View style={styles.chartGridLineTwo} />

            <View style={styles.chartGridLineThree} />

            {/* BARS */}

            <View style={styles.barsContainer}>
              {weeklyData.map((item, index) => {
                const height =
                  item.amount === 0
                    ? 5
                    : Math.max((item.amount / maxChartValue) * 150, 8);

                const today = new Date();

                const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

                const itemDate = new Date(startOfWeek());

                itemDate.setDate(itemDate.getDate() + index);

                const itemKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}`;

                const isToday = todayKey === itemKey;

                return (
                  <View key={`${item.date}-${index}`} style={styles.barColumn}>
                    <View style={styles.barValueContainer}>
                      {item.amount > 0 && (
                        <Text style={styles.barValue}>
                          {formatShortCurrency(item.amount)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height,
                          },
                          isToday && styles.barToday,
                          item.amount === 0 && styles.barEmpty,
                        ]}
                      />
                    </View>

                    <Text
                      style={[styles.barDay, isToday && styles.barDayToday]}
                    >
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* =================================================
            EARNINGS BREAKDOWN
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earnings breakdown</Text>
        </View>

        <View style={styles.breakdownCard}>
          {/* TOTAL */}

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.breakdownIcon, styles.totalIcon]}>
                <Ionicons name="cash-outline" size={18} color="#111827" />
              </View>

              <View>
                <Text style={styles.breakdownTitle}>Total earnings</Text>

                <Text style={styles.breakdownDescription}>{periodLabel}</Text>
              </View>
            </View>

            <Text style={styles.breakdownAmount}>
              {formatCurrency(currentData.total)}
            </Text>
          </View>

          {/* RELEASED */}

          <View style={[styles.breakdownRow, styles.breakdownBorder]}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.breakdownIcon, styles.releasedIcon]}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#059669"
                />
              </View>

              <View>
                <Text style={styles.breakdownTitle}>Released</Text>

                <Text style={styles.breakdownDescription}>
                  Available in wallet
                </Text>
              </View>
            </View>

            <Text style={[styles.breakdownAmount, styles.releasedAmount]}>
              {formatCurrency(currentData.released)}
            </Text>
          </View>

          {/* PENDING */}

          <View style={[styles.breakdownRow, styles.breakdownBorder]}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.breakdownIcon, styles.pendingIcon]}>
                <Ionicons name="time-outline" size={18} color="#D97706" />
              </View>

              <View>
                <Text style={styles.breakdownTitle}>Pending</Text>

                <Text style={styles.breakdownDescription}>
                  Currently being held
                </Text>
              </View>
            </View>

            <Text style={[styles.breakdownAmount, styles.pendingAmount]}>
              {formatCurrency(currentData.pending)}
            </Text>
          </View>
        </View>

        {/* =================================================
            RECENT EARNINGS
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent earnings</Text>

            <Text style={styles.sectionSubtitle}>
              Your latest delivery earnings
            </Text>
          </View>
        </View>

        <View style={styles.earningsList}>
          {recentEarnings.length === 0 ? (
            <View style={styles.emptyEarnings}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="trending-up-outline"
                  size={26}
                  color="#9CA3AF"
                />
              </View>

              <Text style={styles.emptyTitle}>No earnings yet</Text>

              <Text style={styles.emptyDescription}>
                Your delivery earnings will appear here once they are allocated
                to your wallet.
              </Text>
            </View>
          ) : (
            recentEarnings.map((transaction, index) => {
              const isPending = transaction.status === "PENDING";

              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={[
                    styles.earningRow,
                    index !== recentEarnings.length - 1 &&
                      styles.earningRowBorder,
                  ]}
                  onPress={() => handleOrderPress(transaction)}
                  activeOpacity={0.75}
                >
                  {/* ICON */}

                  <View
                    style={[
                      styles.earningIcon,
                      isPending
                        ? styles.earningIconPending
                        : styles.earningIconCompleted,
                    ]}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={19}
                      color={isPending ? "#D97706" : "#059669"}
                    />
                  </View>

                  {/* DETAILS */}

                  <View style={styles.earningDetails}>
                    <Text style={styles.earningTitle} numberOfLines={1}>
                      Delivery earnings
                    </Text>

                    <Text style={styles.earningOrder} numberOfLines={1}>
                      {transaction.orderID
                        ? `Order #${transaction.orderID}`
                        : "Delivery earnings"}
                    </Text>

                    <View style={styles.earningMeta}>
                      <Text style={styles.earningDate}>
                        {getRecordDateLabel(transaction.createdAt)}
                      </Text>

                      <View style={styles.metaDivider} />

                      <Text style={styles.earningDate}>
                        {formatTime(transaction.createdAt)}
                      </Text>

                      <View
                        style={[
                          styles.statusDot,
                          isPending ? styles.pendingDot : styles.completedDot,
                        ]}
                      />

                      <Text
                        style={[
                          styles.earningStatus,
                          isPending
                            ? styles.pendingStatus
                            : styles.completedStatus,
                        ]}
                      >
                        {isPending ? "PENDING" : "RELEASED"}
                      </Text>
                    </View>
                  </View>

                  {/* AMOUNT */}

                  <View style={styles.earningRight}>
                    <Text style={styles.earningAmount}>
                      +{formatCurrency(transaction.amount)}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#9CA3AF"
          />

          <Text style={styles.footerText}>
            Earnings are based on courier earnings allocated to your wallet.
            Pending earnings remain held until they are released.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EarningsHistory;
