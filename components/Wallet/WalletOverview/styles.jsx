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
    paddingTop: 16,
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
    color: "#6B7280",
    fontWeight: "500",
  },

  /*
  ==========================================================
  EMPTY WALLET
  ==========================================================
  */

  emptyWalletIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    marginBottom: 16,
  },

  emptyWalletTitle: {
    fontSize: 20,
    fontWeight: "750",
    color: "#111827",

    marginBottom: 7,
  },

  emptyWalletText: {
    maxWidth: 290,

    fontSize: 13,
    lineHeight: 19,

    color: "#6B7280",

    textAlign: "center",

    marginBottom: 20,
  },

  emptyWalletButton: {
    minWidth: 120,
    height: 44,

    paddingHorizontal: 18,

    borderRadius: 12,

    backgroundColor: "#111827",

    justifyContent: "center",
    alignItems: "center",
  },

  emptyWalletButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /*
  ==========================================================
  HEADER
  ==========================================================
  */

  header: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 18,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",

    letterSpacing: 1.3,

    color: "#6B7280",

    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "750",

    color: "#111827",

    letterSpacing: -0.6,
  },

  headerIconButton: {
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

  /*
  ==========================================================
  AVAILABLE BALANCE
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

  balanceTopRow: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  balanceInfo: {
    flex: 1,
  },

  balanceLabel: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 1.15,

    color: "#9CA3AF",

    marginBottom: 7,
  },

  balanceAmount: {
    fontSize: 33,

    fontWeight: "800",

    letterSpacing: -1.1,

    color: "#FFFFFF",
  },

  walletIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#1F2937",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 12,
  },

  balanceDivider: {
    height: 1,

    backgroundColor: "#374151",

    marginVertical: 19,
  },

  balanceBottomRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  balanceBottomInfo: {
    flex: 1,

    marginRight: 12,
  },

  balanceSmallLabel: {
    fontSize: 13,

    fontWeight: "700",

    color: "#FFFFFF",

    marginBottom: 4,
  },

  balanceSmallText: {
    fontSize: 11,

    lineHeight: 15,

    color: "#9CA3AF",
  },

  payoutButton: {
    minHeight: 43,

    paddingHorizontal: 15,

    borderRadius: 11,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  payoutButtonText: {
    fontSize: 12,

    fontWeight: "700",

    color: "#111827",

    marginRight: 6,
  },

  /*
  ==========================================================
  BALANCE SUMMARY
  ==========================================================
  */

  summaryRow: {
    flexDirection: "row",

    gap: 10,

    marginTop: 12,
  },

  summaryCard: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    padding: 16,

    borderWidth: 1,

    borderColor: "#EEF0F3",
  },

  summaryIconWrapper: {
    width: 38,
    height: 38,

    borderRadius: 11,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 11,
  },

  summaryLabel: {
    fontSize: 12,

    fontWeight: "600",

    color: "#6B7280",

    marginBottom: 5,
  },

  summaryAmount: {
    fontSize: 21,

    fontWeight: "750",

    color: "#111827",

    letterSpacing: -0.3,
  },

  summaryDescription: {
    fontSize: 10,

    lineHeight: 14,

    color: "#9CA3AF",

    marginTop: 4,
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  ==========================================================
  */

  todayCard: {
    marginTop: 12,

    padding: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  todayLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  todayIcon: {
    width: 46,
    height: 46,

    borderRadius: 13,

    backgroundColor: "#111827",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 13,
  },

  todayLabel: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 0.9,

    color: "#6B7280",

    marginBottom: 4,
  },

  todayAmount: {
    fontSize: 25,

    fontWeight: "800",

    color: "#111827",

    letterSpacing: -0.6,
  },

  todaySubtext: {
    fontSize: 11,

    color: "#9CA3AF",

    marginTop: 3,
  },

  todayArrow: {
    width: 36,
    height: 36,

    borderRadius: 11,

    backgroundColor: "#F9FAFB",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 10,
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

  viewAllText: {
    fontSize: 12,

    fontWeight: "700",

    color: "#2563EB",
  },

  /*
  ==========================================================
  QUICK ACTIONS
  ==========================================================
  */

  quickActions: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    overflow: "hidden",
  },

  quickAction: {
    minHeight: 79,

    paddingHorizontal: 15,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6",
  },

  quickActionIcon: {
    width: 41,
    height: 41,

    borderRadius: 12,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 13,
  },

  quickActionContent: {
    flex: 1,

    minWidth: 0,
  },

  quickActionTitle: {
    fontSize: 14,

    fontWeight: "650",

    color: "#111827",

    marginBottom: 4,
  },

  quickActionDescription: {
    fontSize: 11,

    color: "#9CA3AF",
  },

  /*
  ==========================================================
  RECENT ACTIVITY
  ==========================================================
  */

  activityCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    overflow: "hidden",
  },

  /*
  ==========================================================
  EMPTY ACTIVITY
  ==========================================================
  */

  emptyActivity: {
    minHeight: 185,

    paddingHorizontal: 25,
    paddingVertical: 28,

    justifyContent: "center",
    alignItems: "center",
  },

  emptyActivityIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 12,
  },

  emptyActivityTitle: {
    fontSize: 14,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 5,
  },

  emptyActivityText: {
    maxWidth: 240,

    fontSize: 11,

    lineHeight: 16,

    color: "#9CA3AF",

    textAlign: "center",
  },

  /*
  ==========================================================
  ACTIVITY ROW
  ==========================================================
  */

  activityRow: {
    minHeight: 88,

    paddingHorizontal: 15,

    paddingVertical: 13,

    flexDirection: "row",

    alignItems: "center",
  },

  activityRowBorder: {
    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6",
  },

  activityIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  creditIcon: {
    backgroundColor: "#ECFDF5",
  },

  debitIcon: {
    backgroundColor: "#FEF2F2",
  },

  activityDetails: {
    flex: 1,

    minWidth: 0,
  },

  activityTitle: {
    fontSize: 13,

    fontWeight: "650",

    color: "#111827",

    marginBottom: 3,
  },

  activityDescription: {
    fontSize: 10.5,

    color: "#9CA3AF",

    marginBottom: 6,
  },

  activityStatusRow: {
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

  activityStatus: {
    fontSize: 9.5,

    fontWeight: "700",

    letterSpacing: 0.3,
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

  activityAmount: {
    fontSize: 13,

    fontWeight: "750",

    marginLeft: 10,
  },

  creditAmount: {
    color: "#059669",
  },

  debitAmount: {
    color: "#DC2626",
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

    marginTop: 22,

    paddingHorizontal: 25,
  },
});

export default styles;
