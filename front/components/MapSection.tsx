// components/MapSection.tsx
import * as Location from 'expo-location';
import { useEffect, useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import AppModal from "./Modals/AppModal";
import ModalBusInfo from "./Modals/ModalBusInfo";
import ParaderoMarker from './ParaderoMarker';
import BusMarker from './BusMarker';
import ModalParaderoInfo from './Modals/ModalParaderoInfo';
import paraderoService, { Paradero } from '@/services/paraderoService';
import corredorService from '@/services/corredorService';

const { height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.6;

interface Corredor {
  id_corredor: number;
  ubicacion_lat: number;
  ubicacion_lng: number;
  estado: string;
}

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
        const data = await paraderoService.getAllParaderos();
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
        const data = await corredorService.getAllBuses();
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

  return (
    <View style={styles.mapContainer}>
      {Platform.OS !== "web" ? (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
          >
            {buses.map(bus => (
              <BusMarker
                key={bus.id_corredor}
                coordinate={{
                  latitude: bus.ubicacion_lat,
                  longitude: bus.ubicacion_lng,
                }}
                onPress={() => handleBusPress(bus)}
              />
            ))}
            {paraderos.map(paradero => (
              <ParaderoMarker
                key={paradero.id_paradero}
                paradero={paradero}
                onPress={() => handleParaderoPress(paradero)}
              />
            ))}
          </MapView>

          {selectedBus && (
            <AppModal visible={isBusModalVisible} onClose={() => setIsBusModalVisible(false)}>
              <ModalBusInfo bus_id={selectedBus.id_corredor} onClose={() => setIsBusModalVisible(false)} />
            </AppModal>
          )}

          {selectedParadero && (
            <AppModal visible={isParaderoModalVisible} onClose={() => setIsParaderoModalVisible(false)}>
              <ModalParaderoInfo paradero={selectedParadero} onClose={() => setIsParaderoModalVisible(false)} />
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
    //backgroundColor: '#ff4646ff',
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
});
