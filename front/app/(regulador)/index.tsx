import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle, G } from "react-native-svg";
import { useRouter } from "expo-router"; // 👈 para navegación
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CHART_WIDTH = width - 24;

const dataPoints = [10, 5, 1, 15, 6, 6, 3, 1];
const labels = ["Nov 23", "24", "25", "26", "27", "28", "29", "30"];
const totalRetrasos = dataPoints.reduce((a, b) => a + b, 0);

export default function DashboardScreen() {
  const router = useRouter(); // 👈 hook para navegación

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* Filtro */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterText}>Este mes ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Cards métricas */}
      <View style={[styles.row, { marginTop: 8 }]}>
        <View style={[styles.card, styles.cardHalf]}>
          <Text style={styles.cardTitle}>Fallas</Text>
          <Text style={styles.cardNumber}>23</Text>
        </View>
        <View style={[styles.card, styles.cardHalf]}>
          <Text style={styles.cardTitle}>Desvios</Text>
          <Text style={styles.cardNumber}>14</Text>
        </View>
      </View>

      {/* Card gráfico */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitle}>Retrasos</Text>
          <Text style={styles.chartTotal}>{totalRetrasos}</Text>
        </View>

        <LineChart
          data={{
            labels,
            datasets: [{ data: dataPoints, color: () => "#EB5E55" }],
          }}
          width={CHART_WIDTH}
          height={220}
          withDots
          withShadow={false}
          withInnerLines
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines
          yAxisInterval={5}
          chartConfig={{
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: (opacity = 1) => `rgba(107,114,128,${opacity})`,
            propsForBackgroundLines: { stroke: "#E5E7EB" },
            propsForLabels: { fontSize: 11 },
            propsForDots: { r: "0" },
          }}
          bezier={false}
          formatXLabel={(v) => v}
          fromZero
          segments={5}
          decorator={(chartProps: any) => {
            const { points } = chartProps;
            if (!points?.length) return null;

            const last = points[points.length - 1];
            return (
              <Svg>
                <G>
                  <Circle cx={last.x} cy={last.y} r={10} fill="#EB5E55" opacity={0.15} />
                  <Circle cx={last.x} cy={last.y} r={6} fill="#EB5E55" opacity={0.25} />
                  <Circle cx={last.x} cy={last.y} r={4} fill="#EB5E55" />
                </G>
              </Svg>
            );
          }}
          style={{ marginLeft: -8 }}
        />
      </View>

      {/* 🔹 Botón de Monitorear */}
      <TouchableOpacity
        style={styles.monitorButton}
        onPress={async () => {
          router.push("/(regulador)/MonitorearBuses/MonitorearBuses");
          await AsyncStorage.clear();
        }} // 👈 Navegación al presionar
      >
        <Text style={styles.monitorButtonText}>Monitorear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingTop: 0 },
  header: {
    backgroundColor: "#EB5E55",
    height: 68,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 10,
    marginHorizontal: -12,
    marginBottom: 12,
  },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "700" },

  row: { flexDirection: "row", alignItems: "center" },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F4F4F5",
    borderRadius: 18,
    alignSelf: "flex-start",
  },
  filterText: { fontWeight: "600", color: "#111827" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHalf: { flex: 1, marginRight: CARD_GAP / 2 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  cardNumber: { marginTop: 6, fontSize: 28, fontWeight: "800", color: "#111827" },

  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  chartTotal: { fontSize: 24, fontWeight: "800", color: "#111827" },

  // 👇 Nuevo estilo para el botón "Monitorear"
  monitorButton: {
    backgroundColor: "#EB5E55",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  monitorButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
