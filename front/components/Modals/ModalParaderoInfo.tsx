import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Paradero, API_URL } from '@/services/paraderoService';

type Props = {
  paradero: Paradero;
  onClose?: () => void;
};

export default function ModalParaderoInfo({ paradero, onClose }: Props) {
  const [etaMinutos, setEtaMinutos] = useState<number | null | undefined>(paradero.eta_minutos ?? null);
  const [loadingEta, setLoadingEta] = useState(false);
  const [etaError, setEtaError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchEta = async () => {
      // si ya viene en el objeto paradero, no es necesario solicitar
      if (typeof paradero.eta_minutos === 'number') {
        setEtaMinutos(paradero.eta_minutos);
        return;
      }

      setLoadingEta(true);
      setEtaError(null);
      try {
        const res = await fetch(`${API_URL}/paradero/${paradero.id_paradero}/eta`);
        if (!mounted) return;
        if (!res.ok) {
          setEtaError('N/D');
          setEtaMinutos(null);
        } else {
          const data = await res.json();
          // data.eta_minutos esperado
          setEtaMinutos(typeof data?.eta_minutos === 'number' ? data.eta_minutos : null);
        }
      } catch (err) {
        console.error('Error al obtener ETA:', err);
        if (mounted) {
          setEtaError('N/D');
          setEtaMinutos(null);
        }
      } finally {
        if (mounted) setLoadingEta(false);
      }
    };

    fetchEta();
    return () => { mounted = false; };
  }, [paradero]);

  const eta = etaMinutos ?? null;
  let etaColor = '#9CA3AF';
  if (typeof eta === 'number') {
    if (eta < 5)         etaColor = '#28c64a';
    else if (eta >= 20)  etaColor = '#c62828';
    else                 etaColor = '#F59E0B';
  }
  const etaText = typeof eta === 'number' ? (eta <= 0 ? '<1 min' : `${eta} min`) : 'N/D';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paradero</Text>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={20} />
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{paradero.nombre}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Estado</Text>
        <Text style={[styles.value, { color: paradero.colapso_actual ? '#c62828' : '#28c64a' }]}>
          {paradero.colapso_actual ? 'Colapsado' : 'Normal'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>ETA</Text>
        <View style={styles.etaBox}>
          {loadingEta ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <>
              <View style={[styles.etaIndicator, { backgroundColor: etaColor }]}>
                <Ionicons name="bus" size={14} color="#fff" />
              </View>
              <Text style={styles.etaText}>{etaText}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={onClose} style={styles.okBtn}>
          <Text style={styles.okText}>Ok</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  etaBox: { flexDirection: 'row', alignItems: 'center' },
  etaIndicator: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  etaText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: '#111827' },
});
