/**
 * 🗺️ Pestaña de Configuración del Mapa
 * Permite controlar qué capas mostrar en el mapa
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapLayersControl from '@/components/MapLayersControl';

interface MapaConfiguracionProps {
  onLayerToggle?: (layerId: string, activa: boolean) => void;
}

export default function MapaConfiguracion({ onLayerToggle }: MapaConfiguracionProps) {
  const handleLayerToggle = (layerId: string, activa: boolean) => {
    console.log(`Configuración del mapa: ${layerId} ${activa ? 'activada' : 'desactivada'}`);
    onLayerToggle?.(layerId, activa);
  };

  return (
    <View style={styles.container}>
      <MapLayersControl onLayerToggle={handleLayerToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
