import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { styles } from "./StylesCompartirUbicacion";

export default function CompartirUbicacion() {
  const backendUrl = "http://10.0.2.2:8000"; // ⚠️ Cambia por tu URL del backend si no usas emulador
  const [busId, setBusId] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const watchId = useRef<Location.LocationSubscription | null>(null);

  const handleStartSharing = async () => {
    if (!busId.trim()) {
      Alert.alert("Error", "Por favor ingresa el ID del corredor antes de iniciar.");
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se puede acceder a la ubicación.");
      return;
    }

    setIsSharing(true);

    // Inicia la transmisión de ubicación cada 1 minuto
    watchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 1 minuto
        distanceInterval: 0,
      },
      async (pos) => {
        if (!pos || !pos.coords) {
          console.warn("⚠️ No se pudo obtener coordenadas válidas todavía.");
          return;
        }

        const { latitude, longitude } = pos.coords;
        setLocation(pos.coords);

        console.log(`📍 Bus ${busId}: ${latitude}, ${longitude}`);

        try {
          const response = await fetch(`${backendUrl}/corredor/${busId}/ubicacion`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ubicacion_lat: latitude,
              ubicacion_lng: longitude,
              estado: "En ruta", // Puedes cambiar a "En paradero" según lógica
            }),
          });

          if (!response.ok) {
            throw new Error("Error al enviar ubicación");
          }

          console.log("✅ Ubicación enviada correctamente");
        } catch (error) {
          console.error("❌ Error al enviar ubicación:", error);
        }
      }
    );
  };

  const handleStopSharing = () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    setIsSharing(false);
    Alert.alert("Transmisión detenida", "Ya no se está compartiendo la ubicación.");
  };

  useEffect(() => {
    return () => {
      if (watchId.current) {
        watchId.current.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Entrada del ID del corredor */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>ID del Corredor:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: 1, 2, 3..."
          value={busId}
          onChangeText={setBusId}
          editable={!isSharing}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, isSharing && styles.buttonStop]}
          onPress={isSharing ? handleStopSharing : handleStartSharing}
        >
          <Text style={styles.buttonText}>
            {isSharing ? "Detener transmisión" : "Iniciar transmisión"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mapa con marcador */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : {
                  latitude: -12.0464,
                  longitude: -77.0428,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }
          }
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`Bus ${busId}`}
              description="Ubicación actual del corredor"
            />
          )}
        </MapView>
      </View>
    </View>
  );
}
