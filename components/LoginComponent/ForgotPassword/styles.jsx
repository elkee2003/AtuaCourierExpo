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

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
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

  link: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
    color: "#15803D",
    fontWeight: "500",
  },
});

export default styles;
