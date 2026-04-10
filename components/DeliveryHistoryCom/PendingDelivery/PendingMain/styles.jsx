import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  date: {
    fontSize: 12,
    color: "#6B7280",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  statusBlue: { backgroundColor: "#2563EB" },
  statusPurple: { backgroundColor: "#7C3AED" },
  statusOrange: { backgroundColor: "#F59E0B" },
  statusGray: { backgroundColor: "#6B7280" },

  address: {
    fontSize: 14,
    color: "#111827",
    marginTop: 6,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  vehicle: {
    fontSize: 13,
    color: "#6B7280",
  },

  expandHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
  },

  expanded: {
    marginTop: 10,
  },

  details: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryText: {
    color: "#111827",
    fontWeight: "600",
  },
});
