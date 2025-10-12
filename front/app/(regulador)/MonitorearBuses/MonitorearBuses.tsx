import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { styles } from "./StylesMonitorearBuses";
import getUbicacionService from "@/services/getUbicacion";
import { useRouter } from "expo-router"; // 👈 para navegación

const StylesMonitorearBuses: React.FC = () => {
  const [region, setRegion] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [marker, setMarker] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
  });

  const [loading, setLoading] = useState(true);

  const fetchUbicacionUsuario = async () => {
    setLoading(true);
    const ubicacion = await getUbicacionService.getUbicacionUsuario();

    if (ubicacion) {
      const { latitud, longitud } = ubicacion;

      setRegion({
        latitude: latitud,
        longitude: longitud,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      setMarker({
        latitude: latitud,
        longitude: longitud,
      });
    } else {
      Alert.alert("Error", "No se pudo obtener la ubicación del servidor");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUbicacionUsuario();
  }, []);

  const handleShareLocation = () => {
    Alert.alert(
      "Ubicación compartida",
      `Tu ubicación actual es:\nLat: ${marker.latitude.toFixed(5)}, Lon: ${marker.longitude.toFixed(5)}`
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#c62828" />
        <Text>Cargando ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compartir ubicación</Text>

      <View style={styles.mapContainer}>
        <MapView provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={region}>
          <Marker coordinate={marker} title="Tu ubicación actual" />
        </MapView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={fetchUbicacionUsuario}>
          <Text style={styles.shareButtonText}>Actualizar ubicación</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
                style={styles.monitorButton}
                onPress={() => router.push("/(regulador)/index")} // 👈 Navegación al presionar
              >
                <Text style={styles.monitorButtonText}>Regresar a Dashboard</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default StylesMonitorearBuses;
const router = useRouter(); // 👈 hook para navegación
