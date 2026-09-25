import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // ============================================================
  // SCREEN
  // ============================================================

  screen: {
    flex: 1,
    backgroundColor: "#F4F4F2",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F4F2",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 40,
  },

  // ============================================================
  // LOADING
  // ============================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F4F4F2",

    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,

    fontSize: 10,
    fontWeight: "600",

    color: "#777777",
  },

  // ============================================================
  // HERO / PRICE CARD
  // ============================================================

  heroCard: {
    backgroundColor: "#111111",

    borderRadius: 24,

    padding: 20,

    marginBottom: 12,

    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 9,
    },

    elevation: 7,
  },

  heroCardAccepted: {
    backgroundColor: "#092A1C",

    borderWidth: 1,
    borderColor: "#20A86B",

    shadowColor: "#20A86B",
    shadowOpacity: 0.18,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  heroLabel: {
    fontSize: 7,

    fontWeight: "900",

    color: "#929292",

    letterSpacing: 1.3,

    marginBottom: 4,
  },

  heroLabelAccepted: {
    color: "#7BD6A8",
  },

  heroPrice: {
    fontSize: 31,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: -1.1,
  },

  heroPriceAccepted: {
    color: "#4ADE80",
  },

  serviceHeroBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 8,

    borderRadius: 11,

    backgroundColor: "#252525",
  },

  serviceHeroText: {
    fontSize: 7,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: 0.9,

    marginLeft: 6,
  },

  heroBottom: {
    flexDirection: "row",
    alignItems: "flex-end",

    marginTop: 19,

    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: "#2B2B2B",

    gap: 25,
  },

  heroMetaLabel: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#777777",

    letterSpacing: 1,

    marginBottom: 3,
  },

  heroMetaValue: {
    fontSize: 9,

    fontWeight: "700",

    color: "#EEEEEE",

    maxWidth: 115,
  },

  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#14532D",

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 8,

    marginLeft: "auto",
  },

  lockedText: {
    color: "#86EFAC",

    fontSize: 6.5,

    fontWeight: "900",

    letterSpacing: 0.8,

    marginLeft: 5,
  },

  // ============================================================
  // MARKETPLACE STATUS
  // ============================================================

  statusCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 14,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E6E6E4",

    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  statusIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  statusIconAvailable: {
    backgroundColor: "#10A86B",
  },

  statusIconUnavailable: {
    backgroundColor: "#6B7280",
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 13,

    fontWeight: "800",

    color: "#151515",
  },

  statusSubtitle: {
    fontSize: 9.5,

    lineHeight: 14,

    fontWeight: "500",

    color: "#777777",

    marginTop: 3,
  },

  // ============================================================
  // ACCEPTED CARD
  // ============================================================

  acceptedCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#ECFDF5",

    borderRadius: 18,

    padding: 14,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  acceptedIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: "#10B981",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  acceptedContent: {
    flex: 1,
  },

  acceptedTitle: {
    fontSize: 13,

    fontWeight: "800",

    color: "#065F46",
  },

  acceptedSubtitle: {
    fontSize: 9.5,

    color: "#047857",

    marginTop: 3,
  },

  // ============================================================
  // SECTION CARD
  // ============================================================

  sectionCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 16,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E7E7E5",

    shadowColor: "#000000",
    shadowOpacity: 0.035,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  // ============================================================
  // SECTION HEADER
  // ============================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 15,
  },

  sectionIcon: {
    width: 31,
    height: 31,

    borderRadius: 10,

    backgroundColor: "#F1F1EF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 12,

    fontWeight: "800",

    color: "#161616",

    letterSpacing: -0.1,
  },

  // ============================================================
  // SENDER
  // ============================================================

  senderRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: "#111111",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  avatarText: {
    fontSize: 16,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  senderName: {
    fontSize: 12,

    fontWeight: "800",

    color: "#222222",
  },

  senderSubtitle: {
    fontSize: 9,

    color: "#888888",

    marginTop: 2,
  },

  // ============================================================
  // ROUTE
  // ============================================================

  routeContainer: {
    backgroundColor: "#F7F7F5",

    borderRadius: 16,

    padding: 13,
  },

  routeRow: {
    flexDirection: "row",

    minHeight: 58,
  },

  routeRail: {
    width: 23,

    alignItems: "center",
  },

  pickupDot: {
    width: 11,
    height: 11,

    borderRadius: 6,

    backgroundColor: "#111111",

    marginTop: 3,
  },

  routeLine: {
    width: 1,

    flex: 1,

    backgroundColor: "#D0D0CE",

    marginTop: 5,
    marginBottom: 4,
  },

  dropoffDot: {
    width: 12,
    height: 12,

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

  routeContent: {
    flex: 1,

    paddingLeft: 8,
    paddingBottom: 10,
  },

  routeLabel: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#999999",

    letterSpacing: 1.1,

    marginBottom: 3,
  },

  routeAddress: {
    fontSize: 11.5,

    lineHeight: 17,

    fontWeight: "600",

    color: "#272727",
  },

  // ============================================================
  // ROUTE META
  // ============================================================

  routeMeta: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 20,

    marginTop: 13,

    paddingTop: 13,

    borderTopWidth: 1,
    borderTopColor: "#E6E6E4",
  },

  routeMetaItem: {
    minWidth: 70,
  },

  metaLabel: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#999999",

    letterSpacing: 0.9,

    marginBottom: 3,
  },

  metaValue: {
    fontSize: 9,

    fontWeight: "700",

    color: "#333333",
  },

  // ============================================================
  // DISPATCH
  // ============================================================

  dispatchBox: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F7F7F5",

    borderRadius: 15,

    padding: 13,
  },

  dispatchStatusDot: {
    width: 9,
    height: 9,

    borderRadius: 5,

    backgroundColor: "#20A86B",

    marginRight: 10,
  },

  dispatchContent: {
    flex: 1,
  },

  dispatchTitle: {
    fontSize: 10.5,

    fontWeight: "800",

    color: "#222222",
  },

  dispatchText: {
    fontSize: 9,

    lineHeight: 14,

    color: "#777777",

    marginTop: 3,
  },

  // ============================================================
  // CARGO EVIDENCE
  // ============================================================

  mediaLoading: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,
  },

  mediaLoadingText: {
    fontSize: 9,

    color: "#777777",

    marginLeft: 7,
  },

  photoScroll: {
    marginHorizontal: -2,
  },

  previewImage: {
    width: 86,
    height: 86,

    borderRadius: 13,

    marginRight: 8,

    backgroundColor: "#EEEEEE",
  },

  videoPreview: {
    marginTop: 10,

    borderRadius: 15,

    overflow: "hidden",

    position: "relative",
  },

  videoThumbnail: {
    width: "100%",
    height: 190,

    borderRadius: 15,
  },

  playOverlay: {
    position: "absolute",

    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(0,0,0,0.20)",
  },

  playButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  emptyText: {
    fontSize: 9.5,

    color: "#888888",

    lineHeight: 15,
  },

  // ============================================================
  // CARGO DETAILS
  // ============================================================

  detailList: {
    gap: 0,
  },

  detailRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    paddingVertical: 11,

    borderBottomWidth: 1,
    borderBottomColor: "#F0F0EE",
  },

  detailLabel: {
    flex: 0.9,

    fontSize: 7,

    fontWeight: "900",

    color: "#999999",

    letterSpacing: 0.8,
  },

  detailValue: {
    flex: 1.5,

    textAlign: "right",

    fontSize: 10,

    lineHeight: 15,

    fontWeight: "600",

    color: "#333333",
  },

  // ============================================================
  // FEES
  // ============================================================

  feeList: {
    gap: 0,
  },

  feeRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 10,

    borderBottomWidth: 1,
    borderBottomColor: "#F0F0EE",
  },

  feeLabel: {
    fontSize: 10,

    fontWeight: "600",

    color: "#666666",
  },

  feeValue: {
    fontSize: 10,

    fontWeight: "800",

    color: "#222222",
  },

  // ============================================================
  // MAXI OFFER
  // ============================================================

  offerCard: {
    backgroundColor: "#111111",

    borderRadius: 22,

    padding: 17,

    marginBottom: 12,
  },

  offerHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },

  offerTitle: {
    fontSize: 14,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  offerSubtitle: {
    fontSize: 8.5,

    lineHeight: 13,

    color: "#8F8F8F",

    marginTop: 3,

    maxWidth: 250,
  },

  offerBadge: {
    backgroundColor: "#292929",

    borderRadius: 8,

    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  offerBadgeText: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: 0.8,
  },

  offerControl: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 20,
  },

  adjustButton: {
    width: 44,
    height: 44,

    borderRadius: 13,

    backgroundColor: "#282828",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#373737",
  },

  adjustText: {
    color: "#FFFFFF",

    fontSize: 24,

    fontWeight: "600",

    lineHeight: 27,
  },

  offerInputContainer: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginHorizontal: 10,

    minWidth: 135,

    backgroundColor: "#1C1C1C",

    borderRadius: 13,

    borderWidth: 1,
    borderColor: "#333333",

    paddingHorizontal: 13,
  },

  offerCurrency: {
    fontSize: 17,

    fontWeight: "800",

    color: "#777777",

    marginRight: 2,
  },

  offerInput: {
    flex: 1,

    paddingVertical: 10,

    fontSize: 18,

    fontWeight: "800",

    color: "#FFFFFF",

    textAlign: "center",
  },

  feedBack: {
    fontSize: 8.5,

    color: "#F87171",

    marginTop: 8,

    textAlign: "center",
  },

  // ============================================================
  // ACTION BUTTONS
  // ============================================================

  actionRow: {
    flexDirection: "row",

    marginTop: 17,

    gap: 8,
  },

  counterButton: {
    flex: 1,

    minHeight: 46,

    borderRadius: 13,

    backgroundColor: "#303030",

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  acceptButton: {
    flex: 1,

    minHeight: 46,

    borderRadius: 13,

    backgroundColor: "#16A34A",

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  buttonText: {
    fontSize: 10,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  // ============================================================
  // MICRO / MOTO PRIMARY ACTION
  // ============================================================

  bottomAction: {
    marginBottom: 12,
  },

  primaryAcceptButton: {
    minHeight: 53,

    borderRadius: 16,

    backgroundColor: "#111111",

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 9,

    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  primaryButtonText: {
    fontSize: 11,

    fontWeight: "800",

    color: "#FFFFFF",

    letterSpacing: 0.1,
  },

  // ============================================================
  // DISABLED
  // ============================================================

  buttonDisabled: {
    backgroundColor: "#A1A1A1",

    opacity: 0.65,

    shadowOpacity: 0,

    elevation: 0,
  },
});
