import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import styles from "./StylesIndex";
import EnviarReporteDesvio from "./EnviarReporteDesvio/EnviarReporteDesvio";
import RFallaModal from "./ReporteFalla/RFallaModal";
import MapSection from "@/components/MapSection";

export default function ConductorMenuPrincipal() {
  const router = useRouter();
  const [openDesvio, setOpenDesvio] = useState(false);
  const [openFalla, setOpenFalla] = useState(false);

  const handleNavigate = (path: any) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() =>
            handleNavigate(
              "/(conductor)/EnviarReporteTrafico/EnviarReporteTrafico"
            )
          }
        >
          <Icon name="check-circle-outline" size={20} color="#fff" />
          <Text style={styles.topButtonText}>Llegada</Text>
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

      <EnviarReporteDesvio
        visible={openDesvio}
        onClose={() => setOpenDesvio(false)}
        onSubmit={(data) => {
          // aquí manejas el envío: llamada al backend o lógica local
          // ejemplo rápido: console.log y luego cerrar (si prefieres que el modal haga el POST, deja esto vacío)
          console.log("Reporte enviado desde conductor:", data);
        }}
      />

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
