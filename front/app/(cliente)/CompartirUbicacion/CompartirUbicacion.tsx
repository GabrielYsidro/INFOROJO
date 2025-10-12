import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { styles } from './StylesCompartirUbicacion';

const CompartirUbicacion: React.FC = () => {
  const [region, setRegion] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [marker, setMarker] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
  });

  const handleShareLocation = () => {
    Alert.alert(
      'Ubicación compartida',
      `Tu ubicación actual es:\nLat: ${marker.latitude.toFixed(5)}, Lon: ${marker.longitude.toFixed(5)}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compartir ubicación</Text>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          onPress={(e) => setMarker(e.nativeEvent.coordinate)}
        >
          <Marker coordinate={marker} title="Tu ubicación" />
        </MapView>
      </View>

      {/* Share Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareLocation}>
          <Text style={styles.shareButtonText}>Compartir mi ubicación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CompartirUbicacion;
