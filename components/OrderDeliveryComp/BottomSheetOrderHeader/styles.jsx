import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  card: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 18,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,

    elevation: 10,
  },

  /* 🔝 TOP ROW */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metricBox: {
    alignItems: "center",
  },

  metricValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },

  metricLabel: {
    fontSize: 11,
    color: "#cbd5e1",
    marginTop: 2,
    letterSpacing: 0.5,
  },

  /* 🎯 CENTER */
  centerBlock: {
    alignItems: "center",
  },

  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  /* 🚚 TRANSPORT BADGE */
  transportBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  transportText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#e2e8f0",
    letterSpacing: 0.6,
  },

  /* 📦 STATUS */
  statusContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  statusText: {
    fontSize: 13,
    color: "#cbd5e1",
    letterSpacing: 0.3,
  },

  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 6,
    maxWidth: 220,
  },
});

export default styles;
