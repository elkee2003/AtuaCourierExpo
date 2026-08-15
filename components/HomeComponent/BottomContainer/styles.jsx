import { StyleSheet } from "react-native";

export default StyleSheet.create({
  /* ==========================================================
     WRAPPER
  ========================================================== */

  wrapper: {
    width: "100%",

    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,

    gap: 10,
  },

  /* ==========================================================
     STATUS CARD
  ========================================================== */

  statusCard: {
    width: "100%",

    backgroundColor: "#121212",

    borderRadius: 20,

    padding: 16,

    borderWidth: 1,
    borderColor: "#202020",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,

    elevation: 6,
  },

  /* ==========================================================
     STATUS INFORMATION
  ========================================================== */

  statusIdentity: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
  },

  statusIndicator: {
    width: 11,
    height: 11,

    borderRadius: 6,

    marginRight: 11,
  },

  statusIndicatorOnline: {
    backgroundColor: "#22C55E",

    shadowColor: "#22C55E",
    shadowOpacity: 0.65,
    shadowRadius: 6,

    elevation: 3,
  },

  statusIndicatorOffline: {
    backgroundColor: "#EF4444",

    shadowColor: "#EF4444",
    shadowOpacity: 0.35,
    shadowRadius: 5,

    elevation: 2,
  },

  statusContent: {
    flex: 1,

    minWidth: 0,
  },

  statusTitleRow: {
    flexDirection: "row",
    alignItems: "center",

    flexWrap: "wrap",
  },

  statusTitle: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "800",

    letterSpacing: -0.2,
  },

  statusSubtitle: {
    color: "#9CA3AF",

    fontSize: 11,
    lineHeight: 16,

    marginTop: 3,
  },

  /* ==========================================================
     STATUS BADGE
  ========================================================== */

  statusBadge: {
    marginLeft: 7,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 5,

    borderWidth: 1,
  },

  statusBadgeOnline: {
    backgroundColor: "rgba(34, 197, 94, 0.10)",
    borderColor: "rgba(34, 197, 94, 0.25)",
  },

  statusBadgeOffline: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",
    borderColor: "rgba(239, 68, 68, 0.25)",
  },

  statusBadgeText: {
    fontSize: 7,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  statusBadgeTextOnline: {
    color: "#4ADE80",
  },

  statusBadgeTextOffline: {
    color: "#F87171",
  },

  /* ==========================================================
     APPROVAL WARNING
  ========================================================== */

  warningContainer: {
    width: "100%",

    flexDirection: "row",
    alignItems: "flex-start",

    marginTop: 13,
    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: "#242424",
  },

  warningIconContainer: {
    width: 17,
    height: 17,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(245, 158, 11, 0.15)",

    marginRight: 8,
  },

  warningIcon: {
    color: "#F59E0B",

    fontSize: 10,
    fontWeight: "900",

    lineHeight: 17,

    textAlign: "center",
  },

  warningText: {
    flex: 1,

    color: "#D1D5DB",

    fontSize: 10,
    lineHeight: 15,
  },

  /* ==========================================================
     GO ONLINE / GO OFFLINE
     INSIDE STATUS CARD
  ========================================================== */

  onlineButton: {
    width: "100%",

    height: 45,

    marginTop: 15,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,

    borderWidth: 1,
  },

  onlineButtonOnline: {
    backgroundColor: "#16A34A",

    borderColor: "#22C55E",

    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,

    elevation: 2,
  },

  onlineButtonOffline: {
    backgroundColor: "#DC2626",

    borderColor: "#EF4444",

    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,

    elevation: 2,
  },

  onlineButtonIndicator: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 8,
  },

  onlineButtonIndicatorOnline: {
    backgroundColor: "#BBF7D0",
  },

  onlineButtonIndicatorOffline: {
    backgroundColor: "#FECACA",
  },

  onlineButtonText: {
    color: "#FFFFFF",

    fontSize: 11,
    fontWeight: "900",

    letterSpacing: 0.25,
  },

  disabledButton: {
    backgroundColor: "#303030",

    borderColor: "#404040",

    shadowOpacity: 0,

    opacity: 0.7,
  },

  /* ==========================================================
     LIVE JOB STATS
  ========================================================== */

  statsCard: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    paddingVertical: 15,
    paddingHorizontal: 4,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 3,
  },

  statItem: {
    flex: 1,

    minWidth: 0,

    alignItems: "center",
    justifyContent: "center",
  },

  statNumber: {
    color: "#111827",

    fontSize: 20,
    fontWeight: "900",

    lineHeight: 23,

    letterSpacing: -0.5,
  },

  statLabel: {
    color: "#6B7280",

    fontSize: 9,
    fontWeight: "600",

    marginTop: 4,

    textAlign: "center",

    letterSpacing: 0.1,
  },

  statDivider: {
    width: 1,

    height: 31,

    backgroundColor: "#E5E7EB",
  },

  /* ==========================================================
     REFRESH JOBS
  ========================================================== */

  refreshButton: {
    width: "100%",

    height: 42,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  refreshIcon: {
    color: "#2563EB",

    fontSize: 18,
    fontWeight: "700",

    marginRight: 7,

    lineHeight: 20,
  },

  refreshText: {
    color: "#1F2937",

    fontSize: 11,
    fontWeight: "800",
  },

  /* ==========================================================
     EARLY ACCESS
  ========================================================== */

  earlyAccessTitle: {
    color: "#FFFFFF",

    fontSize: 17,
    fontWeight: "800",

    marginBottom: 9,
  },

  earlyAccessText: {
    color: "#9CA3AF",

    fontSize: 11,
    lineHeight: 17,

    marginBottom: 4,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 17,
    paddingTop: 15,

    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
});
