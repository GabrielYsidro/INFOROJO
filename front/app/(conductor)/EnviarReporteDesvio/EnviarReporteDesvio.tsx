import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import AppModal from '@/components/Modals/AppModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './StylesReporteDesvio';
import SelectRutaModal from './SelectRutaModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: { desde: string; hasta: string; motivo: string }) => void;
};

export default function EnviarReporteDesvio({ visible, onClose, onSubmit }: Props) {
  const [desde, setDesde] = useState('San Isidro');
  const [hasta, setHasta] = useState('Jesus María');
  const [motivo, setMotivo] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'desde' | 'hasta' | null>(null);

  // ejemplo de paraderos; reemplázalo por datos reales cuando estén disponibles
  const rutas = [
    'Jesus María',
    'Via Expresa',
    'Arriola',
    'La Cultura',
    'San Luis',
    'Ulima',
    'Camacho'
  ];

  function handleSend() {
    onSubmit?.({ desde, hasta, motivo });
    onClose();
  }

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>
            Alertar desvío
          </ThemedText>
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Desde</ThemedText>
          <TouchableOpacity
            style={styles.picker}
            activeOpacity={0.8}
            onPress={() => {
              setPickerTarget('desde');
              setPickerOpen(true);
            }}
          >
            <ThemedText>{desde}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Hasta</ThemedText>
          <TouchableOpacity
            style={styles.picker}
            activeOpacity={0.8}
            onPress={() => {
              setPickerTarget('hasta');
              setPickerOpen(true);
            }}
          >
            <ThemedText>{hasta}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Motivo</ThemedText>
          <TextInput
            placeholder="Razón..."
            placeholderTextColor="#9CA3AF"
            value={motivo}
            onChangeText={setMotivo}
            multiline
            style={styles.textarea}
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose}>
            <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSend]} onPress={handleSend}>
            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>Enviar</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
      <SelectRutaModal
        visible={pickerOpen}
        title={pickerTarget === 'desde' ? 'Desde' : 'Hasta'}
        items={rutas}
        onClose={() => setPickerOpen(false)}
        onSelect={(value) => {
          if (pickerTarget === 'desde') setDesde(value);
          if (pickerTarget === 'hasta') setHasta(value);
        }}
      />
    </AppModal>
  );
}

// render del modal de selección
export function EnviarReporteDesvioWithPicker(props: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <EnviarReporteDesvio {...props} />
    </>
  );
}