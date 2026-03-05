import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    paddingHorizontal: 24,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },

  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 24,
    resizeMode: "contain",
  },

  header: {
    marginBottom: 30,
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },

  inputWrapper: {
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#475569",
  },

  inputContainer: {
    position: "relative",
  },

  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
  },

  errorBorder: {
    borderColor: "#EF4444",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 5,
  },

  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },

  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#15803D",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  link: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    color: "#15803D",
    fontWeight: "500",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },

  checkboxText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    color: "#475569",
  },
});

export default styles;
