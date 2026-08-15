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

    marginBottom: 18,
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
  PERIOD SELECTOR
  ==========================================================
  */

  periodSelector: {
    backgroundColor: "#EDEFF2",

    borderRadius: 13,

    padding: 4,

    flexDirection: "row",

    marginBottom: 12,
  },

  periodButton: {
    flex: 1,

    height: 39,

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",
  },

  periodButtonActive: {
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

  periodText: {
    fontSize: 11,

    fontWeight: "600",

    color: "#6B7280",
  },

  periodTextActive: {
    color: "#111827",

    fontWeight: "700",
  },

  /*
  ==========================================================
  MAIN EARNINGS CARD
  ==========================================================
  */

  mainEarningsCard: {
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

  mainEarningsTop: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },

  mainEarningsLabel: {
    fontSize: 10,

    fontWeight: "700",

    letterSpacing: 1.1,

    color: "#9CA3AF",

    marginBottom: 7,
  },

  mainEarningsAmount: {
    fontSize: 32,

    fontWeight: "800",

    color: "#FFFFFF",

    letterSpacing: -1,
  },

  mainEarningsSubtext: {
    fontSize: 10,

    lineHeight: 15,

    color: "#9CA3AF",

    marginTop: 10,

    maxWidth: 270,
  },

  trendBadge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 9,

    paddingVertical: 6,

    borderRadius: 9,

    backgroundColor: "#ECFDF5",
  },

  trendText: {
    fontSize: 9,

    fontWeight: "700",

    color: "#059669",

    marginLeft: 4,
  },

  /*
  ==========================================================
  PERFORMANCE STATS
  ==========================================================
  */

  statsRow: {
    flexDirection: "row",

    gap: 9,

    marginTop: 12,
  },

  statCard: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    padding: 13,

    borderWidth: 1,

    borderColor: "#EEF0F3",
  },

  statIcon: {
    width: 35,

    height: 35,

    borderRadius: 11,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 10,
  },

  statLabel: {
    fontSize: 10,

    fontWeight: "600",

    color: "#6B7280",

    marginBottom: 4,
  },

  statValue: {
    fontSize: 21,

    fontWeight: "750",

    color: "#111827",
  },

  statValueSmall: {
    fontSize: 15,

    fontWeight: "750",

    color: "#111827",
  },

  statDescription: {
    fontSize: 9,

    color: "#9CA3AF",

    marginTop: 3,
  },

  /*
  ==========================================================
  SECTION HEADER
  ==========================================================
  */

  sectionHeader: {
    marginTop: 26,

    marginBottom: 11,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: "#111827",
  },

  sectionSubtitle: {
    fontSize: 10,

    color: "#9CA3AF",

    marginTop: 3,
  },

  /*
  ==========================================================
  CHART LEGEND
  ==========================================================
  */

  chartLegend: {
    flexDirection: "row",

    alignItems: "center",
  },

  legendDot: {
    width: 7,

    height: 7,

    borderRadius: 4,

    backgroundColor: "#111827",

    marginRight: 5,
  },

  legendText: {
    fontSize: 9,

    color: "#6B7280",
  },

  /*
  ==========================================================
  CHART CARD
  ==========================================================
  */

  chartCard: {
    height: 245,

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    paddingHorizontal: 14,

    paddingTop: 15,

    paddingBottom: 12,
  },

  chartTopValue: {
    height: 20,

    alignItems: "flex-end",
  },

  chartTopValueText: {
    fontSize: 9,

    color: "#9CA3AF",
  },

  chartArea: {
    flex: 1,

    position: "relative",

    marginTop: 5,
  },

  /*
  ==========================================================
  CHART GRID
  ==========================================================
  */

  chartGridLineOne: {
    position: "absolute",

    left: 0,

    right: 0,

    top: 20,

    height: 1,

    backgroundColor: "#F1F3F5",
  },

  chartGridLineTwo: {
    position: "absolute",

    left: 0,

    right: 0,

    top: 75,

    height: 1,

    backgroundColor: "#F1F3F5",
  },

  chartGridLineThree: {
    position: "absolute",

    left: 0,

    right: 0,

    top: 130,

    height: 1,

    backgroundColor: "#F1F3F5",
  },

  /*
  ==========================================================
  CHART BARS
  ==========================================================
  */

  barsContainer: {
    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    top: 0,

    flexDirection: "row",

    justifyContent: "space-around",

    alignItems: "flex-end",
  },

  barColumn: {
    flex: 1,

    height: "100%",

    alignItems: "center",

    justifyContent: "flex-end",
  },

  barValueContainer: {
    height: 24,

    justifyContent: "center",

    alignItems: "center",
  },

  barValue: {
    fontSize: 7,

    fontWeight: "600",

    color: "#6B7280",
  },

  barTrack: {
    height: 150,

    justifyContent: "flex-end",

    alignItems: "center",
  },

  bar: {
    width: 24,

    borderTopLeftRadius: 7,

    borderTopRightRadius: 7,

    backgroundColor: "#D1D5DB",
  },

  barToday: {
    backgroundColor: "#111827",
  },

  barEmpty: {
    backgroundColor: "#E5E7EB",
  },

  barDay: {
    fontSize: 10,

    fontWeight: "600",

    color: "#9CA3AF",

    marginTop: 8,
  },

  barDayToday: {
    color: "#111827",

    fontWeight: "800",
  },

  /*
  ==========================================================
  EARNINGS BREAKDOWN
  ==========================================================
  */

  breakdownCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    overflow: "hidden",
  },

  breakdownRow: {
    minHeight: 74,

    paddingHorizontal: 15,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  breakdownBorder: {
    borderTopWidth: 1,

    borderTopColor: "#F3F4F6",
  },

  breakdownLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,

    minWidth: 0,
  },

  breakdownIcon: {
    width: 38,

    height: 38,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 11,
  },

  totalIcon: {
    backgroundColor: "#F3F4F6",
  },

  releasedIcon: {
    backgroundColor: "#ECFDF5",
  },

  pendingIcon: {
    backgroundColor: "#FFFBEB",
  },

  breakdownTitle: {
    fontSize: 12,

    fontWeight: "650",

    color: "#111827",

    marginBottom: 3,
  },

  breakdownDescription: {
    fontSize: 9,

    color: "#9CA3AF",
  },

  breakdownAmount: {
    fontSize: 12,

    fontWeight: "750",

    color: "#111827",

    marginLeft: 10,

    textAlign: "right",
  },

  releasedAmount: {
    color: "#059669",
  },

  pendingAmount: {
    color: "#D97706",
  },

  /*
  ==========================================================
  RECENT EARNINGS
  ==========================================================
  */

  earningsList: {
    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    borderWidth: 1,

    borderColor: "#EEF0F3",

    overflow: "hidden",
  },

  earningRow: {
    minHeight: 91,

    paddingHorizontal: 15,

    paddingVertical: 13,

    flexDirection: "row",

    alignItems: "center",
  },

  earningRowBorder: {
    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6",
  },

  earningIcon: {
    width: 40,

    height: 40,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 12,
  },

  earningIconCompleted: {
    backgroundColor: "#ECFDF5",
  },

  earningIconPending: {
    backgroundColor: "#FFFBEB",
  },

  earningDetails: {
    flex: 1,

    minWidth: 0,
  },

  earningTitle: {
    fontSize: 12,

    fontWeight: "650",

    color: "#111827",

    marginBottom: 3,
  },

  earningOrder: {
    fontSize: 10,

    color: "#6B7280",

    marginBottom: 6,
  },

  earningMeta: {
    flexDirection: "row",

    alignItems: "center",

    minWidth: 0,
  },

  earningDate: {
    fontSize: 8,

    color: "#9CA3AF",
  },

  metaDivider: {
    width: 3,

    height: 3,

    borderRadius: 2,

    backgroundColor: "#D1D5DB",

    marginHorizontal: 6,
  },

  statusDot: {
    width: 5,

    height: 5,

    borderRadius: 3,

    marginLeft: 7,

    marginRight: 4,
  },

  pendingDot: {
    backgroundColor: "#D97706",
  },

  completedDot: {
    backgroundColor: "#059669",
  },

  earningStatus: {
    fontSize: 8,

    fontWeight: "700",
  },

  pendingStatus: {
    color: "#D97706",
  },

  completedStatus: {
    color: "#059669",
  },

  earningRight: {
    flexDirection: "row",

    alignItems: "center",

    marginLeft: 8,
  },

  earningAmount: {
    fontSize: 12,

    fontWeight: "750",

    color: "#059669",

    marginRight: 6,
  },

  /*
  ==========================================================
  EMPTY EARNINGS
  ==========================================================
  */

  emptyEarnings: {
    paddingHorizontal: 25,

    paddingVertical: 35,

    alignItems: "center",

    justifyContent: "center",
  },

  emptyIcon: {
    width: 58,

    height: 58,

    borderRadius: 18,

    backgroundColor: "#F3F4F6",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 13,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 5,
  },

  emptyDescription: {
    fontSize: 10,

    lineHeight: 15,

    color: "#9CA3AF",

    textAlign: "center",

    maxWidth: 260,
  },

  /*
  ==========================================================
  FOOTER
  ==========================================================
  */

  footer: {
    marginTop: 20,

    paddingHorizontal: 20,

    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "center",
  },

  footerText: {
    flex: 1,

    marginLeft: 7,

    fontSize: 9,

    lineHeight: 14,

    color: "#9CA3AF",
  },

  /*
  ==========================================================
  NOT FOUND / NO WALLET
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
