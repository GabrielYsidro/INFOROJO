import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import { obtenerRutasDisponibles, RutaFiltrada } from '@/services/filtrosService';

type FiltrosData = {
  ruta: string;
  distrito: string;
  distancia: string;
};

type Props = {
  filtros: FiltrosData;
  onFiltrosChange: (filtros: FiltrosData) => void;
  onAplicar: () => void;
  onClose: () => void;
};

export default function ModalFiltros({
  filtros,
  onFiltrosChange,
  onAplicar,
  onClose,
}: Props) {
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosData>(filtros);
  const [rutasDisponibles, setRutasDisponibles] = useState<RutaFiltrada[]>([]);
  const [showRutaSelector, setShowRutaSelector] = useState(false);
  const [loadingRutas, setLoadingRutas] = useState(false);

  // Cargar rutas disponibles cuando se abre el modal
  useEffect(() => {
    cargarRutas();
  }, []);

  const cargarRutas = async () => {
    setLoadingRutas(true);
    try {
      const rutas = await obtenerRutasDisponibles();
      setRutasDisponibles(rutas);
      console.log('Rutas cargadas desde la base de datos:', rutas);
    } catch (error) {
      console.error('Error al cargar rutas:', error);
      Alert.alert('Error', 'No se pudieron cargar las rutas desde la base de datos');
    } finally {
      setLoadingRutas(false);
    }
  };

  const handleInputChange = (campo: keyof FiltrosData, valor: string) => {
    const nuevosFiltros = { ...filtrosLocales, [campo]: valor };
    setFiltrosLocales(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
  };

  const seleccionarRuta = (nombreRuta: string) => {
    handleInputChange('ruta', nombreRuta);
    setShowRutaSelector(false);
  };

  const handleAplicar = () => {
    onAplicar();
    onClose();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filtrar</Text>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={20} />
        </Pressable>
      </View>

      {/* Campo Ruta - Selector Desplegable */}
      <View style={styles.filterRow}>
        <Text style={styles.label}>Ruta</Text>
        <Pressable 
          style={styles.inputContainer}
          onPress={() => setShowRutaSelector(!showRutaSelector)}
          disabled={loadingRutas}
        >
          <Text style={[
            styles.input,
            !filtrosLocales.ruta && styles.placeholder
          ]}>
            {loadingRutas ? 'Cargando...' : filtrosLocales.ruta || 'Seleccionar ruta'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Lista desplegable de rutas */}
      {showRutaSelector && (
        <View style={styles.selectorContainer}>
          {rutasDisponibles.map((ruta) => (
            <Pressable
              key={ruta.id_ruta}
              style={styles.selectorItem}
              onPress={() => seleccionarRuta(ruta.nombre)}
            >
              <Text style={styles.selectorItemText}>{ruta.nombre}</Text>
            </Pressable>
          ))}
          {rutasDisponibles.length === 0 && !loadingRutas && (
            <Text style={styles.noDataText}>No hay rutas disponibles</Text>
          )}
        </View>
      )}

      <View style={styles.divider} />

      {/* Campo Distrito */}
      <View style={styles.filterRow}>
        <Text style={styles.label}>Distrito</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={filtrosLocales.distrito}
            onChangeText={(text) => handleInputChange('distrito', text)}
            placeholder="Jesús María"
            placeholderTextColor="#9CA3AF"
          />
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Campo Distancia */}
      <View style={styles.filterRow}>
        <Text style={styles.label}>Distancia (km)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={filtrosLocales.distancia}
            onChangeText={(text) => handleInputChange('distancia', text)}
            placeholder="28"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={handleAplicar} style={styles.filtrarBtn}>
          <Text style={styles.filtrarText}>Filtrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    maxWidth: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 999,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  label: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 80,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  footer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  filtrarBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  filtrarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  selectorContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    maxHeight: 200,
  },
  selectorItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectorItemText: {
    fontSize: 16,
    color: '#374151',
  },
  noDataText: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
