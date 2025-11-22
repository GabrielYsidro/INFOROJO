import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserShareLocation } from './useUserShareLocation';

/**
 * Pantalla del usuario para compartir su ubicación en foreground.
 * - No realiza llamadas reales a backend (solo logs). 
 * - Lista para ser conectada luego.
 */
export default function CompartirMiUbicacion() {
  const [userId, setUserId] = useState<number | null>(null);
  const { isSharing, shareCode, location, start, stop } = useUserShareLocation(userId);

  useEffect(() => {
    (async () => {
      try {
        const idStr = await AsyncStorage.getItem('userId');
        if (idStr) setUserId(parseInt(idStr, 10));
        else setUserId(123); // fallback para pruebas locales
      } catch {
        setUserId(123);
      }
    })();
  }, []);

  const handleShare = async () => {
    const msg = shareCode
      ? `Mi código para ver mi ubicación: ${shareCode}`
      : 'Activa primero el compartir para generar un código.';
    try {
      await Share.share({ message: msg });
    } catch {
      // noop
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compartir mi ubicación</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Usuario ID:</Text>
        <Text style={styles.infoValue}>{userId ?? '—'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isSharing && styles.buttonStop]}
        onPress={isSharing ? stop : start}
      >
        <Text style={styles.buttonText}>{isSharing ? 'Detener' : 'Iniciar'} compartir</Text>
      </TouchableOpacity>

      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Código para contacto:</Text>
        <Text style={styles.codeValue}>{shareCode ?? '—'}</Text>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={!shareCode}>
          <Text style={styles.shareBtnText}>Compartir código</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          region={
            location
              ? {
                  latitude: location.lat,
                  longitude: location.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : {
                  latitude: -12.0464,
                  longitude: -77.0428,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }
          }
        >
          {location && (
            <Marker
              coordinate={{ latitude: location.lat, longitude: location.lng }}
              title="Yo"
              description="Mi ubicación (foreground)"
            />
          )}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { color: '#666', marginRight: 6 },
  infoValue: { fontWeight: '600' },
  button: { backgroundColor: '#1976d2', padding: 14, borderRadius: 10, marginVertical: 8 },
  buttonStop: { backgroundColor: '#b71c1c' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  codeBox: { padding: 12, borderRadius: 8, backgroundColor: '#f5f5f5', marginVertical: 8 },
  codeLabel: { color: '#555' },
  codeValue: { fontSize: 18, fontWeight: '700', letterSpacing: 1, marginVertical: 4 },
  shareBtn: { marginTop: 8, backgroundColor: '#2e7d32', padding: 10, borderRadius: 6 },
  shareBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  mapWrapper: { flex: 1, borderRadius: 12, overflow: 'hidden', marginTop: 8 },
});
