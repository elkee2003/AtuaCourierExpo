import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 12,
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },

  icon: {
    fontSize: 26,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#172033",
    textAlign: "center",
    marginBottom: 18,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#50596B",
    marginBottom: 12,
  },

  privacyNote: {
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },

  privacyNoteText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#50596B",
  },

  boldText: {
    fontWeight: "700",
    color: "#172033",
  },

  actions: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  agreeButton: {
    minHeight: 50,
    backgroundColor: "#1769FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  agreeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  declineButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  declineButtonText: {
    color: "#50596B",
    fontSize: 14,
    fontWeight: "600",
  },

  buttonPressed: {
    opacity: 0.75,
  },
});

export default styles;
