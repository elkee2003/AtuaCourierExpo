import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // ============================================================
  // WRAPPER
  // ============================================================

  wrapper: {
    marginHorizontal: 12,
    marginVertical: 7,
  },

  // ============================================================
  // MAIN CARD
  // ============================================================

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    borderWidth: 1,
    borderColor: "#E8E8E8",

    overflow: "hidden",

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 5,
  },

  // ============================================================
  // HEADER
  // ============================================================

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 16,
  },

  // ============================================================
  // SERVICE
  // ============================================================

  serviceSection: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,

    paddingRight: 12,
  },

  serviceIcon: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: "#111111",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  serviceInfo: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  serviceTitle: {
    fontSize: 15,
    fontWeight: "800",

    color: "#111111",

    letterSpacing: -0.25,
  },

  serviceDescription: {
    fontSize: 10,

    fontWeight: "500",

    color: "#8B8B8B",

    marginTop: 3,
  },

  // ============================================================
  // BADGES
  // ============================================================

  expressBadge: {
    marginLeft: 7,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 5,

    backgroundColor: "#111111",
  },

  expressText: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: 0.7,
  },

  batchBadge: {
    marginLeft: 7,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 5,

    backgroundColor: "#F0F0F0",
  },

  batchText: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#555555",

    letterSpacing: 0.7,
  },

  // ============================================================
  // EARNINGS
  // ============================================================

  earningsSection: {
    alignItems: "flex-end",
    justifyContent: "center",

    minWidth: 92,
  },

  earningsLabel: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#9A9A9A",

    letterSpacing: 0.9,

    marginBottom: 2,
  },

  earningsAmount: {
    fontSize: 19,

    fontWeight: "900",

    color: "#111111",

    letterSpacing: -0.6,
  },

  offerLoader: {
    marginTop: 5,
  },

  // ============================================================
  // ROUTE CARD
  // ============================================================

  routeCard: {
    marginHorizontal: 13,

    paddingHorizontal: 13,
    paddingVertical: 14,

    borderRadius: 17,

    backgroundColor: "#F7F7F7",

    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  // ============================================================
  // LOCATION ROW
  // ============================================================

  locationRow: {
    flexDirection: "row",

    minHeight: 56,
  },

  routeIndicator: {
    width: 22,

    alignItems: "center",
  },

  pickupMarker: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: "#111111",

    marginTop: 3,
  },

  routeConnector: {
    width: 1,

    flex: 1,

    backgroundColor: "#CFCFCF",

    marginTop: 5,
    marginBottom: 3,
  },

  dropoffMarker: {
    width: 11,
    height: 11,

    borderRadius: 6,

    borderWidth: 2,

    borderColor: "#111111",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 3,
  },

  dropoffInner: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: "#111111",
  },

  // ============================================================
  // LOCATION CONTENT
  // ============================================================

  locationDetails: {
    flex: 1,

    paddingLeft: 9,

    paddingBottom: 8,
  },

  locationLabel: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#999999",

    letterSpacing: 1.1,

    marginBottom: 3,
  },

  locationAddress: {
    fontSize: 11.5,

    lineHeight: 17,

    fontWeight: "600",

    color: "#252525",
  },

  // ============================================================
  // INFORMATION STRIP
  // ============================================================

  infoStrip: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",

    paddingHorizontal: 17,

    paddingTop: 13,
    paddingBottom: 14,

    gap: 15,
  },

  infoItem: {
    flexDirection: "row",

    alignItems: "center",
  },

  infoText: {
    fontSize: 8.5,

    fontWeight: "600",

    color: "#777777",

    marginLeft: 5,
  },

  // ============================================================
  // FOOTER
  // ============================================================

  footer: {
    minHeight: 62,

    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",

    paddingHorizontal: 17,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  // ============================================================
  // AVAILABILITY
  // ============================================================

  availability: {
    flexDirection: "row",

    alignItems: "center",
  },

  liveIndicator: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#20A86B",

    marginRight: 6,
  },

  availableText: {
    fontSize: 8.5,

    fontWeight: "700",

    color: "#777777",
  },

  // ============================================================
  // ACTIONS
  // ============================================================

  actions: {
    flexDirection: "row",

    alignItems: "center",

    gap: 8,
  },

  // ============================================================
  // REMOVE
  // ============================================================

  removeButton: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: "#F5F5F5",

    borderWidth: 1,
    borderColor: "#E8E8E8",

    alignItems: "center",
    justifyContent: "center",
  },

  // ============================================================
  // VIEW BUTTON
  // ============================================================

  viewButton: {
    height: 38,

    paddingLeft: 14,
    paddingRight: 5,

    borderRadius: 12,

    backgroundColor: "#111111",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  viewButtonText: {
    fontSize: 9.5,

    fontWeight: "800",

    color: "#FFFFFF",

    letterSpacing: 0.05,

    marginRight: 9,
  },

  arrowCircle: {
    width: 28,
    height: 28,

    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",
  },
});
