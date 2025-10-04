import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title?: string;
  stop?: string;
  capacity?: number | string;
  max?: number | string;
  onClose?: () => void;
};

export default function ModalBusInfo({
  title = 'Bus',
  stop = 'Paradero B',
  capacity = 11,
  max = 20,
  onClose,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={20} />
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Prox. Parada</Text>
        <Text style={styles.value}>{String(stop)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Capacidad</Text>
        <Text style={styles.value}>{String(capacity)}/{String(max)}</Text>
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