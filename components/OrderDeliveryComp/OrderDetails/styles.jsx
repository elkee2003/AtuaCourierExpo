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
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#F1F5F9",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  text: {
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 6,
  },

  linkText: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 6,
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

  successRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  successDot: {
    color: "#22C55E",
    marginRight: 6,
  },

  successText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "500",
  },

  /* INPUT */
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F1F5F9",

    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
  },

  /* BUTTON */
  button: {
    marginTop: 14,
    backgroundColor: "#16A34A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",

    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonDisabled: {
    backgroundColor: "#CBD5F5",
    shadowOpacity: 0,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
