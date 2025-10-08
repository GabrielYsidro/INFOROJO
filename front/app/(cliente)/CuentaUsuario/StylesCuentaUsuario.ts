

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

});

export default styles;