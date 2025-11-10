import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AppModal from '@/components/Modals/AppModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './StylesReporteDesvio';
import SelectModal from './SelectModal'; // Importamos el nuevo modal genérico
import { obtenerRutasDisponibles, RutaFiltrada } from '@/services/filtrosService';
import paraderoService, { Paradero } from '@/services/paraderoService';

// Definimos una interfaz para los datos que el componente enviará
export interface DesvioData {
  rutaId: number;
  paraderoAfectadoId: number;
  paraderoAlternaId?: number;
  motivo: string;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: DesvioData) => void;
};

export default function EnviarReporteDesvio({ visible, onClose, onSubmit }: Props) {
  // Estados para los datos del formulario (ahora guardan el objeto completo)
  const [selectedRuta, setSelectedRuta] = useState<RutaFiltrada | null>(null);
  const [selectedDesde, setSelectedDesde] = useState<Paradero | null>(null);
  const [selectedHasta, setSelectedHasta] = useState<Paradero | null>(null);
  const [motivo, setMotivo] = useState('');

  // Estados para controlar los modales de selección
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'desde' | 'hasta' | 'ruta' | null>(null);

  // Estados para las listas de datos y la carga
  const [rutas, setRutas] = useState<RutaFiltrada[]>([]);
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [loading, setLoading] = useState(true);

  // Efecto para cargar datos del backend cuando el modal se hace visible
  useEffect(() => {
    if (visible) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [rutasData, paraderosData] = await Promise.all([
            obtenerRutasDisponibles(),
            paraderoService.getAllParaderos(),
          ]);
          setRutas(rutasData);
          setParaderos(paraderosData);
        } catch (error) {
          Alert.alert("Error", "No se pudieron cargar los datos para el reporte.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [visible]);

  // Limpia el formulario al cerrar
  const handleClose = () => {
    setSelectedRuta(null);
    setSelectedDesde(null);
    setSelectedHasta(null);
    setMotivo('');
    onClose();
  };

  // Valida y envía los datos
  const handleSend = () => {
    if (!selectedRuta || !selectedDesde) {
      Alert.alert("Campos requeridos", "Debe seleccionar una ruta y un paradero de origen.");
      return;
    }
    onSubmit({
      rutaId: selectedRuta.id_ruta,
      paraderoAfectadoId: selectedDesde.id_paradero,
      paraderoAlternaId: selectedHasta?.id_paradero,
      motivo,
    });
    handleClose(); // Cierra y limpia el formulario
  };

  const openPicker = (target: 'desde' | 'hasta' | 'ruta') => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setPickerTarget(null);
  };

  // Renderiza el modal de selección correcto según el target
  const renderPickerModal = () => {
    if (!pickerOpen) return null;

    if (pickerTarget === 'ruta') {
      return (
        <SelectModal
          visible={true}
          title="Seleccionar Ruta"
          items={rutas.map(r => ({ ...r, id: r.id_ruta }))}
          displayKey="nombre"
          onClose={closePicker}
          onSelect={(item) => {
            setSelectedRuta(item as RutaFiltrada);
            closePicker();
          }}
        />
      );
    }

    if (pickerTarget === 'desde' || pickerTarget === 'hasta') {
      return (
        <SelectModal
          visible={true}
          title={pickerTarget === 'desde' ? 'Paradero Afectado' : 'Paradero Alternativo'}
          items={paraderos.map(p => ({ ...p, id: p.id_paradero }))}
          displayKey="nombre"
          onClose={closePicker}
          onSelect={(item) => {
            if (pickerTarget === 'desde') setSelectedDesde(item as Paradero);
            if (pickerTarget === 'hasta') setSelectedHasta(item as Paradero);
            closePicker();
          }}
        />
      );
    }

    return null;
  };

  return (
    <AppModal visible={visible} onClose={handleClose}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>
            Alertar desvío
          </ThemedText>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#c62828" />
        ) : (
          <>
            <View style={styles.fieldRow}>
              <ThemedText type="defaultSemiBold">Ruta</ThemedText>
              <TouchableOpacity style={styles.picker} activeOpacity={0.8} onPress={() => openPicker('ruta')}>
                <ThemedText>{selectedRuta?.nombre || 'Seleccionar ruta'}</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldRow}>
              <ThemedText type="defaultSemiBold">Paradero Afectado (Desde)</ThemedText>
              <TouchableOpacity style={styles.picker} activeOpacity={0.8} onPress={() => openPicker('desde')}>
                <ThemedText>{selectedDesde?.nombre || 'Seleccionar paradero'}</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldRow}>
              <ThemedText type="defaultSemiBold">Paradero Alternativo (Hasta)</ThemedText>
              <TouchableOpacity style={styles.picker} activeOpacity={0.8} onPress={() => openPicker('hasta')}>
                <ThemedText>{selectedHasta?.nombre || 'Opcional'}</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldRow}>
              <ThemedText type="defaultSemiBold">Motivo</ThemedText>
              <TextInput
                placeholder="Razón del desvío..."
                placeholderTextColor="#9CA3AF"
                value={motivo}
                onChangeText={setMotivo}
                multiline
                style={styles.textarea}
              />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={handleClose}>
                <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSend]} onPress={handleSend}>
                <ThemedText style={[styles.buttonText, { color: '#fff' }]}>Enviar</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ThemedView>

      {/* El modal de selección se renderiza aquí */}
      {renderPickerModal()}
    </AppModal>
  );
}