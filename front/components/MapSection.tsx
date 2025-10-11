// components/MapSection.tsx
import { useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import AppModal from "./Modals/AppModal";
import ModalBusInfo from "./Modals/ModalBusInfo";

const { height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.6;

export default function MapSection() {
  const [open, setOpen] = useState(false);
  const buttonCoordinate = {
    latitude: -12.0464,
    longitude: -77.0428,
  };
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
  coordinate={buttonCoordinate}
  onPress={() => {
    console.log('Marker pressed');
    setOpen(true);
  }}
   tracksViewChanges={false} // Improves performance
  anchor={{ x: 0.5, y: 0.5 }} // Centers the marker
  centerOffset={{ x: 0, y: 0 }} // Adjust if needed
>
  <View style={styles.button}>
    <Text style={styles.buttonText}>🚌</Text>
  </View>
</Marker>
          </MapView>
          {/* Si quieren colocar un elemento fijado lo ponen acá abajo */}
          <AppModal visible={open} onClose={() => setOpen(false)}>
                    <ModalBusInfo onClose={() => setOpen(false)} />
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
    borderColor: "#c62828",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
