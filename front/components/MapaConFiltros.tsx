import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AppModal from './Modals/AppModal';
import ModalFiltros from './Modals/ModalFiltros';
import { aplicarFiltros, FiltrosData, RutaFiltrada } from '@/services/filtrosService';

export default function MapaConFiltros() {
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosData>({
    ruta: '',
    distrito: '',
    distancia: ''
  });
  const [rutasFiltradas, setRutasFiltradas] = useState<RutaFiltrada[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAplicarFiltros = async () => {
    setLoading(true);
    try {
      const resultado = await aplicarFiltros(filtros);
      setRutasFiltradas(resultado);
      
      // Aquí puedes actualizar el mapa con las rutas filtradas
      console.log('Rutas filtradas:', resultado);
      
      Alert.alert(
        'Filtros Aplicados', 
        `Se encontraron ${resultado.length} rutas que coinciden con los criterios.`
      );
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      Alert.alert('Error', 'No se pudieron aplicar los filtros. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosData) => {
    setFiltros(nuevosFiltros);
  };

  return (
    <View style={styles.container}>
      {/* Tu componente de mapa aquí */}
      <Text style={styles.title}>Mapa de Rutas</Text>
      
      {/* Botón para abrir filtros */}
      <TouchableOpacity 
        style={styles.filtrosButton}
        onPress={() => setShowFiltros(true)}
      >
        <Text style={styles.filtrosButtonText}>Filtrar</Text>
      </TouchableOpacity>

      {/* Mostrar rutas filtradas */}
      {rutasFiltradas.length > 0 && (
        <View style={styles.resultadosContainer}>
          <Text style={styles.resultadosTitle}>Rutas encontradas:</Text>
          {rutasFiltradas.map((ruta) => (
            <Text key={ruta.id_ruta} style={styles.rutaItem}>
              • {ruta.nombre}
            </Text>
          ))}
        </View>
      )}

      {/* Modal de filtros */}
      <AppModal 
        visible={showFiltros} 
        onClose={() => setShowFiltros(false)}
      >
        <ModalFiltros
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          onAplicar={handleAplicarFiltros}
          onClose={() => setShowFiltros(false)}
        />
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filtrosButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  filtrosButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultadosContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  resultadosTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  rutaItem: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
});

