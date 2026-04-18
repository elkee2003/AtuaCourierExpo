import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  transportBadge: {
    backgroundColor: "#EEF2FF", // soft indigo background
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  transportText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4338CA", // premium indigo text
    letterSpacing: 0.5,
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
    marginTop: 10,
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

  /* PROGRESS */
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
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
    color: "#777",
  },

  completedText: {
    color: "#10b981",
    fontWeight: "600",
  },

  expandHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#9CA3AF",
  },

  expandedContent: {
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  meta: {
    fontSize: 13,
    color: "#555",
  },

  primaryButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
