import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./StylesIndex";
import EnviarReporteDesvio, { DesvioData } from "./EnviarReporteDesvio/EnviarReporteDesvio";
import RFallaModal from "./ReporteFalla/RFallaModal";
import MapSection from "@/components/MapSection";
import { enviarDesvio } from "@/services/ReporteService"; // Importamos el servicio de reporte

export default function ConductorMenuPrincipal() {
  const router = useRouter();
  const [openDesvio, setOpenDesvio] = useState(false);
  const [openFalla, setOpenFalla] = useState(false);

  const handleNavigate = (path: any) => {
    router.push(path);
  };

  // Función que maneja el envío del reporte de desvío al backend
  const handleEnviarDesvio = async (data: DesvioData) => {
    try {
      const conductorIdStr = await AsyncStorage.getItem('userId');
      if (!conductorIdStr) {
        Alert.alert("Error de Autenticación", "No se pudo encontrar la sesión del conductor. Por favor, inicie sesión de nuevo.");
        return;
      }
      const conductor_id = parseInt(conductorIdStr, 10);

      // Construimos el payload para el backend
      const payload = {
        id_reporte: `cli-${Date.now()}`, // ID único para idempotencia
        conductor_id: conductor_id,
        ruta_id: data.rutaId,
        paradero_afectado_id: data.paraderoAfectadoId,
        paradero_alterna_id: data.paraderoAlternaId,
        tipo: 3, // ID para el tipo de reporte "Desvío"
        descripcion: data.motivo,
      };

      console.log("Enviando reporte de desvío:", JSON.stringify(payload, null, 2));

      // Llamamos al servicio para enviar los datos
      await enviarDesvio(payload, { xUserId: conductorIdStr });

      Alert.alert("Éxito", "El reporte de desvío ha sido enviado correctamente.");
      setOpenDesvio(false); // Cierra el modal

    } catch (error: any) {
      console.error("Error al enviar reporte de desvío:", error);
      const errorBody = error.body ? `\nDetalle: ${JSON.stringify(error.body)}` : '';
      Alert.alert("Error", `No se pudo enviar el reporte.${errorBody}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={styles.topButton}
        >
          <Icon name="check-circle-outline" size={20} color="#fff" />
          <Text style={styles.topButtonText}>Llegada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topButton}
          onPress={() =>
            handleNavigate(
              "/(conductor)/EnviarReporteTrafico/EnviarReporteTrafico"
            )
          }
        >
          <Icon name="alert-circle-outline" size={20} color="#fff" />
          <Text style={styles.topButtonText}>Trafico</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setOpenDesvio(true)}
        >
          <Icon name="alert-circle-outline" size={20} color="#fff" />
          <Text style={styles.topButtonText}>Desvío</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setOpenFalla(true)}
        >
          <Icon name="close-circle-outline" size={20} color="#fff" />
          <Text style={styles.topButtonText}>Falla</Text>
        </TouchableOpacity>
      </View>

      {/* El modal ahora usa la nueva función handleEnviarDesvio */}
      {openDesvio && (
        <EnviarReporteDesvio
          visible={openDesvio}
          onClose={() => setOpenDesvio(false)}
          onSubmit={handleEnviarDesvio}
        />
      )}

      <RFallaModal
        visible={openFalla}
        onClose={() => setOpenFalla(false)}
        onSubmit={({
          paradero,
          tipoFalla,
          requiereIntervencion,
          unidadAfectada,
          motivo,
        }) => {
          console.log("Reporte falla desde menú principal:", {
            paradero,
            tipoFalla,
            requiereIntervencion,
            unidadAfectada,
            motivo,
          });
        }}
      />

      {/* Map Section */}
      <MapSection />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() =>
            router.push("/(conductor)/CompartirUbicacion/CompartirUbicacion")
          }
        >
          <Icon name="crosshairs-gps" size={28} color="#c62828" />
          <Text style={styles.navButtonText}>Compartir Ubicacion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButtonActive}>
          <Icon name="home" size={28} color="#fff" />
          <Text style={styles.navButtonTextActive}>Menu Principal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() =>
            router.push("/(conductor)/CuentaUsuario/CuentaUsuario")
          }
        >
          <Icon name="account-circle" size={28} color="#c62828" />
          <Text style={styles.navButtonText}>Cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
