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
  MAIN AMOUNT CARD
  ==========================================================
  */

  amountCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 21,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    paddingVertical: 30,

    paddingHorizontal: 20,

    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.04,

    shadowRadius: 10,

    elevation: 2,
  },

  amountIcon: {
    width: 58,
    height: 58,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15,
  },

  amountIconCredit: {
    backgroundColor: "#ECFDF5",
  },

  amountIconDebit: {
    backgroundColor: "#FEF2F2",
  },

  amountLabel: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 1.05,

    color: "#6B7280",

    marginBottom: 6,

    textAlign: "center",
  },

  amount: {
    fontSize: 35,

    fontWeight: "800",

    letterSpacing: -1.1,

    marginBottom: 14,
  },

  amountCredit: {
    color: "#059669",
  },

  amountDebit: {
    color: "#DC2626",
  },

  /*
  ==========================================================
  STATUS BADGE
  ==========================================================
  */

  statusBadge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 13,

    paddingVertical: 7,

    borderRadius: 20,

    marginBottom: 15,
  },

  statusBadgeCompleted: {
    backgroundColor: "#ECFDF5",
  },

  statusBadgePending: {
    backgroundColor: "#FFFBEB",
  },

  statusBadgeFailed: {
    backgroundColor: "#FEF2F2",
  },

  statusBadgeDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 6,
  },

  statusDotCompleted: {
    backgroundColor: "#059669",
  },

  statusDotPending: {
    backgroundColor: "#D97706",
  },

  statusDotFailed: {
    backgroundColor: "#DC2626",
  },

  statusBadgeText: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 0.1,
  },

  statusTextCompleted: {
    color: "#059669",
  },

  statusTextPending: {
    color: "#D97706",
  },

  statusTextFailed: {
    color: "#DC2626",
  },

  amountDate: {
    fontSize: 11,

    color: "#6B7280",

    textAlign: "center",
  },

  amountTime: {
    fontSize: 10,

    color: "#9CA3AF",

    marginTop: 3,

    textAlign: "center",
  },

  /*
  ==========================================================
  STATUS MESSAGE
  ==========================================================
  */

  statusMessage: {
    marginTop: 12,

    padding: 15,

    borderRadius: 15,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  statusMessageCompleted: {
    backgroundColor: "#F0FDF4",
  },

  statusMessagePending: {
    backgroundColor: "#FFFBEB",
  },

  statusMessageFailed: {
    backgroundColor: "#FEF2F2",
  },

  statusMessageText: {
    flex: 1,

    fontSize: 11,

    lineHeight: 17,

    color: "#4B5563",

    marginLeft: 9,
  },

  /*
  ==========================================================
  SECTION
  ==========================================================
  */

  sectionTitle: {
    fontSize: 17,

    fontWeight: "700",

    color: "#111827",

    marginTop: 27,

    marginBottom: 11,

    letterSpacing: -0.2,
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
    minHeight: 60,

    paddingHorizontal: 15,

    paddingVertical: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  detailRowBorder: {
    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6",
  },

  detailLabel: {
    fontSize: 11,

    color: "#6B7280",

    flex: 1,

    marginRight: 12,
  },

  detailValue: {
    fontSize: 12,

    fontWeight: "650",

    color: "#111827",

    textAlign: "right",

    maxWidth: "62%",
  },

  detailValueMono: {
    fontSize: 10.5,

    letterSpacing: 0.2,
  },

  detailStatusCompleted: {
    color: "#059669",
  },

  detailStatusPending: {
    color: "#D97706",
  },

  detailStatusFailed: {
    color: "#DC2626",
  },

  /*
  ==========================================================
  CONTEXT CARD
  ==========================================================
  */

  contextCard: {
    marginTop: 18,

    padding: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    flexDirection: "row",

    alignItems: "flex-start",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.025,

    shadowRadius: 7,

    elevation: 1,
  },

  contextIcon: {
    width: 45,
    height: 45,

    borderRadius: 13,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  contextIconPayout: {
    backgroundColor: "#F3F4F6",
  },

  contextContent: {
    flex: 1,

    minWidth: 0,
  },

  contextTitle: {
    fontSize: 14,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 5,
  },

  contextDescription: {
    fontSize: 11,

    lineHeight: 17,

    color: "#6B7280",
  },

  /*
  ==========================================================
  CONTEXT BUTTON
  ==========================================================
  */

  contextButton: {
    marginTop: 13,

    flexDirection: "row",

    alignItems: "center",

    alignSelf: "flex-start",

    paddingVertical: 3,
  },

  contextButtonText: {
    fontSize: 11,

    fontWeight: "700",

    color: "#111827",

    marginRight: 6,
  },

  contextReference: {
    fontSize: 10,

    lineHeight: 15,

    color: "#9CA3AF",

    marginTop: 11,
  },

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  loadingTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: "#111827",

    marginTop: 15,

    marginBottom: 5,
  },

  loadingText: {
    fontSize: 11,

    lineHeight: 16,

    color: "#9CA3AF",

    textAlign: "center",

    maxWidth: 260,
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
  BACK BUTTON - ERROR STATE
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

    marginTop: 21,

    paddingHorizontal: 25,
  },
});

export default styles;
