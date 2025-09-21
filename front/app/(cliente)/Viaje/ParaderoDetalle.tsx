import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styles from './StylesParaderoDetalle';

const ParaderoDetalle = () => {
  const [eta, setEta] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulamos un tiempo estimado de llegada (puedes reemplazar con una lógica simple)
  useEffect(() => {
    setTimeout(() => {
      setEta("15 min");
      setLoading(false);
    }, 2000); // Simula que el cálculo del ETA tarda 2 segundos
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF0000" />
      ) : (
        <Text style={styles.text}>Tiempo estimado de llegada: {eta}</Text>
      )}
    </View>
  );
};

export default ParaderoDetalle;
