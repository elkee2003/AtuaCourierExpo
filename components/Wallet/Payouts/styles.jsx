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
    paddingBottom: 50,
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

    fontSize: 12,

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

    shadowOpacity: 0.13,

    shadowRadius: 14,

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

  walletIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#1F2937",

    justifyContent: "center",
    alignItems: "center",
  },

  /*
  ==========================================================
  BALANCE BOTTOM
  ==========================================================
  */

  balanceBottom: {
    marginTop: 20,

    paddingTop: 17,

    borderTopWidth: 1,

    borderTopColor: "#374151",

    flexDirection: "row",

    alignItems: "center",
  },

  balanceBottomItem: {
    flex: 1,
  },

  balanceBottomLabel: {
    fontSize: 10,

    color: "#9CA3AF",

    marginBottom: 4,
  },

  balanceBottomValue: {
    fontSize: 14,

    fontWeight: "700",

    color: "#FFFFFF",
  },

  balanceDivider: {
    width: 1,

    height: 31,

    backgroundColor: "#374151",

    marginHorizontal: 18,
  },

  /*
  ==========================================================
  REQUEST PAYOUT
  ==========================================================
  */

  requestButton: {
    marginTop: 14,

    minHeight: 72,

    borderRadius: 17,

    backgroundColor: "#2563EB",

    paddingHorizontal: 16,

    flexDirection: "row",

    alignItems: "center",

    shadowColor: "#2563EB",

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.15,

    shadowRadius: 10,

    elevation: 4,
  },

  requestIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: "rgba(255,255,255,0.15)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  requestContent: {
    flex: 1,
  },

  requestTitle: {
    fontSize: 14,

    fontWeight: "750",

    color: "#FFFFFF",

    marginBottom: 4,
  },

  requestDescription: {
    fontSize: 10,

    lineHeight: 14,

    color: "#DBEAFE",
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

  sectionSubtitle: {
    fontSize: 10,

    color: "#9CA3AF",

    marginTop: 3,
  },

  payoutCount: {
    minWidth: 28,

    height: 28,

    paddingHorizontal: 8,

    borderRadius: 9,

    backgroundColor: "#E5E7EB",

    textAlign: "center",

    textAlignVertical: "center",

    fontSize: 11,

    fontWeight: "700",

    color: "#6B7280",
  },

  /*
  ==========================================================
  SUMMARY CARD
  ==========================================================
  */

  summaryCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    paddingVertical: 16,

    flexDirection: "row",

    alignItems: "center",
  },

  summaryItem: {
    flex: 1,

    alignItems: "center",

    paddingHorizontal: 4,
  },

  summaryIcon: {
    width: 36,
    height: 36,

    borderRadius: 11,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 8,
  },

  summaryIconGreen: {
    backgroundColor: "#ECFDF5",
  },

  summaryIconBlue: {
    backgroundColor: "#EFF6FF",
  },

  summaryIconPurple: {
    backgroundColor: "#F5F3FF",
  },

  summaryLabel: {
    fontSize: 9,

    color: "#9CA3AF",

    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 12,

    fontWeight: "750",

    color: "#111827",

    maxWidth: "100%",
  },

  summaryDivider: {
    width: 1,

    height: 54,

    backgroundColor: "#F1F5F9",
  },

  /*
  ==========================================================
  PENDING PAYOUT SUMMARY
  ==========================================================
  */

  pendingSummaryCard: {
    marginTop: 14,

    padding: 14,

    borderRadius: 15,

    backgroundColor: "#FFFBEB",

    borderWidth: 1,

    borderColor: "#FDE68A",

    flexDirection: "row",

    alignItems: "flex-start",
  },

  pendingSummaryIcon: {
    width: 39,
    height: 39,

    borderRadius: 11,

    backgroundColor: "#FEF3C7",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  pendingSummaryContent: {
    flex: 1,
  },

  pendingSummaryTitle: {
    fontSize: 12,

    fontWeight: "700",

    color: "#92400E",

    marginBottom: 4,
  },

  pendingSummaryText: {
    fontSize: 10,

    lineHeight: 15,

    color: "#A16207",
  },

  /*
  ==========================================================
  FILTERS
  ==========================================================
  */

  filterScroll: {
    paddingBottom: 10,
  },

  filterButton: {
    minHeight: 38,

    paddingHorizontal: 16,

    borderRadius: 10,

    backgroundColor: "#EDEFF2",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 7,
  },

  filterButtonActive: {
    backgroundColor: "#111827",
  },

  filterText: {
    fontSize: 11,

    fontWeight: "600",

    color: "#6B7280",
  },

  filterTextActive: {
    color: "#FFFFFF",

    fontWeight: "700",
  },

  /*
  ==========================================================
  PAYOUT LIST
  ==========================================================
  */

  payoutList: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    overflow: "hidden",
  },

  payoutRow: {
    minHeight: 94,

    paddingHorizontal: 14,

    paddingVertical: 13,

    flexDirection: "row",

    alignItems: "center",
  },

  payoutRowBorder: {
    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6",
  },

  /*
  ==========================================================
  PAYOUT ICON
  ==========================================================
  */

  payoutIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  payoutIconPaid: {
    backgroundColor: "#ECFDF5",
  },

  payoutIconProcessing: {
    backgroundColor: "#EFF6FF",
  },

  payoutIconPending: {
    backgroundColor: "#FFFBEB",
  },

  payoutIconFailed: {
    backgroundColor: "#FEF2F2",
  },

  /*
  ==========================================================
  PAYOUT DETAILS
  ==========================================================
  */

  payoutDetails: {
    flex: 1,

    minWidth: 0,
  },

  payoutTitle: {
    fontSize: 13,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 4,
  },

  payoutBank: {
    fontSize: 10,

    color: "#6B7280",

    marginBottom: 7,
  },

  payoutMeta: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",
  },

  payoutDate: {
    fontSize: 9,

    color: "#9CA3AF",
  },

  metaDot: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: "#D1D5DB",

    marginHorizontal: 6,
  },

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

  statusDotPaid: {
    backgroundColor: "#059669",
  },

  statusDotProcessing: {
    backgroundColor: "#2563EB",
  },

  statusDotPending: {
    backgroundColor: "#D97706",
  },

  statusDotFailed: {
    backgroundColor: "#DC2626",
  },

  payoutStatus: {
    fontSize: 9,

    fontWeight: "700",
  },

  payoutStatusPaid: {
    color: "#059669",
  },

  payoutStatusProcessing: {
    color: "#2563EB",
  },

  payoutStatusPending: {
    color: "#D97706",
  },

  payoutStatusFailed: {
    color: "#DC2626",
  },

  /*
  ==========================================================
  PAYOUT REFERENCE
  ==========================================================
  */

  payoutReference: {
    fontSize: 8.5,

    color: "#9CA3AF",

    marginTop: 6,

    maxWidth: "95%",
  },

  /*
  ==========================================================
  PAYOUT AMOUNT
  ==========================================================
  */

  payoutRight: {
    alignItems: "flex-end",

    justifyContent: "center",

    marginLeft: 9,
  },

  payoutAmount: {
    fontSize: 13,

    fontWeight: "750",

    color: "#111827",

    marginBottom: 6,
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

    marginTop: 2,
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
  INFORMATION CARD
  ==========================================================
  */

  infoCard: {
    marginTop: 21,

    padding: 15,

    borderRadius: 15,

    backgroundColor: "#F1F5F9",

    flexDirection: "row",

    alignItems: "flex-start",
  },

  infoIcon: {
    width: 35,
    height: 35,

    borderRadius: 10,

    backgroundColor: "#E2E8F0",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,

    marginTop: 1,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 11,

    fontWeight: "700",

    color: "#475569",

    marginBottom: 5,
  },

  infoText: {
    fontSize: 10,

    lineHeight: 15,

    color: "#64748B",
  },

  /*
  ==========================================================
  NOT FOUND
  ==========================================================
  */

  notFoundContainer: {
    flex: 1,

    backgroundColor: "#F8FAFC",

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 30,
  },

  notFoundIcon: {
    width: 66,
    height: 66,

    borderRadius: 20,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  notFoundTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 7,

    textAlign: "center",
  },

  notFoundText: {
    fontSize: 11,

    lineHeight: 16,

    color: "#9CA3AF",

    textAlign: "center",

    maxWidth: 270,

    marginBottom: 21,
  },

  /*
  ==========================================================
  LARGE BACK BUTTON
  ==========================================================
  */

  backButtonLarge: {
    minWidth: 132,

    height: 43,

    paddingHorizontal: 19,

    borderRadius: 11,

    backgroundColor: "#111827",

    justifyContent: "center",

    alignItems: "center",
  },

  backButtonText: {
    fontSize: 12,

    fontWeight: "700",

    color: "#FFFFFF",
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

    marginTop: 20,

    paddingHorizontal: 25,
  },
});

export default styles;
