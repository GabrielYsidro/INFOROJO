// components/MapSection.tsx
import React from "react";
import { View, Text, Platform, StyleSheet, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const { height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.6;

export default function MapSection() {
  return (
    <View style={styles.mapContainer}>
      {Platform.OS !== "web" ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: -12.0464,
            longitude: -77.0428,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
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
});
