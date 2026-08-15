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

    paddingTop: 12,

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

    fontSize: 11,

    color: "#6B7280",

    textAlign: "center",
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

    marginBottom: 19,
  },

  backButton: {
    width: 43,

    height: 43,

    borderRadius: 13,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#E5E7EB",
  },

  headerCenter: {
    flex: 1,

    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 23,

    fontWeight: "750",

    color: "#111827",

    letterSpacing: -0.4,
  },

  headerSubtitle: {
    fontSize: 10,

    color: "#9CA3AF",

    marginTop: 3,
  },

  headerSpacer: {
    width: 43,
  },

  /*
  ==========================================================
  SUMMARY CARD
  ==========================================================
  */

  summaryCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    paddingVertical: 28,

    paddingHorizontal: 20,

    alignItems: "center",
  },

  summaryIcon: {
    width: 57,

    height: 57,

    borderRadius: 18,

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 14,
  },

  summaryIconPaid: {
    backgroundColor: "#ECFDF5",
  },

  summaryIconProcessing: {
    backgroundColor: "#EFF6FF",
  },

  summaryIconPending: {
    backgroundColor: "#FFFBEB",
  },

  summaryIconFailed: {
    backgroundColor: "#FEF2F2",
  },

  summaryLabel: {
    fontSize: 10,

    fontWeight: "700",

    letterSpacing: 1.1,

    color: "#6B7280",

    marginBottom: 6,
  },

  summaryAmount: {
    fontSize: 34,

    fontWeight: "800",

    color: "#111827",

    letterSpacing: -1,

    marginBottom: 13,
  },

  /*
  ==========================================================
  STATUS BADGE
  ==========================================================
  */

  statusBadge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 20,

    marginBottom: 14,
  },

  statusBadgePaid: {
    backgroundColor: "#ECFDF5",
  },

  statusBadgeProcessing: {
    backgroundColor: "#EFF6FF",
  },

  statusBadgePending: {
    backgroundColor: "#FFFBEB",
  },

  statusBadgeFailed: {
    backgroundColor: "#FEF2F2",
  },

  statusBadgeText: {
    fontSize: 10,

    fontWeight: "700",

    marginLeft: 6,
  },

  summaryDate: {
    fontSize: 10,

    color: "#9CA3AF",
  },

  /*
  ==========================================================
  STATUS MESSAGE
  ==========================================================
  */

  statusMessage: {
    marginTop: 12,

    padding: 15,

    borderRadius: 16,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  statusMessagePaid: {
    backgroundColor: "#F0FDF4",
  },

  statusMessageProcessing: {
    backgroundColor: "#EFF6FF",
  },

  statusMessagePending: {
    backgroundColor: "#FFFBEB",
  },

  statusMessageFailed: {
    backgroundColor: "#FEF2F2",
  },

  statusMessageContent: {
    flex: 1,

    marginLeft: 9,
  },

  statusMessageTitle: {
    fontSize: 12,

    fontWeight: "750",

    color: "#111827",

    marginBottom: 4,
  },

  statusMessageText: {
    fontSize: 10,

    lineHeight: 15,

    color: "#64748B",
  },

  /*
  ==========================================================
  SECTION
  ==========================================================
  */

  sectionTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: "#111827",

    marginTop: 25,

    marginBottom: 11,

    letterSpacing: -0.1,
  },

  /*
  ==========================================================
  DETAILS CARD
  ==========================================================
  */

  detailsCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    overflow: "hidden",
  },

  detailRow: {
    minHeight: 58,

    paddingHorizontal: 15,

    paddingVertical: 8,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  detailRowBorder: {
    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6",
  },

  detailLabel: {
    fontSize: 10,

    color: "#6B7280",

    flex: 1,

    paddingRight: 12,
  },

  detailValue: {
    fontSize: 11,

    fontWeight: "650",

    color: "#111827",

    textAlign: "right",

    maxWidth: "63%",
  },

  detailValueMono: {
    fontSize: 10,

    letterSpacing: 0.2,
  },

  detailStatusPaid: {
    color: "#059669",

    fontWeight: "700",
  },

  detailStatusProcessing: {
    color: "#2563EB",

    fontWeight: "700",
  },

  detailStatusPending: {
    color: "#D97706",

    fontWeight: "700",
  },

  detailStatusFailed: {
    color: "#DC2626",

    fontWeight: "700",
  },

  /*
  ==========================================================
  BANK ACCOUNT
  ==========================================================
  */

  bankCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    padding: 15,

    flexDirection: "row",

    alignItems: "center",
  },

  bankIcon: {
    width: 47,

    height: 47,

    borderRadius: 14,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 12,
  },

  bankContent: {
    flex: 1,

    minWidth: 0,
  },

  bankName: {
    fontSize: 13,

    fontWeight: "750",

    color: "#111827",

    marginBottom: 3,
  },

  accountName: {
    fontSize: 10,

    color: "#6B7280",

    marginBottom: 4,
  },

  accountNumber: {
    fontSize: 10,

    fontWeight: "650",

    color: "#374151",

    letterSpacing: 0.7,
  },

  bankVerified: {
    marginLeft: 8,

    width: 30,

    height: 30,

    borderRadius: 10,

    backgroundColor: "#ECFDF5",

    justifyContent: "center",

    alignItems: "center",
  },

  /*
  ==========================================================
  FAILURE INFORMATION
  ==========================================================
  */

  failureCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#FECACA",

    padding: 15,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  failureIcon: {
    width: 42,

    height: 42,

    borderRadius: 12,

    backgroundColor: "#FEF2F2",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 11,
  },

  failureContent: {
    flex: 1,
  },

  failureTitle: {
    fontSize: 12,

    fontWeight: "750",

    color: "#991B1B",

    marginBottom: 5,
  },

  failureText: {
    fontSize: 10,

    lineHeight: 15,

    color: "#7F1D1D",
  },

  /*
  ==========================================================
  PAYOUT TIMELINE
  ==========================================================
  */

  timelineCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    padding: 16,
  },

  timelineItem: {
    flexDirection: "row",

    minHeight: 59,
  },

  timelineLeft: {
    width: 25,

    alignItems: "center",

    marginRight: 10,

    position: "relative",
  },

  timelineDot: {
    width: 18,

    height: 18,

    borderRadius: 9,

    backgroundColor: "#E5E7EB",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 2,
  },

  timelineDotActive: {
    backgroundColor: "#D1D5DB",
  },

  timelineDotCompleted: {
    backgroundColor: "#059669",
  },

  timelineDotProcessing: {
    backgroundColor: "#2563EB",
  },

  timelineDotFailed: {
    backgroundColor: "#DC2626",
  },

  timelineDotInner: {
    width: 6,

    height: 6,

    borderRadius: 3,

    backgroundColor: "#FFFFFF",
  },

  timelineLine: {
    position: "absolute",

    top: 18,

    width: 1,

    height: 50,

    backgroundColor: "#E5E7EB",

    zIndex: 1,
  },

  timelineLineCompleted: {
    backgroundColor: "#A7F3D0",
  },

  timelineContent: {
    flex: 1,

    paddingBottom: 17,
  },

  timelineTitle: {
    fontSize: 11,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 3,
  },

  timelineTitleInactive: {
    color: "#9CA3AF",
  },

  timelineDescription: {
    fontSize: 9,

    lineHeight: 14,

    color: "#9CA3AF",
  },

  /*
  ==========================================================
  LINKED WALLET TRANSACTION
  ==========================================================
  */

  transactionCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    padding: 14,

    flexDirection: "row",

    alignItems: "center",
  },

  transactionIcon: {
    width: 43,

    height: 43,

    borderRadius: 13,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 11,
  },

  transactionContent: {
    flex: 1,

    minWidth: 0,
  },

  transactionTitle: {
    fontSize: 12,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 3,
  },

  transactionId: {
    fontSize: 9,

    color: "#9CA3AF",

    letterSpacing: 0.3,
  },

  transactionReference: {
    fontSize: 9,

    color: "#CBD5E1",

    marginTop: 3,

    letterSpacing: 0.2,
  },

  /*
  ==========================================================
  PENDING TRANSACTION
  ==========================================================
  */

  transactionPendingCard: {
    backgroundColor: "#FFFBEB",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#FDE68A",

    padding: 14,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  transactionPendingIcon: {
    width: 40,

    height: 40,

    borderRadius: 12,

    backgroundColor: "#FEF3C7",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 11,
  },

  transactionPendingContent: {
    flex: 1,
  },

  transactionPendingTitle: {
    fontSize: 12,

    fontWeight: "700",

    color: "#92400E",

    marginBottom: 4,
  },

  transactionPendingText: {
    fontSize: 10,

    lineHeight: 15,

    color: "#92400E",
  },

  /*
  ==========================================================
  FOOTER
  ==========================================================
  */

  footerText: {
    textAlign: "center",

    fontSize: 9,

    lineHeight: 14,

    color: "#9CA3AF",

    marginTop: 20,

    paddingHorizontal: 24,
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
    width: 64,

    height: 64,

    borderRadius: 20,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 15,
  },

  notFoundTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 6,
  },

  notFoundText: {
    fontSize: 10,

    lineHeight: 15,

    color: "#9CA3AF",

    textAlign: "center",

    maxWidth: 260,

    marginBottom: 20,
  },

  backButtonLarge: {
    minWidth: 130,

    height: 42,

    paddingHorizontal: 18,

    borderRadius: 11,

    backgroundColor: "#111827",

    justifyContent: "center",

    alignItems: "center",
  },

  backButtonText: {
    fontSize: 11,

    fontWeight: "700",

    color: "#FFFFFF",
  },
});

export default styles;
