import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';  
import styles from '../../(conductor)/ReporteFalla/StylesReporteFalla';
import RFallaModal from './RFallaModal';

export default function ReporteFalla({ navigation }: any) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Reportar falla</Text>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.section}>
        <Text style={styles.label}>Describe la falla al abrir el modal</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setModalOpen(true)}>
        <Text style={styles.buttonText}>Notificar</Text>
      </TouchableOpacity>

      <RFallaModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={({ paradero: p, tipoFalla, requiereIntervencion, unidadAfectada, motivo: m }) => {
          // por ahora solo loguear; en el futuro podríamos mostrar un toast o navegar
          console.log('Reporte falla enviado', { paradero: p, tipoFalla, requiereIntervencion, unidadAfectada, motivo: m });
          setModalOpen(false);
        }}
      />
    </View>
  );
}
