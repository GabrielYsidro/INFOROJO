import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type Coords = { lat: number; lng: number };

/**
 * Hook para gestionar el estado de compartir ubicación (foreground).
 * - No hace llamadas a backend; solo logs (mock) para futura integración.
 */
export function useUserShareLocation(userId: number | null) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [location, setLocation] = useState<Coords | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const start = async () => {
    if (!userId) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return;
    }

    setIsSharing(true);
    if (!shareCode) {
      setShareCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }

    // Lectura inicial (opcional) para centrar el mapa
    try {
      const current = await Location.getCurrentPositionAsync({});
      setLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
    } catch (e) {
      console.log('[mock] no se pudo obtener ubicación inicial', e);
    }

    // Suscripción a cambios (cada ~5s)
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 0 },
      async (pos) => {
        if (!pos?.coords) return;
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        // Mock: aquí se conectará el PUT al backend en el futuro
        console.log('[mock] updateUserLocation', { userId, ...coords, at: new Date().toISOString() });
      }
    );
  };

  const stop = () => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setIsSharing(false);
  };

  useEffect(() => {
    return () => {
      if (watchRef.current) watchRef.current.remove();
    };
  }, []);

  return { isSharing, shareCode, location, start, stop };
}
