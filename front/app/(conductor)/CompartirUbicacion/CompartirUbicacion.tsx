import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, AppState } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getUsers from "@/services/userService";
import ubicacionService from "@/services/ubicacionService";
import { styles } from "./StylesCompartirUbicacion";

export default function CompartirUbicacion() {
  const [busId, setBusId] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const watchId = useRef<Location.LocationSubscription | null>(null);

  // Obtener corredor asignado
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const idStr = await AsyncStorage.getItem("userId");
        if (!idStr) throw new Error("No se encontró el ID del usuario.");
        const id_usuario = parseInt(idStr, 10);

        const usuario = await getUsers.getUsers(id_usuario);
        if (!usuario || !usuario.id_corredor_asignado) {
          throw new Error("El usuario no tiene un corredor asignado.");
        }

        setBusId(usuario.id_corredor_asignado);
      } catch (error: any) {
        console.error("Error al obtener corredor asignado:", error.message);
        Alert.alert("Error", "No se pudo obtener el corredor asignado.");
      }
    };
    fetchUsuario();
  }, []);

  // Reactivar transmisión si la app vuelve a primer plano
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && isSharing && !watchId.current) {
        handleStartSharing();
      }
    });
    return () => subscription.remove();
  }, [isSharing]);

  // Iniciar transmisión
  const handleStartSharing = async () => {
    if (!busId) {
      Alert.alert("Error", "No se encontró el ID del corredor asignado.");
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se puede acceder a la ubicación.");
      return;
    }

    setIsSharing(true);

    watchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0,
      },
      async (pos) => {
        if (!pos || !pos.coords) return;

        const { latitude, longitude } = pos.coords;
        setLocation(pos.coords);
        console.log(`Corredor ${busId}: ${latitude}, ${longitude}`);

        try {
          await ubicacionService.actualizarUbicacionCorredor(
            busId,
            latitude,
            longitude,
            "En ruta"
          );
        } catch (error: any) {
          console.error("Error al enviar ubicación:", error.message);
        }
      }
    );
  };

  // Detener transmisión
  const handleStopSharing = () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    setIsSharing(false);
    Alert.alert("Transmisión detenida", "La ubicación ya no se está compartiendo.");
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
      <View style={styles.infoContainer}>
        <Text style={styles.label}>
          {busId ? `ID CORREDOR: ${busId}` : "Cargando ID del corredor..."}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isSharing && styles.buttonStop]}
        onPress={isSharing ? handleStopSharing : handleStartSharing}
        disabled={!busId}
      >
        <Text style={styles.buttonText}>
          {isSharing ? "Detener transmisión" : "Iniciar transmisión"}
        </Text>
      </TouchableOpacity>

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
              title={`Corredor ${busId}`}
              description="Ubicación actual del corredor"
            />
          )}
        </MapView>
      </View>
    </View>
  );
}
