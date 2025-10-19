
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styles from './StylesParaderoDetalle';

const ParaderoDetalle = () => {
  const router = useRouter();
  const { paradero_sube, paradero_baja, fecha, imagen } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Imagen */}
      <View style={detalleStyles.imageContainer}>
        <Image
          source={imagen ? { uri: String(imagen) } : require('@/assets/images/adaptive-icon.png')}
          style={detalleStyles.image}
        />
      </View>
      {/* Título y fecha */}
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Text style={detalleStyles.paradero}>{paradero_sube || 'Paradero'}</Text>
        <Text style={detalleStyles.fecha}>{formatearFecha(String(fecha))}</Text>
      </View>
      {/* Subida/Llegada */}
      <View style={detalleStyles.infoRowStyled}>
        <View style={detalleStyles.infoColStyled}>
          <Text style={detalleStyles.labelStyled}>Subida</Text>
          <Text style={detalleStyles.valueStyled}>{paradero_sube || 'Sin dato'}</Text>
        </View>
        <View style={detalleStyles.infoColStyled}>
          <Text style={detalleStyles.labelStyled}>Llegada</Text>
          <Text style={detalleStyles.valueStyled}>{paradero_baja || 'Sin dato'}</Text>
        </View>
      </View>
      {/* Botón Calificar */}
      <View style={detalleStyles.bottomButtonContainer}>
        <TouchableOpacity style={detalleStyles.btnCalificarStyled}>
          <Text style={detalleStyles.btnTextStyled}>Calificar Paradero</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatearFecha(fecha: string) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  return `${dia} de ${mes}`;
}

const detalleStyles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  image: {
    width: 320,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  paradero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    textAlign: 'left',
    width: '90%',
  },
  fecha: {
    fontSize: 18,
    color: '#888',
    marginTop: 2,
    textAlign: 'left',
    width: '90%',
  },
  infoRowStyled: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  infoColStyled: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  labelStyled: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  valueStyled: {
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#fff',
  },
  btnCalificarStyled: {
    backgroundColor: '#FF5252',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignSelf: 'center',
    width: '100%',
  },
  btnTextStyled: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ParaderoDetalle;
