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

  price: {
    color: "#22C55E",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 6,
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
