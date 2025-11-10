import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppModal from "@/components/Modals/AppModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { styles } from "./StylesReporteTrafico";
import { enviarReporteTrafico } from "@/services/reporteTraficoService";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const EnviarReporteTrafico: React.FC<Props> = ({ visible, onClose }) => {
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

      await enviarReporteTrafico(
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
      onClose();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "No se pudo enviar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>
            Reportar tráfico
          </ThemedText>
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Lugar</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="¿Dónde se presenta el tráfico?"
            placeholderTextColor="#9CA3AF"
            value={lugar}
            onChangeText={setLugar}
          />
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Motivo</ThemedText>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Causa del tráfico..."
            placeholderTextColor="#9CA3AF"
            value={motivo}
            onChangeText={setMotivo}
            multiline
          />
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Tiempo estimado (minutos)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ej. 15"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={tiempo}
            onChangeText={setTiempo}
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={onClose}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSend]}
            onPress={handleNotificar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={[styles.buttonText, { color: "#fff" }]}>Enviar</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </AppModal>
  );
};

export default EnviarReporteTrafico;
