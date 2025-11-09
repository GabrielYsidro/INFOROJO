import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    alignSelf: "center",
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  fieldRow: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    marginTop: 6,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonCancel: {
    backgroundColor: "#E5E7EB",
  },
  buttonSend: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
  },
});
