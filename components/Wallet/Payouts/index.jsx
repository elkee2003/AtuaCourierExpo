import { useAuthContext } from "@/providers/AuthProvider";
import { Payout, Wallet } from "@/src/models";

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

const formatDate = (dateString) => {
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
STATUS COLOR
==========================================================
*/

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

/*
==========================================================
COMPONENT
==========================================================
*/

const Payouts = () => {
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

  const [payouts, setPayouts] = useState([]);

  const [filter, setFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /*
  ========================================================
  COURIER ID
  ========================================================
  */

  const courierId = dbCourier?.id;

  /*
  ========================================================
  FETCH WALLET
  ========================================================
  */

  const fetchWallet = useCallback(async () => {
    if (!courierId) {
      setWallet(null);
      return null;
    }

    try {
      /*
      ----------------------------------------------------
      FIRST:
      Use courier.walletID if available.
      ----------------------------------------------------
      */

      if (dbCourier?.walletID) {
        const walletById = await DataStore.query(Wallet, dbCourier.walletID);

        if (
          walletById &&
          walletById.ownerID === courierId &&
          walletById.ownerType === "COURIER"
        ) {
          setWallet(walletById);

          return walletById;
        }
      }

      /*
      ----------------------------------------------------
      FALLBACK:
      Find wallet using:

      ownerID = courier ID
      ownerType = COURIER
      ----------------------------------------------------
      */

      const wallets = await DataStore.query(Wallet, (walletQuery) =>
        walletQuery.ownerID.eq(courierId),
      );

      const courierWallet = wallets.find(
        (item) => item.ownerID === courierId && item.ownerType === "COURIER",
      );

      setWallet(courierWallet || null);

      return courierWallet || null;
    } catch (error) {
      console.error("Failed to load courier wallet:", error);

      setWallet(null);

      throw error;
    }
  }, [courierId, dbCourier?.walletID]);

  /*
  ========================================================
  FETCH PAYOUTS
  ========================================================
  */

  const fetchPayouts = useCallback(async () => {
    if (!courierId) {
      setPayouts([]);
      return [];
    }

    try {
      /*
      ----------------------------------------------------
      Payout has:

      courierID: ID! @index(name: "byCourier")

      So query directly against courierID.
      ----------------------------------------------------
      */

      const result = await DataStore.query(Payout, (payoutQuery) =>
        payoutQuery.courierID.eq(courierId),
      );

      /*
      ----------------------------------------------------
      SORT

      Newest first.

      PAID:
      use paidAt

      PROCESSING:
      use processedAt

      PENDING:
      use createdAt

      FAILED:
      use failedAt
      ----------------------------------------------------
      */

      const sortedPayouts = [...result].sort((a, b) => {
        const getTimestamp = (payout) => {
          return new Date(
            payout.paidAt ||
              payout.processedAt ||
              payout.failedAt ||
              payout.createdAt ||
              0,
          ).getTime();
        };

        return getTimestamp(b) - getTimestamp(a);
      });

      setPayouts(sortedPayouts);

      return sortedPayouts;
    } catch (error) {
      console.error("Failed to load courier payouts:", error);

      setPayouts([]);

      throw error;
    }
  }, [courierId]);

  /*
  ========================================================
  LOAD EVERYTHING
  ========================================================
  */

  const loadPayoutData = useCallback(async () => {
    if (!courierId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      await Promise.all([fetchWallet(), fetchPayouts()]);
    } catch (error) {
      console.error("Failed to load payout data:", error);
    } finally {
      setLoading(false);
    }
  }, [courierId, fetchWallet, fetchPayouts]);

  /*
  ========================================================
  INITIAL LOAD
  ========================================================
  */

  useEffect(() => {
    loadPayoutData();
  }, [loadPayoutData]);

  /*
  ========================================================
  OBSERVE PAYOUTS

  This means if processPayouts changes:

  PENDING
      ↓
  PROCESSING
      ↓
  PAID

  the page can refresh automatically.
  ========================================================
  */

  useEffect(() => {
    if (!courierId) {
      return undefined;
    }

    const subscription = DataStore.observe(Payout).subscribe(
      ({ opType, element }) => {
        if (!["INSERT", "UPDATE", "DELETE"].includes(opType)) {
          return;
        }

        /*
          ------------------------------------------------
          Only react to this courier's payouts.
          ------------------------------------------------
          */

        if (element?.courierID !== courierId) {
          return;
        }

        fetchPayouts().catch((error) => {
          console.error("Failed to refresh payouts:", error);
        });
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [courierId, fetchPayouts]);

  /*
  ========================================================
  OBSERVE WALLET
  ========================================================
  */

  useEffect(() => {
    if (!courierId) {
      return undefined;
    }

    const subscription = DataStore.observe(Wallet).subscribe(
      ({ opType, element }) => {
        if (!["INSERT", "UPDATE", "DELETE"].includes(opType)) {
          return;
        }

        /*
          ------------------------------------------------
          If this is the courier's wallet,
          refresh it.
          ------------------------------------------------
          */

        if (wallet?.id && element?.id === wallet.id) {
          fetchWallet().catch((error) => {
            console.error("Failed to refresh wallet:", error);
          });
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [courierId, wallet?.id, fetchWallet]);

  /*
  ========================================================
  REFRESH
  ========================================================
  */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([fetchWallet(), fetchPayouts()]);
    } catch (error) {
      console.error("Refresh payout error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchWallet, fetchPayouts]);

  /*
  ========================================================
  FILTER PAYOUTS
  ========================================================
  */

  const filteredPayouts = useMemo(() => {
    if (filter === "ALL") {
      return payouts;
    }

    return payouts.filter((payout) => payout.status === filter);
  }, [filter, payouts]);

  /*
  ========================================================
  PAYOUT SUMMARY
  ========================================================
  */

  const totalPaidOut = useMemo(() => {
    return payouts
      .filter((payout) => payout.status === "PAID")
      .reduce((total, payout) => total + Number(payout.amount || 0), 0);
  }, [payouts]);

  const totalPayouts = payouts.length;

  const lastPaidPayout = useMemo(() => {
    return (
      payouts
        .filter((payout) => payout.status === "PAID")
        .sort((a, b) => {
          const dateA = new Date(
            a.paidAt || a.processedAt || a.createdAt || 0,
          ).getTime();

          const dateB = new Date(
            b.paidAt || b.processedAt || b.createdAt || 0,
          ).getTime();

          return dateB - dateA;
        })[0] || null
    );
  }, [payouts]);

  /*
  ========================================================
  PENDING PAYOUT TOTAL
  ========================================================
  */

  const pendingPayoutAmount = useMemo(() => {
    return payouts
      .filter(
        (payout) =>
          payout.status === "PENDING" || payout.status === "PROCESSING",
      )
      .reduce((total, payout) => total + Number(payout.amount || 0), 0);
  }, [payouts]);

  /*
  ========================================================
  NAVIGATION
  ========================================================
  */

  const handleBack = () => {
    router.back();
  };

  const handleRequestPayout = () => {
    router.push("/wallet/payouts/requestpayout");
  };

  const handlePayoutPress = (payout) => {
    if (!payout?.id) {
      return;
    }

    router.push({
      pathname: "/wallet/payouts/[payoutId]",
      params: {
        payoutId: String(payout.id),
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#111827" />

          <Text style={styles.loadingText}>Loading payouts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  ========================================================
  NO COURIER
  ========================================================
  */

  if (!courierId) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <Ionicons name="person-outline" size={30} color="#9CA3AF" />
          </View>

          <Text style={styles.notFoundTitle}>Courier unavailable</Text>

          <Text style={styles.notFoundText}>
            We couldn't identify the current courier account.
          </Text>

          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={handleBack}
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
            <Text style={styles.headerTitle}>Payouts</Text>

            <Text style={styles.headerSubtitle}>Manage your withdrawals</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* =================================================
            AVAILABLE BALANCE
        ================================================= */}

        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE TO WITHDRAW</Text>

              <Text style={styles.balanceAmount}>
                {formatCurrency(wallet?.availableBalance)}
              </Text>
            </View>

            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={23} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.balanceBottom}>
            <View style={styles.balanceBottomItem}>
              <Text style={styles.balanceBottomLabel}>Pending earnings</Text>

              <Text style={styles.balanceBottomValue}>
                {formatCurrency(wallet?.pendingBalance)}
              </Text>
            </View>

            <View style={styles.balanceDivider} />

            <View style={styles.balanceBottomItem}>
              <Text style={styles.balanceBottomLabel}>Paid out</Text>

              <Text style={styles.balanceBottomValue}>
                {formatShortCurrency(totalPaidOut)}
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            REQUEST PAYOUT
        ================================================= */}

        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestPayout}
          activeOpacity={0.8}
        >
          <View style={styles.requestIcon}>
            <Ionicons name="arrow-up-outline" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.requestContent}>
            <Text style={styles.requestTitle}>Request payout</Text>

            <Text style={styles.requestDescription}>
              Withdraw money to your registered bank account
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={19} color="#FFFFFF" />
        </TouchableOpacity>

        {/* =================================================
            PAYOUT SUMMARY
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payout summary</Text>
        </View>

        <View style={styles.summaryCard}>
          {/* TOTAL PAID */}

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.summaryIconGreen]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color="#059669"
              />
            </View>

            <Text style={styles.summaryLabel}>Total paid</Text>

            <Text style={styles.summaryValue}>
              {formatShortCurrency(totalPaidOut)}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          {/* PAYOUT COUNT */}

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.summaryIconBlue]}>
              <Ionicons name="receipt-outline" size={19} color="#2563EB" />
            </View>

            <Text style={styles.summaryLabel}>Payouts</Text>

            <Text style={styles.summaryValue}>{totalPayouts}</Text>
          </View>

          <View style={styles.summaryDivider} />

          {/* LAST PAYOUT */}

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.summaryIconPurple]}>
              <Ionicons name="time-outline" size={19} color="#7C3AED" />
            </View>

            <Text style={styles.summaryLabel}>Last payout</Text>

            <Text style={styles.summaryValue} numberOfLines={1}>
              {lastPaidPayout
                ? formatShortCurrency(lastPaidPayout.amount)
                : "—"}
            </Text>
          </View>
        </View>

        {/* =================================================
            CURRENT PAYOUTS
        ================================================= */}

        {pendingPayoutAmount > 0 && (
          <View style={styles.pendingSummaryCard}>
            <View style={styles.pendingSummaryIcon}>
              <Ionicons name="time-outline" size={19} color="#D97706" />
            </View>

            <View style={styles.pendingSummaryContent}>
              <Text style={styles.pendingSummaryTitle}>Payout in progress</Text>

              <Text style={styles.pendingSummaryText}>
                {formatCurrency(pendingPayoutAmount)} is currently pending or
                processing.
              </Text>
            </View>
          </View>
        )}

        {/* =================================================
            PAYOUT HISTORY
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Payout history</Text>

            <Text style={styles.sectionSubtitle}>Your recent withdrawals</Text>
          </View>

          <Text style={styles.payoutCount}>{filteredPayouts.length}</Text>
        </View>

        {/* =================================================
            FILTERS
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
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

          {/* PENDING */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "PENDING" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("PENDING")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === "PENDING" && styles.filterTextActive,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          {/* PROCESSING */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "PROCESSING" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("PROCESSING")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === "PROCESSING" && styles.filterTextActive,
              ]}
            >
              Processing
            </Text>
          </TouchableOpacity>

          {/* PAID */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "PAID" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("PAID")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === "PAID" && styles.filterTextActive,
              ]}
            >
              Paid
            </Text>
          </TouchableOpacity>

          {/* FAILED */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "FAILED" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("FAILED")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === "FAILED" && styles.filterTextActive,
              ]}
            >
              Failed
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* =================================================
            PAYOUT LIST
        ================================================= */}

        {filteredPayouts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cash-outline" size={28} color="#9CA3AF" />
            </View>

            <Text style={styles.emptyTitle}>No payouts found</Text>

            <Text style={styles.emptyDescription}>
              There are no payouts matching the selected filter.
            </Text>
          </View>
        ) : (
          <View style={styles.payoutList}>
            {filteredPayouts.map((payout, index) => {
              const isLast = index === filteredPayouts.length - 1;

              const statusColor = getStatusColor(payout.status);

              /*
                ------------------------------------------------
                Use actual payout timestamp.
                ------------------------------------------------
                */

              const displayDate =
                payout.paidAt ||
                payout.processedAt ||
                payout.failedAt ||
                payout.createdAt;

              return (
                <TouchableOpacity
                  key={payout.id}
                  style={[styles.payoutRow, !isLast && styles.payoutRowBorder]}
                  onPress={() => handlePayoutPress(payout)}
                  activeOpacity={0.75}
                >
                  {/* ICON */}

                  <View
                    style={[
                      styles.payoutIcon,
                      payout.status === "PAID" && styles.payoutIconPaid,
                      payout.status === "PROCESSING" &&
                        styles.payoutIconProcessing,
                      payout.status === "PENDING" && styles.payoutIconPending,
                      payout.status === "FAILED" && styles.payoutIconFailed,
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(payout.status)}
                      size={19}
                      color={statusColor}
                    />
                  </View>

                  {/* DETAILS */}

                  <View style={styles.payoutDetails}>
                    <Text style={styles.payoutTitle}>Bank payout</Text>

                    <Text style={styles.payoutBank} numberOfLines={1}>
                      {payout.bankName || "Registered bank"} ••••{" "}
                      {payout.accountNumber
                        ? payout.accountNumber.slice(-4)
                        : "----"}
                    </Text>

                    <View style={styles.payoutMeta}>
                      <Text style={styles.payoutDate}>
                        {formatDate(displayDate)}
                      </Text>

                      <View style={styles.metaDot} />

                      <View style={styles.statusWrapper}>
                        <View
                          style={[
                            styles.statusDot,
                            payout.status === "PAID" && styles.statusDotPaid,
                            payout.status === "PROCESSING" &&
                              styles.statusDotProcessing,
                            payout.status === "PENDING" &&
                              styles.statusDotPending,
                            payout.status === "FAILED" &&
                              styles.statusDotFailed,
                          ]}
                        />

                        <Text
                          style={[
                            styles.payoutStatus,
                            payout.status === "PAID" && styles.payoutStatusPaid,
                            payout.status === "PROCESSING" &&
                              styles.payoutStatusProcessing,
                            payout.status === "PENDING" &&
                              styles.payoutStatusPending,
                            payout.status === "FAILED" &&
                              styles.payoutStatusFailed,
                          ]}
                        >
                          {getStatusLabel(payout.status)}
                        </Text>
                      </View>
                    </View>

                    {/* REFERENCE */}

                    {payout.reference && (
                      <Text style={styles.payoutReference} numberOfLines={1}>
                        {payout.reference}
                      </Text>
                    )}
                  </View>

                  {/* AMOUNT */}

                  <View style={styles.payoutRight}>
                    <Text style={styles.payoutAmount}>
                      {formatCurrency(payout.amount)}
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
        )}

        {/* =================================================
            SECURITY / INFORMATION
        ================================================= */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#64748B"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Payouts go to your registered bank
            </Text>

            <Text style={styles.infoText}>
              Make sure your bank details are correct before requesting a
              payout. Payouts cannot be redirected after processing begins.
            </Text>
          </View>
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          Payout history shows withdrawals requested from your available wallet
          balance.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payouts;
