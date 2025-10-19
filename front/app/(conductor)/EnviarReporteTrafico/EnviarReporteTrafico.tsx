import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./StylesReporteTrafico";
import { enviarReporteTrafico } from "@/services/reporteTraficoService";

// const API_URL = "http://10.0.2.2:8000/reports/retraso";

const EnviarReporteTrafico: React.FC = () => {
  const [motivo, setMotivo] = useState("");
  const [lugar, setLugar] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNotificar = async () => {
  if (!lugar || !motivo || !tiempo) {
    Alert.alert("Campos incompletos", "Por favor completa todos los campos.");
    return;
  }

  try {
    setLoading(true);

    const idStr = await AsyncStorage.getItem("userId");
    if (!idStr) throw new Error("No se encontró el ID del usuario.");
    const conductor_id = parseInt(idStr, 10);

    const data = await enviarReporteTrafico(
      conductor_id,
      1, // ruta_id
      2, // paradero_inicial_id
      3, // paradero_final_id
      parseInt(tiempo, 10),
      `Tráfico en ${lugar}. Motivo: ${motivo}`
    );

    Alert.alert("Reporte enviado", "Tu reporte fue registrado exitosamente.");
    setLugar("");
    setMotivo("");
    setTiempo("");
  } catch (error: any) {
    console.error(error);
    Alert.alert("Error", error.message || "No se pudo enviar el reporte.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportar tráfico</Text>

      <Text style={styles.label}>Lugar del tráfico</Text>
      <TextInput
        style={styles.input}
        placeholder="¿Dónde se presenta el tráfico?"
        value={lugar}
        onChangeText={setLugar}
        multiline
      />

      <Text style={styles.label}>Motivo</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe la causa del tráfico..."
        value={motivo}
        onChangeText={setMotivo}
        multiline
      />

      <Text style={styles.label}>Tiempo de demora (minutos)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ejemplo: 15"
        keyboardType="numeric"
        value={tiempo}
        onChangeText={setTiempo}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleNotificar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Notificar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EnviarReporteTrafico;
