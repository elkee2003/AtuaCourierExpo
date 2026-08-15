import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  /*
  ==========================================================
  HOME CONTAINER
  ==========================================================
  */

  container: {
    flex: 1,

    backgroundColor: "#ffffff",
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  ==========================================================
  */

  todayEarningsContainer: {
    position: "absolute",

    top: 12,
    left: 16,
    right: 16,

    zIndex: 50,
  },

  todayEarningsCard: {
    minHeight: 58,

    paddingHorizontal: 13,
    paddingVertical: 9,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#ffffff",

    borderRadius: 14,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,
    shadowRadius: 6,

    elevation: 5,
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  LEFT SECTION
  ==========================================================
  */

  todayEarningsLeft: {
    flex: 1,

    minWidth: 0,

    justifyContent: "center",
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  LABEL
  ==========================================================
  */

  todayEarningsLabel: {
    marginBottom: 1,

    color: "#6b7280",

    fontSize: 8.5,
    fontWeight: "700",

    letterSpacing: 0.55,

    textTransform: "uppercase",
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  AMOUNT ROW
  ==========================================================
  */

  todayEarningsAmountRow: {
    flexDirection: "row",

    alignItems: "baseline",

    marginTop: 0,
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  CURRENCY
  ==========================================================
  */

  todayEarningsCurrency: {
    marginRight: 1,

    color: "#111827",

    fontSize: 15,
    fontWeight: "800",
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  AMOUNT
  ==========================================================
  */

  todayEarningsAmount: {
    color: "#111827",

    fontSize: 19,
    fontWeight: "800",

    letterSpacing: -0.3,
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  META
  ==========================================================
  */

  todayEarningsMeta: {
    marginTop: 0,

    color: "#9ca3af",

    fontSize: 8,
    fontWeight: "500",
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  RIGHT SECTION
  ==========================================================
  */

  todayEarningsRight: {
    marginLeft: 10,

    justifyContent: "center",
    alignItems: "center",
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  ARROW
  ==========================================================
  */

  todayEarningsArrow: {
    width: 29,
    height: 29,

    borderRadius: 15,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#f3f4f6",
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  LOADING ROW
  ==========================================================
  */

  todayEarningsLoadingRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 3,
  },

  /*
  ==========================================================
  TODAY'S EARNINGS
  LOADING TEXT
  ==========================================================
  */

  todayEarningsLoadingText: {
    marginLeft: 6,

    color: "#6b7280",

    fontSize: 9,
    fontWeight: "500",
  },

  /*
  ==========================================================
  EMPTY STATE
  ==========================================================
  */

  emptyStateText: {
    marginTop: 20,
    marginBottom: 20,

    paddingHorizontal: 20,

    color: "#9ca3af",

    fontSize: 14,

    lineHeight: 20,

    textAlign: "center",
  },

  /*
  ==========================================================
  HOME LOADING
  ==========================================================
  */

  loading: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
  },
});

export default styles;
