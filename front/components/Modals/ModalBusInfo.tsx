import { getBusInfo } from '@/services/corredorService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  bus_id: number;
  onClose?: () => void;
};

export default function ModalBusInfo({
  bus_id=1,
  onClose,
}: Props) {
  const [busData, setBusData] = useState<{
    nombre_paradero: string;
    numero_pasajeros: number;
    capacidad_max: number;
  }>({
    nombre_paradero: 'Paradero Central',
    numero_pasajeros: 8,
    capacidad_max: 20,
  });

  useEffect(() => {
    const fetchBusInfo = async () => {
      try {
        const data = await getBusInfo(bus_id);
        if (data) {
          setBusData({
            nombre_paradero: data.nombre_paradero ?? 'Desconocido',
            numero_pasajeros: data.numero_pasajeros ?? 0,
            capacidad_max: data.capacidad_max ?? 0,
          });
        }
      } catch (error) {
        console.error('Error al obtener info del bus:', error);
      }
    };

    fetchBusInfo();
  }, [bus_id]);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Corredor</Text>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={20} />
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Prox. Parada</Text>
        <Text style={styles.value}>{busData.nombre_paradero}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Capacidad</Text>
        <Text style={styles.value}>{String(busData.numero_pasajeros)}/{String(busData.capacidad_max)}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={onClose} style={styles.okBtn}>
          <Text style={styles.okText}>Ok</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ModalBackdrop({
  children,
  onPressBackdrop,
}: {
  children: React.ReactNode;
  onPressBackdrop?: () => void;
}) {
  return (
    <Pressable style={styles.backdrop} onPress={onPressBackdrop}>
      <Pressable onPress={(e) => e.stopPropagation()}>{children}</Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: 320,
    maxWidth: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 6, borderRadius: 999 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10 },
  label: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  value: { color: '#111827', fontSize: 14, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
  footer: { marginTop: 12, alignItems: 'flex-end' },
  okBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    ...Platform.select({
      ios: { shadowColor: '#FF6B6B', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  okText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});