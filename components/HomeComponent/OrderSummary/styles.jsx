import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },

  priceCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },

  label: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  price: {
    color: "#22C55E",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 6,
  },

  priceCardAccepted: {
    borderWidth: 1.5,
    borderColor: "#22C55E",

    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  labelAccepted: {
    color: "#6EE7B7",
    fontWeight: "600",
  },

  acceptedPrice: {
    color: "#4ADE80",
    fontWeight: "800",
  },

  acceptedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5", // soft green background
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",

    // premium shadow
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  acceptedBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,

    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  acceptedIcon: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },

  acceptedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
  },

  acceptedSubtitle: {
    fontSize: 13,
    color: "#047857",
    marginTop: 2,
  },

  lockBadge: {
    marginLeft: 10,
    backgroundColor: "#14532D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  lockBadgeText: {
    color: "#86EFAC",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  sub: {
    color: "#D1D5DB",
    marginTop: 4,
    fontSize: 12,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  section: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },

  text: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },

  offerBox: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    fontSize: 16,
  },

  offerControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  adjustBtn: {
    backgroundColor: "#1E293B",
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  adjustText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  offerInput: {
    backgroundColor: "#F9FAFB",
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: "600",
    minWidth: 120,
    textAlign: "center",
  },

  feedBack: {
    color: "#EF4444",
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
    marginTop: 14,
    marginBottom: 15,
  },

  counterBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 6,
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 6,
  },

  btnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },

  buttonDisabled: {
    backgroundColor: "#A3A3A3",
    opacity: 0.6,
  },

  buttonDisabledText: {
    color: "#E5E7EB",
  },

  //   media style
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },

  videoPreview: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  videoThumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },

  playOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
