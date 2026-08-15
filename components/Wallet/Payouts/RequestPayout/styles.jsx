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

  keyboardContainer: {
    flex: 1,
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

    fontSize: 12,

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

    marginBottom: 19,
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
    fontSize: 23,

    fontWeight: "750",

    color: "#111827",

    letterSpacing: -0.4,
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
  AVAILABLE BALANCE
  ==========================================================
  */

  balanceCard: {
    backgroundColor: "#111827",

    borderRadius: 22,

    paddingHorizontal: 20,

    paddingVertical: 22,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.12,

    shadowRadius: 13,

    elevation: 4,
  },

  balanceLabel: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 1.1,

    color: "#9CA3AF",

    marginBottom: 7,
  },

  balanceAmount: {
    fontSize: 31,

    fontWeight: "800",

    color: "#FFFFFF",

    letterSpacing: -0.9,
  },

  balanceIcon: {
    width: 50,
    height: 50,

    borderRadius: 15,

    backgroundColor: "#1F2937",

    justifyContent: "center",

    alignItems: "center",
  },

  /*
  ==========================================================
  SECTION TITLES
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
  AMOUNT CARD
  ==========================================================
  */

  amountCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 19,

    borderWidth: 1,

    borderColor: "#E5E7EB",

    paddingHorizontal: 18,

    paddingVertical: 19,
  },

  amountCardError: {
    borderColor: "#FCA5A5",

    backgroundColor: "#FFFBFB",
  },

  amountLabel: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 1,

    color: "#6B7280",

    marginBottom: 8,
  },

  amountInputRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  currencySymbol: {
    fontSize: 30,

    fontWeight: "700",

    color: "#111827",

    marginRight: 6,

    lineHeight: 38,
  },

  amountInput: {
    flex: 1,

    height: 57,

    padding: 0,

    fontSize: 32,

    fontWeight: "800",

    color: "#111827",

    letterSpacing: -0.5,
  },

  amountHint: {
    fontSize: 11,

    lineHeight: 16,

    color: "#64748B",

    marginTop: 8,
  },

  amountHintStrong: {
    fontWeight: "700",

    color: "#111827",
  },

  /*
  ==========================================================
  VALIDATION
  ==========================================================
  */

  validationRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 9,

    paddingTop: 8,

    borderTopWidth: 1,

    borderTopColor: "#FEE2E2",
  },

  validationText: {
    flex: 1,

    fontSize: 11,

    lineHeight: 15,

    color: "#DC2626",

    marginLeft: 6,
  },

  /*
  ==========================================================
  QUICK AMOUNTS
  ==========================================================
  */

  quickAmountRow: {
    flexDirection: "row",

    marginTop: 10,

    gap: 8,
  },

  quickAmountButton: {
    flex: 1,

    minHeight: 41,

    paddingHorizontal: 8,

    borderRadius: 11,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E7EB",

    justifyContent: "center",

    alignItems: "center",
  },

  quickAmountButtonActive: {
    backgroundColor: "#111827",

    borderColor: "#111827",
  },

  quickAmountButtonDisabled: {
    opacity: 0.4,
  },

  quickAmountText: {
    fontSize: 11,

    fontWeight: "650",

    color: "#475569",
  },

  quickAmountTextActive: {
    color: "#FFFFFF",

    fontWeight: "700",
  },

  /*
  ==========================================================
  BANK / DESTINATION ACCOUNT
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
    width: 48,
    height: 48,

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

  bankNameRow: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",
  },

  bankName: {
    fontSize: 14,

    fontWeight: "700",

    color: "#111827",

    maxWidth: "70%",
  },

  verifiedBadge: {
    flexDirection: "row",

    alignItems: "center",

    marginLeft: 8,

    paddingHorizontal: 7,

    paddingVertical: 3,

    borderRadius: 8,

    backgroundColor: "#ECFDF5",
  },

  verifiedText: {
    fontSize: 8,

    fontWeight: "700",

    color: "#059669",

    marginLeft: 3,
  },

  accountName: {
    fontSize: 11,

    color: "#64748B",

    marginTop: 5,
  },

  accountNumber: {
    fontSize: 11,

    fontWeight: "650",

    color: "#111827",

    marginTop: 3,

    letterSpacing: 0.4,
  },

  /*
  ==========================================================
  INFORMATION CARD
  ==========================================================
  */

  infoCard: {
    marginTop: 18,

    padding: 15,

    backgroundColor: "#F1F5F9",

    borderRadius: 17,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  infoIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#E2E8F0",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,

    fontWeight: "700",

    color: "#334155",

    marginBottom: 5,
  },

  infoText: {
    fontSize: 10,

    lineHeight: 15,

    color: "#64748B",

    marginBottom: 5,
  },

  /*
  ==========================================================
  PAYOUT SUMMARY
  ==========================================================
  */

  summaryCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    paddingHorizontal: 15,

    paddingVertical: 5,
  },

  summaryRow: {
    minHeight: 50,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  summaryRowLabel: {
    flex: 1,

    fontSize: 11,

    color: "#64748B",
  },

  summaryRowLabelStrong: {
    fontWeight: "700",

    color: "#111827",
  },

  summaryRowValue: {
    fontSize: 12,

    fontWeight: "650",

    color: "#111827",

    textAlign: "right",

    marginLeft: 15,
  },

  summaryRowValueStrong: {
    fontSize: 14,

    fontWeight: "800",

    color: "#111827",
  },

  summaryDivider: {
    height: 1,

    backgroundColor: "#F1F5F9",
  },

  /*
  ==========================================================
  REQUEST BUTTON
  ==========================================================
  */

  requestButton: {
    marginTop: 23,

    minHeight: 55,

    borderRadius: 15,

    backgroundColor: "#111827",

    paddingHorizontal: 17,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.1,

    shadowRadius: 7,

    elevation: 3,
  },

  requestButtonDisabled: {
    backgroundColor: "#E2E8F0",

    shadowOpacity: 0,

    elevation: 0,
  },

  requestButtonText: {
    fontSize: 14,

    fontWeight: "750",

    color: "#FFFFFF",

    marginHorizontal: 9,
  },

  requestButtonTextDisabled: {
    color: "#94A3B8",
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

    color: "#94A3B8",

    marginTop: 19,

    paddingHorizontal: 22,
  },

  /*
  ==========================================================
  CONFIRMATION OVERLAY
  ==========================================================
  */

  confirmationOverlay: {
    ...StyleSheet.absoluteFillObject,

    justifyContent: "flex-end",

    zIndex: 100,
  },

  confirmationBackdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(15, 23, 42, 0.58)",
  },

  /*
  ==========================================================
  CONFIRMATION CARD
  ==========================================================
  */

  confirmationCard: {
    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    paddingHorizontal: 20,

    paddingTop: 10,

    paddingBottom: 27,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: -5,
    },

    shadowOpacity: 0.12,

    shadowRadius: 14,

    elevation: 10,
  },

  confirmationHandle: {
    width: 42,

    height: 4,

    borderRadius: 3,

    backgroundColor: "#CBD5E1",

    alignSelf: "center",

    marginBottom: 20,
  },

  confirmationIcon: {
    width: 58,
    height: 58,

    borderRadius: 18,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",

    alignItems: "center",

    alignSelf: "center",

    marginBottom: 13,
  },

  confirmationTitle: {
    textAlign: "center",

    fontSize: 22,

    fontWeight: "800",

    color: "#111827",

    letterSpacing: -0.4,
  },

  confirmationDescription: {
    textAlign: "center",

    fontSize: 11,

    lineHeight: 16,

    color: "#64748B",

    marginTop: 7,

    paddingHorizontal: 15,
  },

  confirmationAmount: {
    textAlign: "center",

    fontSize: 32,

    fontWeight: "800",

    color: "#111827",

    letterSpacing: -0.8,

    marginTop: 16,

    marginBottom: 18,
  },

  /*
  ==========================================================
  CONFIRMATION BANK
  ==========================================================
  */

  confirmationBank: {
    backgroundColor: "#F8FAFC",

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    padding: 14,

    flexDirection: "row",

    alignItems: "center",
  },

  confirmationBankContent: {
    marginLeft: 10,

    flex: 1,
  },

  confirmationBankName: {
    fontSize: 12,

    fontWeight: "700",

    color: "#111827",
  },

  confirmationBankAccount: {
    fontSize: 10,

    color: "#64748B",

    marginTop: 3,
  },

  /*
  ==========================================================
  REMAINING BALANCE
  ==========================================================
  */

  confirmationRemaining: {
    marginTop: 14,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 2,
  },

  confirmationRemainingLabel: {
    fontSize: 10,

    color: "#64748B",
  },

  confirmationRemainingValue: {
    fontSize: 12,

    fontWeight: "700",

    color: "#111827",
  },

  /*
  ==========================================================
  CONFIRM BUTTON
  ==========================================================
  */

  confirmButton: {
    minHeight: 53,

    marginTop: 19,

    borderRadius: 14,

    backgroundColor: "#111827",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 18,
  },

  confirmButtonText: {
    fontSize: 13,

    fontWeight: "750",

    color: "#FFFFFF",

    marginRight: 8,
  },

  /*
  ==========================================================
  CANCEL BUTTON
  ==========================================================
  */

  cancelButton: {
    minHeight: 46,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 3,
  },

  cancelButtonText: {
    fontSize: 12,

    fontWeight: "650",

    color: "#64748B",
  },
});

export default styles;
