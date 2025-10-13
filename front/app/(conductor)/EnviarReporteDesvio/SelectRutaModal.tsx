import React, { useMemo, useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import AppModal from '@/components/Modals/AppModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './StylesReporteDesvio';

type Props = {
  visible: boolean;
  title?: string;
  items: string[];
  onClose: () => void;
  onSelect: (value: string) => void;
};

export default function SelectRutaModal({ visible, title = 'Seleccione', items, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>{title}</ThemedText>
        </View>

        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          style={styles.modalListContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                setQuery('');
                onClose();
              }}
              style={styles.modalItem}
            >
              <ThemedText style={styles.modalItemText}>{item}</ThemedText>
            </TouchableOpacity>
          )}
        />
      </ThemedView>
    </AppModal>
  );
}
