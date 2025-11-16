/**
 * 🗺️ MapLayersControl.tsx - Control de capas de visualización del mapa
 * Permite activar/desactivar markers de rutas, corredores, paraderos y alertas
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';

interface Layer {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  activa: boolean;
}

interface MapLayersControlProps {
  onLayerToggle: (layerId: string, activa: boolean) => void;
  capasActivas?: {
    rutas: boolean;
    corredores: boolean;
    paraderos: boolean;
    alertas: boolean;
  };
}

export default function MapLayersControl({ onLayerToggle, capasActivas }: MapLayersControlProps) {
  const [capas, setCapas] = useState<Layer[]>([
    {
      id: 'rutas',
      nombre: '🛣️ Rutas',
      descripcion: 'Líneas de transporte',
      color: '#1976D2',
      activa: capasActivas?.rutas ?? true,
    },
    {
      id: 'corredores',
      nombre: '🚌 Buses',
      descripcion: 'Buses activos en tiempo real',
      color: '#D32F2F',
      activa: capasActivas?.corredores ?? true,
    },
    {
      id: 'paraderos',
      nombre: '⏸️ Paraderos',
      descripcion: 'Paradas de buses',
      color: '#388E3C',
      activa: capasActivas?.paraderos ?? true,
    },
    {
      id: 'alertas',
      nombre: '⚠️ Alertas',
      descripcion: 'Congestión y avisos',
      color: '#F57C00',
      activa: capasActivas?.alertas ?? true,
    },
  ]);

  // Sincronizar estado cuando capasActivas cambia desde el padre
  useEffect(() => {
    if (capasActivas) {
      setCapas(prevCapas => 
        prevCapas.map(capa => ({
          ...capa,
          activa: capasActivas[capa.id as keyof typeof capasActivas] ?? capa.activa
        }))
      );
    }
  }, [capasActivas]);

  const handleToggle = (layerId: string) => {
    const updatedCapas = capas.map((capa) =>
      capa.id === layerId ? { ...capa, activa: !capa.activa } : capa
    );
    setCapas(updatedCapas);
    
    const capaTouched = updatedCapas.find((c) => c.id === layerId);
    if (capaTouched) {
      onLayerToggle(layerId, capaTouched.activa);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🎨 Capas del Mapa</Text>
      
      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          Activa o desactiva las capas para personalizar tu vista del mapa
        </Text>
      </View>

      {capas.map((capa) => (
        <View key={capa.id} style={styles.layerContainer}>
          <View style={styles.layerInfo}>
            <View style={[styles.colorDot, { backgroundColor: capa.color }]} />
            <View style={styles.textContainer}>
              <Text style={styles.layerName}>{capa.nombre}</Text>
              <Text style={styles.layerDescription}>{capa.descripcion}</Text>
            </View>
          </View>

          <Switch
            value={capa.activa}
            onValueChange={() => handleToggle(capa.id)}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={capa.activa ? capa.color : '#f4f3f4'}
            style={styles.switch}
          />
        </View>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Información</Text>
        <Text style={styles.infoText}>
          • Desactiva capas para mejor rendimiento{'\n'}
          • Los buses se actualizan cada 10 segundos{'\n'}
          • Los paraderos se cargan al iniciar
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1565c0',
    fontStyle: 'italic',
  },
  layerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  layerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  layerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  layerDescription: {
    fontSize: 12,
    color: '#999',
  },
  switch: {
    marginLeft: 12,
  },
  infoBox: {
    backgroundColor: '#fff9c4',
    borderLeftWidth: 4,
    borderLeftColor: '#fbc02d',
    padding: 12,
    marginTop: 16,
    borderRadius: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f57f17',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#f57f17',
    lineHeight: 18,
  },
});
