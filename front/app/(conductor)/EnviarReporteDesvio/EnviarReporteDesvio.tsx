import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import AppModal from '@/components/Modals/AppModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './StylesReporteDesvio';
import SelectParaderoModal from './SelectParaderoModal';
import SelectRutaModal from './SelectRutaModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: { desde: string; hasta: string; ruta: string; motivo: string }) => void;
};

export default function EnviarReporteDesvio({ visible, onClose, onSubmit }: Props) {
  const [desde, setDesde] = useState('San Isidro');
  const [hasta, setHasta] = useState('Jesus María');
  const [ruta, setRuta] = useState('201');
  const [motivo, setMotivo] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'desde' | 'hasta' | 'ruta' | null>(null);

  // ejemplo de paraderos; reemplázalo por datos reales cuando estén disponibles
  const paraderos = [
    'Jesus María',
    'Via Expresa',
    'Arriola',
    'La Cultura',
    'San Luis',
    'Ulima',
    'Camacho'
  ];

  const rutas = [
    '201',
    '204',
    '206',
    '209'
  ];

  function openPicker(target: 'desde' | 'hasta' | 'ruta') {
    setPickerTarget(target);
    setPickerOpen(true);
  }

  function closePicker() {
    setPickerOpen(false);
    setPickerTarget(null);
  }

  function handleSend() {
    onSubmit?.({ desde, hasta, ruta, motivo });
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
            onPress={() => openPicker('desde')}
          >
            <ThemedText>{desde}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Hasta</ThemedText>
          <TouchableOpacity
            style={styles.picker}
            activeOpacity={0.8}
            onPress={() => openPicker('hasta')}
          >
            <ThemedText>{hasta}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Ruta</ThemedText>
          <TouchableOpacity
            style={styles.picker}
            activeOpacity={0.8}
            onPress={() => openPicker('ruta')}
          >
            <ThemedText>{ruta}</ThemedText>
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

      {/* Mostrar solo el modal correspondiente */}
      <SelectParaderoModal
        visible={pickerOpen && (pickerTarget === 'desde' || pickerTarget === 'hasta')}
        title={pickerTarget === 'desde' ? 'Desde' : 'Hasta'}
        items={paraderos}
        onClose={closePicker}
        onSelect={(value: string) => {
          if (pickerTarget === 'desde') setDesde(value);
          if (pickerTarget === 'hasta') setHasta(value);
          closePicker();
        }}
      />

      <SelectRutaModal
        visible={pickerOpen && pickerTarget === 'ruta'}
        title="Ruta"
        items={rutas}
        onClose={closePicker}
        onSelect={(value: string) => {
          setRuta(value);
          closePicker();
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