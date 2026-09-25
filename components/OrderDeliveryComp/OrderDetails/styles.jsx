import { StyleSheet } from "react-native";

export default StyleSheet.create({
  /* ============================================================
     MAIN CONTAINER
     ============================================================ */

  container: {
    flex: 1,
    backgroundColor: "#F4F4F2",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
  },

  /* ============================================================
     STATUS HEADER
     ============================================================ */

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  statusHeaderContent: {
    flex: 1,
  },

  statusEyebrow: {
    fontSize: 6.5,
    fontWeight: "900",
    color: "#999999",
    letterSpacing: 1.3,
    marginBottom: 3,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#171717",
    letterSpacing: -0.4,
  },

  timeBadge: {
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  timeValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  timeLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    color: "#858585",
    letterSpacing: 1,
    marginTop: 1,
  },

  /* ============================================================
   DELIVERY PROGRESS
   ============================================================ */

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 16,

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

  progressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },

  progressItem: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },

  /*
   * This is the important fix.
   *
   * The circle is now centered inside each progress item,
   * instead of sitting at the left edge of the item.
   */
  progressNodeRow: {
    width: "100%",
    height: 28,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,

    backgroundColor: "#171717",

    alignItems: "center",
    justifyContent: "center",

    zIndex: 2,
    elevation: 2,
  },

  completedCircle: {
    backgroundColor: "#171717",
  },

  activeCircle: {
    backgroundColor: "#00B84A",
  },

  circleCheck: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
  },

  /*
   * The connecting line starts from the CENTER of the
   * current circle and extends to the next progress item.
   */
  progressLine: {
    position: "absolute",

    left: "50%",
    right: "-50%",

    height: 3,

    backgroundColor: "#171717",

    zIndex: 1,
  },

  progressLineActive: {
    backgroundColor: "#171717",
  },

  progressText: {
    marginTop: 7,

    width: "100%",

    fontSize: 9,
    fontWeight: "700",

    color: "#222222",

    textAlign: "center",

    includeFontPadding: false,
  },

  progressTextActive: {
    color: "#111111",
  },

  /* ============================================================
     GENERAL CARD
     ============================================================ */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,

    padding: 16,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E7E7E5",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 11,

    elevation: 2,
  },

  /* ============================================================
     CARD HEADER
     ============================================================ */

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardIcon: {
    width: 33,
    height: 33,

    borderRadius: 10,

    backgroundColor: "#F1F1EF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  cardIconText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111111",
  },

  cardHeaderContent: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 8,
    fontWeight: "900",

    color: "#242424",

    letterSpacing: 1,
  },

  sectionSubtitle: {
    fontSize: 8,

    color: "#929292",

    marginTop: 2,
  },

  /* ============================================================
     PERSON
     ============================================================ */

  personRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 10,
  },

  personAvatar: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: "#111111",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  personAvatarText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  personContent: {
    flex: 1,
  },

  personName: {
    fontSize: 12,

    fontWeight: "800",

    color: "#222222",
  },

  personRole: {
    fontSize: 7.5,

    color: "#929292",

    marginTop: 2,
  },

  /* ============================================================
     PHONE BUTTON
     ============================================================ */

  phoneButton: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F6F6F4",

    borderWidth: 1,
    borderColor: "#E9E9E7",

    borderRadius: 10,

    paddingHorizontal: 9,
    paddingVertical: 7,

    marginBottom: 10,
  },

  phoneIcon: {
    fontSize: 9,

    color: "#16A34A",

    marginRight: 6,
  },

  phoneText: {
    fontSize: 9,

    fontWeight: "700",

    color: "#333333",
  },

  copyText: {
    fontSize: 5.5,

    fontWeight: "900",

    color: "#16A34A",

    letterSpacing: 0.7,

    marginLeft: 9,
  },

  /* ============================================================
     ADDRESS
     ============================================================ */

  addressBox: {
    backgroundColor: "#F7F7F5",

    borderRadius: 14,

    padding: 12,

    marginTop: 3,

    borderWidth: 1,
    borderColor: "#ECECEA",
  },

  addressLabel: {
    fontSize: 6,

    fontWeight: "900",

    color: "#999999",

    letterSpacing: 0.9,

    marginBottom: 5,
  },

  addressText: {
    fontSize: 10,

    lineHeight: 15,

    fontWeight: "600",

    color: "#303030",
  },

  /* ============================================================
     SERVICE
     ============================================================ */

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",

    marginTop: 7,

    paddingTop: 11,

    borderTopWidth: 1,
    borderTopColor: "#F0F0EE",
  },

  serviceLabel: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#999999",

    letterSpacing: 0.9,
  },

  serviceBadge: {
    backgroundColor: "#111111",

    borderRadius: 8,

    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  serviceBadgeText: {
    fontSize: 6.5,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: 0.8,
  },

  /* ============================================================
     EVIDENCE WRAPPER
     ============================================================ */

  evidenceWrapper: {
    marginBottom: 12,
  },

  /* ============================================================
     EVIDENCE STATUS
     ============================================================ */

  successRow: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F7FDF9",

    borderRadius: 13,

    paddingHorizontal: 10,
    paddingVertical: 10,

    marginBottom: 7,

    borderWidth: 1,
    borderColor: "#E0F3E7",
  },

  successIcon: {
    width: 28,
    height: 28,

    borderRadius: 9,

    backgroundColor: "#DCFCE7",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  successIconText: {
    color: "#16A34A",

    fontSize: 10,

    fontWeight: "900",
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    fontSize: 9.5,

    fontWeight: "800",

    color: "#245A37",
  },

  successSubtitle: {
    fontSize: 7.5,

    color: "#6D8C77",

    marginTop: 2,
  },

  emptyEvidence: {
    fontSize: 8.5,

    lineHeight: 14,

    color: "#999999",

    paddingVertical: 5,
  },

  /* ============================================================
     VERIFICATION
     ============================================================ */

  verificationCard: {
    backgroundColor: "#111111",

    borderRadius: 20,

    padding: 16,

    marginBottom: 12,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 4,
  },

  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 14,
  },

  verificationIcon: {
    width: 35,
    height: 35,

    borderRadius: 11,

    backgroundColor: "#252525",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  verificationIconText: {
    fontSize: 14,

    fontWeight: "900",

    color: "#FFFFFF",
  },

  verificationContent: {
    flex: 1,
  },

  verificationTitle: {
    fontSize: 8,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: 1,
  },

  verificationSubtitle: {
    fontSize: 8,

    lineHeight: 13,

    color: "#8D8D8D",

    marginTop: 3,
  },

  /* ============================================================
     VERIFICATION INPUT
     ============================================================ */

  input: {
    height: 53,

    backgroundColor: "#1D1D1D",

    borderWidth: 1,
    borderColor: "#353535",

    borderRadius: 13,

    paddingHorizontal: 14,

    color: "#FFFFFF",

    fontSize: 21,

    fontWeight: "900",

    letterSpacing: 6,

    textAlign: "center",
  },

  /* ============================================================
     MAIN ACTION
     ============================================================ */

  actionWrapper: {
    marginTop: 1,

    marginBottom: 4,
  },

  button: {
    minHeight: 55,

    borderRadius: 16,

    backgroundColor: "#16A34A",

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 18,

    shadowColor: "#16A34A",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.24,

    shadowRadius: 12,

    elevation: 5,
  },

  buttonDisabled: {
    backgroundColor: "#A3A3A3",

    shadowOpacity: 0,

    elevation: 0,
  },

  buttonText: {
    fontSize: 11,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: 0.3,
  },

  buttonArrow: {
    fontSize: 18,

    fontWeight: "700",

    color: "#FFFFFF",

    marginLeft: 10,

    marginTop: -1,
  },
});
