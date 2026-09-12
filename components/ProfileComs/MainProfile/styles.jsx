import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  /* Header */
  header: {
    backgroundColor: "#111827",
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  signOutBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: 60,
  },

  signOut: {
    color: "#f89f9f",
  },

  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
    padding: 4,
    marginBottom: 12,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  role: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },

  // Approval style
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  approved: {
    backgroundColor: "#16A34A",
  },

  pending: {
    backgroundColor: "#F59E0B",
  },

  blocked: {
    backgroundColor: "#DC2626",
  },

  /* Incomplete profile notice */

  incompleteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  incompleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  incompleteContent: {
    flex: 1,
  },

  incompleteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 6,
  },

  incompleteMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: "#92400E",
    marginBottom: 12,
  },

  completeButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D97706",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  completeButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 8,
  },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  /* Actions */
  actions: {
    marginTop: 24,
    marginHorizontal: 16,
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  secondaryBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 15,
  },

  /* Settings */
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  settingText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
});
