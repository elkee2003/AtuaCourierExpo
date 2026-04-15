import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },

  /* 📍 DISTANCE BADGE */
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  /* 📊 PROGRESS */
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  progressItem: {
    alignItems: "center",
    flex: 1,
  },

  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CBD5F5",
    marginBottom: 4,
  },

  activeCircle: {
    backgroundColor: "#2563EB",
  },

  progressText: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  icon: {
    marginRight: 10,
    color: "#2563EB",
  },

  text: {
    fontSize: 15,
    color: "#0F172A",
    flexShrink: 1,
  },

  /* INPUT */
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F1F5F9",
  },

  /* BUTTON */
  button: {
    marginTop: 10,
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#CBD5F5",
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#022C22",
  },

  buttonTextDisabled: {
    color: "#64748B",
  },
});
