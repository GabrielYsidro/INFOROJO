

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#c62828",
    marginBottom: 24,
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    color: "#c62828",
    width: 80,
  },
  value: {
    color: "#000",
    flexShrink: 1,
  },
  errorText: {
    color: "#c62828",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "#c62828",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Estilos para el Modal de Compartición
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    height: "70%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#999",
    padding: 8,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  linkBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  linkLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  linkDisplay: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  linkText: {
    fontSize: 12,
    color: "#2196F3",
    fontFamily: "monospace",
  },
  buttonGroup: {
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: "#4CAF50",
  },
  buttonDanger: {
    backgroundColor: "#c62828",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    fontSize: 12,
    color: "#1565c0",
    marginVertical: 4,
    fontWeight: "500",
  },
});

export default styles;