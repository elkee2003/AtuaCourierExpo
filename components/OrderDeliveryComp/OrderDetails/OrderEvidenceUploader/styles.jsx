import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,

    shadowColor: "#020617",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  /* ================= HEADER ================= */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#020617",
    letterSpacing: -0.2,
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,

    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  /* ================= PROGRESS ================= */
  progressContainer: {
    marginTop: 10,
    marginBottom: 14,
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 999,
  },

  progressText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },

  /* ================= ACTION BUTTONS ================= */
  actions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    backgroundColor: "#020617",
    paddingVertical: 14,
    borderRadius: 14,
  },

  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },

  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  secondaryText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 13,
  },

  /* ================= MEDIA ================= */
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  imageWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },

  previewImage: {
    width: 95,
    height: 95,
    borderRadius: 14,
  },

  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    fontStyle: "italic",
  },

  /* ================= VIDEO ================= */
  videoCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  videoThumbnail: {
    width: "100%",
    height: 190,
  },

  playOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(2,6,23,0.35)",
  },

  /* ================= COMPLETION TEXT ================= */
  successText: {
    marginTop: 10,
    color: "#16A34A",
    fontSize: 13,
    fontWeight: "600",
  },
});
