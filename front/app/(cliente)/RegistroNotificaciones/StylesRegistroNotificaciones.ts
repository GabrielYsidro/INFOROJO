import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#F04C4C",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  list: {
    padding: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardNoLeida: {
    backgroundColor: "#FFF6F6",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titulo: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  descripcion: {
    color: "#666",
    fontSize: 14,
    marginTop: 2,
  },
  fecha: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  clearButton: {
    backgroundColor: "#F04C4C",
    margin: 20,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default styles;
