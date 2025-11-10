import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { styles } from "./StylesMonitorearBuses";
import corredorService from "@/services/corredorService"; // 👈 importamos el servicio

interface Corredor {
  id_corredor: number;
  capacidad_max: number;
  ubicacion_lat: number;
  ubicacion_lng: number;
  estado: string | null;
}

const MonitorearBuses: React.FC = () => {
  const [corredores, setCorredores] = useState<Corredor[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });

  // 🔹 Función para obtener corredores desde el servicio
  const fetchCorredores = async () => {
    try {
      setLoading(true);
      const data = await corredorService.getAllBuses(); // ✅ Usamos el servicio

      setCorredores(data);

      if (data.length > 0) {
        setRegion({
          latitude: data[0].ubicacion_lat,
          longitude: data[0].ubicacion_lng,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        });
      }
    } catch (error: any) {
      console.error("❌ Error al obtener corredores:", error.message);
      Alert.alert("Error", "No se pudo obtener la información de los corredores");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Actualizar cada 5 segundos
  useEffect(() => {
    fetchCorredores();

    const interval = setInterval(() => {
      fetchCorredores();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#c62828" />
        <Text>Cargando corredores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitorear Buses</Text>

      {/* 🗺️ Mapa */}
      <View style={styles.mapContainer}>
        <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={region}>
          {corredores.map((c) => (
            <Marker
              key={c.id_corredor}
              coordinate={{
                latitude: c.ubicacion_lat,
                longitude: c.ubicacion_lng,
              }}
              title={`Corredor ${c.id_corredor}`}
              description={`Estado: ${c.estado}`}
            >
              <Image
                source={require("@/assets/images/bus.png")}
                style={{ width: 35, height: 35 }}
                resizeMode="contain"
              />
            </Marker>
          ))}
        </MapView>
      </View>

      {/* 🧾 Tabla */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Lista de Corredores</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, { flex: 1 }]}>ID</Text>
          <Text style={[styles.headerText, { flex: 2 }]}>Capacidad</Text>
          <Text style={[styles.headerText, { flex: 2 }]}>Estado</Text>
          <Text style={[styles.headerText, { flex: 3 }]}>Ubicación</Text>
        </View>

        <FlatList
          data={corredores}
          keyExtractor={(item) => item.id_corredor.toString()}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.rowEven : styles.rowOdd,
              ]}
            >
              <Text style={[styles.tableText, { flex: 1 }]}>{item.id_corredor}</Text>
              <Text style={[styles.tableText, { flex: 2 }]}>{item.capacidad_max}</Text>
              <Text
                style={[
                  styles.tableText,
                  { flex: 2, color: item.estado === "activo" ? "green" : "#c62828" },
                ]}
              >
                {item.estado}
              </Text>
              <Text style={[styles.tableText, { flex: 3 }]}>
                ({item.ubicacion_lat.toFixed(4)}, {item.ubicacion_lng.toFixed(4)})
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default MonitorearBuses;
