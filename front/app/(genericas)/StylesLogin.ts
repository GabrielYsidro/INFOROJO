import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF5A5F",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FF5A5F",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  registerLink: {
    color: "#fff",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});

export default styles;