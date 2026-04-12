// BottomContainer.styles.ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  wrapper: {
    padding: 16,
    gap: 14,
  },

  statusCard: {
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  dotOnline: {
    backgroundColor: "#22c55e",
  },

  dotOffline: {
    backgroundColor: "#ef4444",
  },

  statusTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  statusSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },

  warningText: {
    color: "#F59E0B",
    fontSize: 12,
    marginTop: 6,
  },

  disabledBtn: {
    opacity: 0.5,
  },

  goBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  endBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  statsCard: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },

  statBox: {
    alignItems: "center",
  },

  statNumber: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },

  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#374151",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  refreshBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  refreshText: {
    color: "white",
    fontWeight: "600",
  },
});
