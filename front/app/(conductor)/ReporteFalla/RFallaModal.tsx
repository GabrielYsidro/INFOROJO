import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Switch } from 'react-native';
import AppModal from '@/components/Modals/AppModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './StylesReporteFalla';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getUsers from '@/services/userService';

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (data: { paradero: string; tipoFalla: string; requiereIntervencion: boolean; unidadAfectada?: string; motivo: string }) => void;
};

export default function RFallaModal({ visible, onClose, onSubmit }: Props) {
    const [motivo, setMotivo] = useState('');
    const [paradero, setParadero] = useState('');
    const [tipoFalla, setTipoFalla] = useState('Motor');
    const [requiereIntervencion, setRequiereIntervencion] = useState(false);
    const [unidadAfectada, setUnidadAfectada] = useState<string | undefined>(undefined);

        useEffect(() => {
            // intentar autocompletar unidad afectada leyendo AsyncStorage -> userId -> userService
            (async () => {
                try {
                    const idStr = await AsyncStorage.getItem('userId');
                    if (!idStr) return;
                    const id = parseInt(idStr, 10);
                                const user = await getUsers.getUsers(id);
                                if (user && user.placa_unidad) {
                                    setUnidadAfectada(user.placa_unidad);
                                    // sincronizar paradero para que muestre la misma info (auto)
                                    setParadero(user.placa_unidad);
                                }
                } catch (e) {
                    // ignore
                    console.error('No se pudo obtener unidad afectada:', e);
                }
            })();
        }, []);

        function handleSend() {
            onSubmit?.({ paradero, tipoFalla, requiereIntervencion, unidadAfectada, motivo });
            onClose();
            setMotivo('');
            setParadero('auto');
            setTipoFalla('Motor');
            setRequiereIntervencion(false);
            setUnidadAfectada(undefined);
        }

    return (
    <AppModal visible={visible} onClose={onClose}>
        <ThemedView style={styles.containerModal}>
        <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Reportar falla</ThemedText>
        </View>

        <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Paradero más cercano</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#F3F4F6' }]}
                            placeholder="Automático"
                            value={unidadAfectada ?? (paradero || 'Automático')}
                            editable={false}
                            placeholderTextColor="#A0A0A0"
                        />
        </View>

                <View style={styles.section}>
                        <ThemedText type="defaultSemiBold">Tipo de falla</ThemedText>
                        <View style={[styles.pickerContainer]}>
                            <Picker selectedValue={tipoFalla} onValueChange={setTipoFalla} style={[styles.picker]}> 
                                <Picker.Item label="Motor" value="Motor" />
                                <Picker.Item label="Sistema eléctrico" value="Sistema eléctrico" />
                                <Picker.Item label="Puertas" value="Puertas" />
                                <Picker.Item label="Aire acondicionado" value="Aire acondicionado" />
                                <Picker.Item label="Otros" value="Otros" />
                            </Picker>
                        </View>
                </View>

                <View style={styles.section}>
                        <ThemedText type="defaultSemiBold">¿Requiere intervención urgente?</ThemedText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Switch value={requiereIntervencion} onValueChange={setRequiereIntervencion} />
                            <ThemedText style={{ marginLeft: 12 }}>{requiereIntervencion ? 'Sí' : 'No'}</ThemedText>
                        </View>
                </View>

                <View style={styles.section}>
                        <ThemedText type="defaultSemiBold">Unidad afectada</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#F3F4F6' }]}
                            placeholder="Automático"
                            value={unidadAfectada ?? 'Automático'}
                            editable={false}
                            placeholderTextColor="#A0A0A0"
                        />
                </View>

                <View style={styles.section}>
                        <ThemedText type="defaultSemiBold">Motivo</ThemedText>
                        <TextInput
                        style={styles.input}
                        placeholder="Razón..."
                        value={motivo}
                        onChangeText={setMotivo}
                        multiline
                        placeholderTextColor="#A0A0A0"
                        />
                </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 16 }}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#E5E7EB', flex: 1, marginRight: 8 }]} onPress={onClose}>
            <ThemedText style={[styles.buttonText, { color: '#222' }]}>Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={handleSend}>
            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>Notificar</ThemedText>
            </TouchableOpacity>
        </View>
        </ThemedView>
    </AppModal>
    );
}
