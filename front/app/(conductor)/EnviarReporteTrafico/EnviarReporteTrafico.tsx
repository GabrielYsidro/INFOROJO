import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import styles from "./StylesReporteTrafico";

const EnviarReporteTrafico: React.FC = () => {
  const [motivo, setMotivo] = useState("");
  const [lugar, setLugar] = useState("");

  const handleNotificar = () => {
    console.log("Reporte de tráfico enviado:", motivo);
    console.log("Lugar del tráfico:", lugar);
    // Aquí podrías enviar el reporte a tu API
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportar tráfico</Text>

      <Text style={styles.label}>Reporte de trafico</Text>
      <TextInput
        style={styles.input}
        placeholder="En donde se presenta el trafico..."
        value={lugar}
        onChangeText={setLugar}
        multiline
      />

      <Text style={styles.label}>Motivo</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe la razón..."
        value={motivo}
        onChangeText={setMotivo}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleNotificar}>
        <Text style={styles.buttonText}>Notificar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EnviarReporteTrafico;
