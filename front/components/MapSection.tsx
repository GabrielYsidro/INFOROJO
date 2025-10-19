// components/MapSection.tsx
import * as Location from 'expo-location';
import { useEffect, useState } from "react";
import { Alert, Dimensions, Image, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import AppModal from "./Modals/AppModal";
import ModalBusInfo from "./Modals/ModalBusInfo";

const { height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.6;

export default function MapSection() {
  const [open, setOpen] = useState(false);
  const [initialRegion, setInitialRegion] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

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


  return (
    <View style={styles.mapContainer}>
      {Platform.OS !== "web" ? (
        <>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: -12.0464,
            longitude: -77.0428,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
           >
                {/* Marker es para elementos en el mapa*/}
          <Marker 
        coordinate={{
          latitude: -12.0464,
          longitude: -77.0428,
        }}
        onPress={() => {
          console.log('Marker pressed');
          setOpen(true);
        }}
        anchor={{ x: 0.5, y: 0.5 }} // Centers the marker
        centerOffset={{ x: 0, y: 0 }} // Adjust if needed
      >
          {/*<View style={styles.button}>
          <Text style={styles.buttonText}>🚌</Text>
        </View>*/}
        <View style={[ { justifyContent: "center", alignItems: "center" }]}>
        <Image
          source={require("../assets/images/bus.png")}
          style={{ width: 45, height: 45, resizeMode: "contain" }}
        />
      </View>

      </Marker>
          </MapView>
          {/* Si quieren colocar un elemento fijado lo ponen acá abajo */}
          <AppModal visible={open} onClose={() => setOpen(false)}>
                    <ModalBusInfo bus_id={1} onClose={() => setOpen(false)} />
                  </AppModal>
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
