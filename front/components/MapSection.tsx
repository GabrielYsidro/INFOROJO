import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import AppModal from "./Modals/AppModal";
import ModalBusInfo from "./Modals/ModalBusInfo";
import ParaderoMarker from './ParaderoMarker';
import BusMarker from './BusMarker';
import ModalParaderoInfo from './Modals/ModalParaderoInfo';
import mapaService, { Paradero, Corredor } from '@/services/mapaService';
import MapLayersControl from './MapLayersControl';
import * as Location from 'expo-location';
import { obtenerEstadoCapas, activarCapa, desactivarCapa } from '@/services/mapaCapasService';

const { height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.6;

export default function MapSection() {
  const [initialRegion, setInitialRegion] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [selectedParadero, setSelectedParadero] = useState<Paradero | null>(null);
  const [isParaderoModalVisible, setIsParaderoModalVisible] = useState(false);

  const [buses, setBuses] = useState<Corredor[]>([]);
  const [selectedBus, setSelectedBus] = useState<Corredor | null>(null);
  const [isBusModalVisible, setIsBusModalVisible] = useState(false);

  // Control de capas de visualización
  const [capasActivas, setCapasActivas] = useState({
    rutas: true,
    corredores: true,
    paraderos: true,
    alertas: true,
  });

  const [mostrarCapas, setMostrarCapas] = useState(false);

  // Cargar estado de capas desde el backend al iniciar
  useEffect(() => {
    const cargarEstadoCapas = async () => {
      try {
        const estado = await obtenerEstadoCapas();
        setCapasActivas(estado);
        console.log('✅ Estado de capas cargado desde backend:', estado);
      } catch (error) {
        console.error('Error al cargar estado de capas:', error);
      }
    };
    cargarEstadoCapas();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación denegado',
          'Esta aplicación necesita acceso a tu ubicación para funcionar correctamente.'
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  useEffect(() => {
    const fetchParaderos = async () => {
      try {
        const data = await mapaService.getParaderosOnly();
        setParaderos(data);
      } catch (error) {
        console.error("Error fetching paraderos:", error);
      }
    };
    fetchParaderos();
  }, []);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await mapaService.getCorredoresOnly();
        setBuses(data);
      } catch (error) {
        console.error("Error fetching buses:", error);
      }
    };

    fetchBuses();
    const interval = setInterval(fetchBuses, 10000); // 10 segundos en lugar de 5

    return () => clearInterval(interval);
  }, []);

  const handleParaderoPress = (paradero: Paradero) => {
    setSelectedParadero(paradero);
    setIsParaderoModalVisible(true);
  };

  const handleBusPress = (bus: Corredor) => {
    setSelectedBus(bus);
    setIsBusModalVisible(true);
  };

  const handleLayerToggle = async (layerId: string, activa: boolean) => {
    try {
      // Llamar al backend para activar/desactivar la capa
      if (activa) {
        const resultado = await activarCapa(layerId);
        if (resultado.status === 'success') {
          setCapasActivas((prev) => ({
            ...prev,
            [layerId]: activa,
          }));
          console.log(`✅ Capa ${layerId} activada en el backend`);
        } else {
          console.error(`❌ Error al activar capa ${layerId}:`, resultado.mensaje);
        }
      } else {
        const resultado = await desactivarCapa(layerId);
        if (resultado.status === 'success') {
          setCapasActivas((prev) => ({
            ...prev,
            [layerId]: activa,
          }));
          console.log(`✅ Capa ${layerId} desactivada en el backend`);
        } else {
          console.error(`❌ Error al desactivar capa ${layerId}:`, resultado.mensaje);
        }
      }
    } catch (error) {
      console.error(`Error al cambiar estado de capa ${layerId}:`, error);
    }
  };

  return (
    <View style={styles.mapContainer}>
      {Platform.OS !== "web" ? (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
          >
            {capasActivas.corredores && buses.map(bus => (
              <BusMarker
                key={bus.id_corredor!}
                coordinate={{
                  latitude: bus.ubicacion_lat!,
                  longitude: bus.ubicacion_lng!,
                }}
                onPress={() => handleBusPress(bus)}
              />
            ))}
            {capasActivas.paraderos && paraderos.map(paradero => (
              <ParaderoMarker
                key={paradero.id_paradero!}
                paradero={paradero as any}
                onPress={() => handleParaderoPress(paradero)}
              />
            ))}
          </MapView>

          {/* Botón flotante para abrir control de capas */}
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => setMostrarCapas(true)}
          >
            <Text style={styles.floatingButtonText}>⚙️</Text>
          </TouchableOpacity>

          {/* Modal con control de capas */}
          <Modal
            visible={mostrarCapas}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setMostrarCapas(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Capas del Mapa</Text>
                  <TouchableOpacity onPress={() => setMostrarCapas(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <MapLayersControl 
                  onLayerToggle={handleLayerToggle}
                  capasActivas={capasActivas}
                />
              </View>
            </View>
          </Modal>

          {selectedBus && (
            <AppModal visible={isBusModalVisible} onClose={() => setIsBusModalVisible(false)}>
              <ModalBusInfo bus_id={selectedBus.id_corredor!} onClose={() => setIsBusModalVisible(false)} />
            </AppModal>
          )}

          {selectedParadero && (
            <AppModal visible={isParaderoModalVisible} onClose={() => setIsParaderoModalVisible(false)}>
              <ModalParaderoInfo paradero={selectedParadero as any} onClose={() => setIsParaderoModalVisible(false)} />
            </AppModal>
          )}
        </>
      ) : (
        <View style={[styles.map, { justifyContent: "center", alignItems: "center" }]}>
          <Text>Mapa no disponible en web</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: MAP_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    flex: 1,
    borderColor: "#c62828",
  },
  map: {
    width: '100%',
    height: '100%',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c62828',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    padding: 8,
  },
});
