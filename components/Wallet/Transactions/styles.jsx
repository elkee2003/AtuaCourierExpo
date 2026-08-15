import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  /*
  ==========================================================
  CONTAINER
  ==========================================================
  */

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 45,
  },

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  loadingContainer: {
    flex: 1,

    backgroundColor: "#F8FAFC",

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 10,

    fontSize: 13,

    fontWeight: "500",

    color: "#6B7280",
  },

  /*
  ==========================================================
  HEADER
  ==========================================================
  */

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 13,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 1,
  },

  headerCenter: {
    flex: 1,

    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 24,

    fontWeight: "750",

    color: "#111827",

    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 11,

    color: "#9CA3AF",

    marginTop: 3,
  },

  headerSpacer: {
    width: 44,
  },

  /*
  ==========================================================
  BALANCE CARD
  ==========================================================
  */

  balanceCard: {
    backgroundColor: "#111827",

    borderRadius: 22,

    padding: 21,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.14,

    shadowRadius: 15,

    elevation: 5,
  },

  balanceTop: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },

  balanceLabel: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 1.1,

    color: "#9CA3AF",

    marginBottom: 7,
  },

  balanceAmount: {
    fontSize: 32,

    fontWeight: "800",

    color: "#FFFFFF",

    letterSpacing: -1,
  },

  balanceIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#1F2937",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 12,
  },

  /*
  ==========================================================
  BALANCE BOTTOM
  ==========================================================
  */

  balanceBottom: {
    marginTop: 19,

    paddingTop: 16,

    borderTopWidth: 1,

    borderTopColor: "#374151",

    flexDirection: "row",

    alignItems: "flex-end",
  },

  pendingLabel: {
    fontSize: 10,

    fontWeight: "600",

    color: "#9CA3AF",

    marginBottom: 4,
  },

  pendingAmount: {
    fontSize: 15,

    fontWeight: "700",

    color: "#FFFFFF",
  },

  balanceStat: {
    marginLeft: 22,

    alignItems: "flex-end",
  },

  balanceStatLabel: {
    fontSize: 9,

    color: "#9CA3AF",

    marginBottom: 4,
  },

  balanceStatValue: {
    fontSize: 12,

    fontWeight: "700",

    color: "#FFFFFF",
  },

  /*
  ==========================================================
  SECTION HEADER
  ==========================================================
  */

  sectionHeader: {
    marginTop: 27,

    marginBottom: 11,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,

    fontWeight: "700",

    color: "#111827",

    letterSpacing: -0.2,
  },

  transactionCount: {
    fontSize: 11,

    fontWeight: "500",

    color: "#9CA3AF",
  },

  /*
  ==========================================================
  FILTERS
  ==========================================================
  */

  filterContainer: {
    flexDirection: "row",

    backgroundColor: "#EDEFF2",

    borderRadius: 14,

    padding: 4,

    marginBottom: 5,
  },

  filterButton: {
    flex: 1,

    height: 41,

    borderRadius: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: "#FFFFFF",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,

    shadowRadius: 4,

    elevation: 2,
  },

  filterText: {
    fontSize: 12,

    fontWeight: "600",

    color: "#6B7280",
  },

  filterTextActive: {
    color: "#111827",

    fontWeight: "700",
  },

  filterDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 6,
  },

  creditFilterDot: {
    backgroundColor: "#059669",
  },

  debitFilterDot: {
    backgroundColor: "#DC2626",
  },

  /*
  ==========================================================
  DATE GROUP
  ==========================================================
  */

  dateGroup: {
    marginTop: 22,
  },

  dateHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 9,
  },

  dateLabel: {
    fontSize: 11,

    fontWeight: "700",

    color: "#6B7280",

    marginRight: 10,
  },

  dateLine: {
    flex: 1,

    height: 1,

    backgroundColor: "#E5E7EB",
  },

  /*
  ==========================================================
  TRANSACTION CARD
  ==========================================================
  */

  transactionCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    overflow: "hidden",
  },

  transactionRow: {
    minHeight: 91,

    paddingHorizontal: 15,

    paddingVertical: 13,

    flexDirection: "row",

    alignItems: "center",
  },

  transactionRowBorder: {
    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6",
  },

  /*
  ==========================================================
  TRANSACTION ICON
  ==========================================================
  */

  transactionIcon: {
    width: 41,
    height: 41,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 13,
  },

  creditIcon: {
    backgroundColor: "#ECFDF5",
  },

  debitIcon: {
    backgroundColor: "#FEF2F2",
  },

  /*
  ==========================================================
  TRANSACTION DETAILS
  ==========================================================
  */

  transactionDetails: {
    flex: 1,

    minWidth: 0,
  },

  transactionTitle: {
    fontSize: 13,

    fontWeight: "650",

    color: "#111827",

    marginBottom: 3,
  },

  transactionSubtitle: {
    fontSize: 11,

    color: "#6B7280",

    marginBottom: 6,
  },

  transactionMeta: {
    flexDirection: "row",

    alignItems: "center",
  },

  transactionTime: {
    fontSize: 9.5,

    color: "#9CA3AF",
  },

  metaDivider: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: "#D1D5DB",

    marginHorizontal: 6,
  },

  /*
  ==========================================================
  STATUS
  ==========================================================
  */

  statusWrapper: {
    flexDirection: "row",

    alignItems: "center",
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 5,
  },

  pendingDot: {
    backgroundColor: "#D97706",
  },

  completedDot: {
    backgroundColor: "#059669",
  },

  failedDot: {
    backgroundColor: "#DC2626",
  },

  statusText: {
    fontSize: 9.5,

    fontWeight: "700",

    letterSpacing: 0.2,
  },

  pendingStatus: {
    color: "#D97706",
  },

  completedStatus: {
    color: "#059669",
  },

  failedStatus: {
    color: "#DC2626",
  },

  /*
  ==========================================================
  TRANSACTION AMOUNT
  ==========================================================
  */

  transactionRight: {
    alignItems: "flex-end",

    justifyContent: "center",

    marginLeft: 9,
  },

  transactionAmount: {
    fontSize: 13,

    fontWeight: "750",

    marginBottom: 6,
  },

  creditAmount: {
    color: "#059669",
  },

  debitAmount: {
    color: "#DC2626",
  },

  /*
  ==========================================================
  EMPTY STATE
  ==========================================================
  */

  emptyCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    paddingVertical: 46,

    paddingHorizontal: 25,

    alignItems: "center",

    marginTop: 20,
  },

  emptyIcon: {
    width: 60,
    height: 60,

    borderRadius: 18,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 11,

    lineHeight: 16,

    color: "#9CA3AF",

    textAlign: "center",

    maxWidth: 260,
  },

  /*
  ==========================================================
  EMPTY / WALLET RETRY
  ==========================================================
  */

  retryButton: {
    minWidth: 120,

    height: 43,

    paddingHorizontal: 18,

    borderRadius: 11,

    backgroundColor: "#111827",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 18,
  },

  retryButtonText: {
    fontSize: 12,

    fontWeight: "700",

    color: "#FFFFFF",
  },

  /*
  ==========================================================
  INFORMATION
  ==========================================================
  */

  infoCard: {
    marginTop: 22,

    padding: 15,

    backgroundColor: "#F1F5F9",

    borderRadius: 14,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  infoIcon: {
    width: 25,

    marginRight: 8,

    marginTop: 1,

    justifyContent: "center",
    alignItems: "center",
  },

  infoText: {
    flex: 1,

    fontSize: 10,

    lineHeight: 15,

    color: "#64748B",
  },

  /*
  ==========================================================
  FOOTER
  ==========================================================
  */

  footerText: {
    textAlign: "center",

    fontSize: 10,

    lineHeight: 15,

    color: "#9CA3AF",

    marginTop: 19,

    paddingHorizontal: 25,
  },
});

export default styles;
