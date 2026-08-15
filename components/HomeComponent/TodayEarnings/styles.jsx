import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  /*
  ==========================================================
  CONTAINER
  ==========================================================
  */

  container: {
    position: "absolute",

    top: 45,
    left: 60,
    right: 60,

    zIndex: 2,
  },

  /*
  ==========================================================
  CARD
  ==========================================================
  */

  card: {
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
  LEFT SECTION
  ==========================================================
  */

  leftSection: {
    flex: 1,

    minWidth: 0,

    justifyContent: "center",
  },

  /*
  ==========================================================
  LABEL
  ==========================================================
  */

  label: {
    marginBottom: 1,

    color: "#6b7280",

    fontSize: 8.5,
    fontWeight: "700",

    letterSpacing: 0.55,

    textTransform: "uppercase",
  },

  /*
  ==========================================================
  AMOUNT ROW
  ==========================================================
  */

  amountRow: {
    flexDirection: "row",

    alignItems: "baseline",

    marginTop: 0,
  },

  /*
  ==========================================================
  CURRENCY
  ==========================================================
  */

  currency: {
    marginRight: 1,

    color: "#111827",

    fontSize: 15,
    fontWeight: "800",
  },

  /*
  ==========================================================
  AMOUNT
  ==========================================================
  */

  amount: {
    color: "#111827",

    fontSize: 19,
    fontWeight: "800",

    letterSpacing: -0.3,
  },

  /*
  ==========================================================
  META
  ==========================================================
  */

  meta: {
    marginTop: 0,

    color: "#9ca3af",

    fontSize: 8,
    fontWeight: "500",
  },

  /*
  ==========================================================
  RIGHT SECTION
  ==========================================================
  */

  rightSection: {
    marginLeft: 10,

    justifyContent: "center",
    alignItems: "center",
  },

  /*
  ==========================================================
  ARROW
  ==========================================================
  */

  arrowCircle: {
    width: 29,
    height: 29,

    borderRadius: 15,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#f3f4f6",
  },

  /*
  ==========================================================
  LOADING ROW
  ==========================================================
  */

  loadingRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 3,
  },

  /*
  ==========================================================
  LOADING TEXT
  ==========================================================
  */

  loadingText: {
    marginLeft: 6,

    color: "#6b7280",

    fontSize: 9,
    fontWeight: "500",
  },
});

export default styles;
