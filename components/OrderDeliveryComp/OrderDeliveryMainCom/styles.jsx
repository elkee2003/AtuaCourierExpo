import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // light background
  },

  /* BACK BUTTON */
  backBtn: {
    position: "absolute",
    top: 40,
    left: 16,
    height: 42,
    width: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  backIcon: {
    fontSize: 22,
    color: "#1F2937", // dark gray instead of black
  },

  /* BOTTOM SHEET HANDLE */
  handle: {
    backgroundColor: "#D1D5DB", // soft gray instead of bluish tint
    width: 60,
    height: 5,
    borderRadius: 10,
  },
});
