import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import styles from './StylesReporteFalla';

export default function ReporteFalla({ navigation }: any) {
  const [motivo, setMotivo] = useState('');
  const [paradero, setParadero] = useState('auto'); 

  // Color dinámico para el Picker
  const pickerTextColor = paradero === 'auto' ? '#A0A0A0' : '#222';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack && navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Reportar falla</Text>
      </View>
      <View style={styles.headerDivider} />
      <View style={styles.section}>
        <Text style={styles.label}>Paradero más cercano</Text>
        <View style={[styles.pickerContainer]}>
          <Picker
            selectedValue={paradero}
            onValueChange={setParadero}
            style={[styles.picker, { color: pickerTextColor }]}  // Cambia el color dinámicamente
            dropdownIconColor="#A0A0A0"
          >
            <Picker.Item label="Calcular automáticamente" value="auto" color="#A0A0A0" />
            {/* Otras opciones que quieras agregar */}
          </Picker>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.section}>
        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={styles.input}
          placeholder="Razón..."
          value={motivo}
          onChangeText={setMotivo}
          multiline
          placeholderTextColor="#A0A0A0"
        />
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Notificar</Text>
      </TouchableOpacity>
    </View>
  );
}
