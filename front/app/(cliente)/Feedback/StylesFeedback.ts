import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    padding: 20,
    width: "100%",
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
  },
  fieldRow: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: "#fff",
    color: "#111827",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: "#fff",
    color: "#111827",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#F3F4F6",
  },
  buttonSend: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    fontSize: 14,
  },
});