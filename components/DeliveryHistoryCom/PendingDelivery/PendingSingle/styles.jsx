import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  routeContainer: {
    marginTop: 12,
  },

  label: {
    fontSize: 11,
    color: "#9ca3af",
  },

  address: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  meta: {
    marginTop: 10,
    fontSize: 13,
    color: "#555",
  },

  /* 🔵 PROGRESS */
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 6,
  },

  progressItem: {
    alignItems: "center",
    flex: 1,
  },

  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },

  progressText: {
    fontSize: 10,
    color: "#555",
  },

  /* 📞 RECIPIENT */
  recipientRow: {
    marginTop: 10,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  callIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  recipientText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },

  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerHint: {
    fontSize: 12,
    color: "#888",
  },

  time: {
    fontSize: 11,
    color: "#aaa",
  },
});
