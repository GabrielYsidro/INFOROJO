import React, { useMemo, useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import AppModal from '@/components/Modals/AppModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './StylesReporteDesvio';

// Interfaz genérica para los items que puede recibir el modal
type Item = {
  id: number | string;
  [key: string]: any;
};

// Props genéricas para el componente
type Props<T extends Item> = {
  visible: boolean;
  title?: string;
  items: T[];
  displayKey: keyof T; // La propiedad del objeto que se mostrará en la lista
  onClose: () => void;
  onSelect: (value: T) => void; // Devuelve el objeto completo seleccionado
};

export default function SelectModal<T extends Item>({
  visible,
  title = 'Seleccione',
  items,
  displayKey,
  onClose,
  onSelect,
}: Props<T>) {
  const [query, setQuery] = useState('');

  // Filtra los items basándose en la búsqueda del usuario
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      String(i[displayKey]).toLowerCase().includes(q)
    );
  }, [items, query, displayKey]);

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
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
          keyExtractor={(item, index) => String(item.id ?? index)}
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
              <ThemedText style={styles.modalItemText}>
                {String(item[displayKey])}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      </ThemedView>
    </AppModal>
  );
}