
import { enviarCalificacion } from '@/services/calificacionService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './StylesParaderoDetalle';

const ParaderoDetalle = () => {
  const router = useRouter();
  const { 
    paradero_sube, 
    paradero_baja, 
    fecha, 
    fecha_subida, 
    fecha_bajada, 
    tiempo_recorrido_minutos, 
    imagen,
    id_historial
  } = useLocalSearchParams();

  // Estados para el modal de calificación
  const [modalVisible, setModalVisible] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  const goParaderoComments = (paradero_id:string) => {
    router.push({
      pathname: '/(cliente)/Paradero/ParaderoComentarios',
      params: {
        paradero_nombre: paradero_id
      }
    });
  }

  // Función para renderizar estrellas
  const renderEstrellas = () => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <TouchableOpacity
          key={i}
          onPress={() => setCalificacion(i)}
          style={modalStyles.estrella}
        >
          <Icon
            name={i <= calificacion ? 'star' : 'star-outline'}
            size={40}
            color={i <= calificacion ? '#FFD700' : '#CCCCCC'}
          />
        </TouchableOpacity>
      );
    }
    return estrellas;
  };

  // Función para enviar calificación
  const enviarCalificacionAction = async () => {
    if (calificacion === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    if (!id_historial) {
      Alert.alert('Error', 'No se puede identificar el viaje para calificar');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        id_historial: parseInt(String(id_historial)),
        calificacion: calificacion,
        descripcion: descripcion.trim() || undefined
      };

      await enviarCalificacion(payload);
      
      Alert.alert(
        'Éxito',
        'Tu calificación ha sido enviada correctamente',
        [{
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            setCalificacion(0);
            setDescripcion('');
          }
        }]
      );
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      Alert.alert('Error', 'No se pudo enviar la calificación. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const abrirModalCalificacion = () => {
    setModalVisible(true);
  };

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
        {/* Botón Subida */}
  <View style={detalleStyles.infoColStyled}>
    <Text style={detalleStyles.labelStyled}>Subida</Text>
    <TouchableOpacity
      onPress={()=> {goParaderoComments(paradero_sube as string)}}
      style={styles.buttonStyled}
    >
      <Text style={styles.valueStyled}>
        {paradero_sube || 'Sin dato'}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Botón Llegada */}
  <View style={detalleStyles.infoColStyled}>
    <Text style={detalleStyles.labelStyled}>Llegada</Text>
    <TouchableOpacity
      onPress={()=> {goParaderoComments(paradero_baja as string)}}
      style={styles.buttonStyled}
    >
      <Text style={styles.valueStyled}>
        {paradero_baja || 'Sin dato'}
      </Text>
    </TouchableOpacity>
  </View>
      </View>
      {/* Botón Calificar */}
      <View style={detalleStyles.bottomButtonContainer}>
        <TouchableOpacity 
          style={detalleStyles.btnCalificarStyled}
          onPress={abrirModalCalificacion}
        >
          <Text style={detalleStyles.btnTextStyled}>Calificar Paradero</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Calificación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>Calificar Viaje</Text>
            <Text style={modalStyles.subtitle}>¿Cómo fue tu experiencia?</Text>
            
            {/* Estrellas */}
            <View style={modalStyles.estrellasContainer}>
              {renderEstrellas()}
            </View>
            
            {/* Campo de descripción */}
            <TextInput
              style={modalStyles.textInput}
              placeholder="Cuéntanos sobre tu experiencia (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline={true}
              numberOfLines={3}
              maxLength={200}
            />
            
            {/* Contador de caracteres */}
            <Text style={modalStyles.charCounter}>{descripcion.length}/200</Text>
            
            {/* Botones */}
            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={enviando}
              >
                <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.submitButton, calificacion === 0 && modalStyles.disabledButton]}
                onPress={enviarCalificacionAction}
                disabled={enviando || calificacion === 0}
              >
                <Text style={modalStyles.submitButtonText}>
                  {enviando ? 'Enviando...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  infoContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  infoRowStyled: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
    marginBottom: 16,
  },
  infoColStyled: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  labelStyled: {
    fontSize: 15,
    color: '#888',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  valueStyled: {
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
    fontWeight: '600',
  },
  timeStyled: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  tiempoRecorridoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tiempoRecorridoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 4,
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

// Estilos para el modal de calificación
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  estrellasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '80%',
  },
  estrella: {
    padding: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 5,
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF5252',
    marginLeft: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ParaderoDetalle;
