import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#c62828",
    textAlign: "center",
    marginBottom: 10,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  tableContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#c62828",
    paddingVertical: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableText: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  rowEven: {
    backgroundColor: "#fdfdfd",
  },
  rowOdd: {
    backgroundColor: "#f3f3f3",
  },
});
