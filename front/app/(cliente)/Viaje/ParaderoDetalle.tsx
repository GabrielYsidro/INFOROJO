
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styles from './StylesParaderoDetalle';

const ParaderoDetalle = () => {
  const router = useRouter();
  const { paradero, fecha, subida, llegada, imagen } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={detalleStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={detalleStyles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={detalleStyles.headerTitle}>Viaje</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Imagen omitida por requerimiento */}
      {/* Info principal */}
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Text style={detalleStyles.paradero}>{paradero}</Text>
        <Text style={detalleStyles.fecha}>{formatearFecha(String(fecha))}</Text>
      </View>
      {/* Subida/Llegada */}
      <View style={detalleStyles.infoRow}>
        <View style={detalleStyles.infoCol}>
          <Text style={detalleStyles.label}>Subida</Text>
          <Text style={detalleStyles.value}>{subida}</Text>
        </View>
        <View style={detalleStyles.infoCol}>
          <Text style={detalleStyles.label}>Llegada</Text>
          <Text style={detalleStyles.value}>{llegada}</Text>
        </View>
      </View>
      {/* Botón Calificar */}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <TouchableOpacity style={detalleStyles.btnCalificar}>
          <Text style={detalleStyles.btnText}>Calificar Paradero</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatearFecha(fecha: string) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const d = new Date(fecha);
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  return `${dia} de ${mes}`;
}

const detalleStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5252',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backArrow: {
    fontSize: 28,
    color: '#fff',
    width: 32,
    textAlign: 'left',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  image: {
    width: 320,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  paradero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
  },
  fecha: {
    fontSize: 18,
    color: '#888',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  btnCalificar: {
    backgroundColor: '#FF5252',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ParaderoDetalle;
