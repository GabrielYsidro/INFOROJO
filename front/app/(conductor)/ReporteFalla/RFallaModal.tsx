import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Switch } from 'react-native';
import AppModal from '@/components/Modals/AppModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './StylesReporteFalla';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getUsers from '@/services/userService';
import { API_URL } from '@/services/AuthService';

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (data: { paradero: string; tipoFalla: string; requiereIntervencion: boolean; unidadAfectada?: string; motivo: string }) => void;
};

export default function RFallaModal({ visible, onClose, onSubmit }: Props) {
    const [motivo, setMotivo] = useState('');
    const [paradero, setParadero] = useState('auto');
    const [tipoFalla, setTipoFalla] = useState('Motor');
    const [requiereIntervencion, setRequiereIntervencion] = useState(false);
    const [unidadAfectada, setUnidadAfectada] = useState<string | undefined>(undefined);
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

        useEffect(() => {
            (async () => {
                try {
                    const idStr = await AsyncStorage.getItem('userId');
                    if (!idStr) return;
                    const id = parseInt(idStr, 10);
                    const user = await getUsers.getUsers(id);
                    if (user && user.placa_unidad) {
                        setUnidadAfectada(user.placa_unidad);
                    }

                    try {
                        const resp = await fetch(`${API_URL}/corredor/${id}/ubicacion`);
                        if (resp.ok) {
                            const j = await resp.json();
                            const lat = j.latitud ?? j.latitude ?? j.lat;
                            const lng = j.longitud ?? j.longitude ?? j.lon;
                            if (lat != null && lng != null) {
                                // consultar paradero nearest
                                const q = `${API_URL}/paradero/nearest?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}${user && user.id_corredor_asignado ? `&id_ruta=${encodeURIComponent(user.id_corredor_asignado)}` : ''}`;
                                const pResp = await fetch(q);
                                if (pResp.ok) {
                                    const pj = await pResp.json();
                                    if (pj && pj.paradero) {
                                        setParadero(pj.paradero.nombre ?? 'Automático');
                                        setLat(lat);
                                        setLng(lng);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error('No se pudo obtener ubicacion/paradero nearest:', e);
                    }
                } catch (e) {
                    console.error('No se pudo obtener unidad afectada:', e);
                }
            })();
        }, []);

        function handleSend() {
                (async () => {
                    if (submitting) return;
                    setSubmitting(true);
                    try {
                        const idStr = await AsyncStorage.getItem('userId');
                        const token = await AsyncStorage.getItem('token');
                        const id = idStr ? parseInt(idStr, 10) : undefined;

                        const tipoMap: Record<string, number> = {
                            'Motor': 1,
                            'Sistema eléctrico': 2,
                            'Puertas': 3,
                            'Aire acondicionado': 4,
                            'Otros': 5
                        };
                        const body: any = {
                            tipo_reporte_id: tipoMap[tipoFalla] || 0,
                            descripcion: motivo,
                            requiere_intervencion: requiereIntervencion,
                        };
                        if (lat != null && lng != null) {
                            body.lat = lat;
                            body.lon = lng;
                        }
                        if (id) {
                            body.id_emisor = id;
                        }

                        const useUrl = token ? `${API_URL}/reports/falla` : `${API_URL}/reports/falla/test`;
                        const headers: any = { 'Content-Type': 'application/json' };
                        if (token) headers['Authorization'] = `Bearer ${token}`;

                        const res = await fetch(useUrl, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(body),
                        });

                        const jr = await res.json().catch(() => ({}));
                        if (!res.ok) {
                            console.error('Error al crear reporte:', jr);
                            onSubmit?.({ paradero, tipoFalla, requiereIntervencion, unidadAfectada, motivo });
                        } else {
                            const reporte = jr.reporte || jr;
                            if (reporte && reporte.paradero_mas_cercano_nombre) {
                                setParadero(reporte.paradero_mas_cercano_nombre);
                            }
                            onSubmit?.({ paradero, tipoFalla, requiereIntervencion, unidadAfectada, motivo });
                        }
                    } catch (e) {
                        console.error('Error al enviar reporte falla:', e);
                        onSubmit?.({ paradero, tipoFalla, requiereIntervencion, unidadAfectada, motivo });
                    } finally {
                        setSubmitting(false);
                        onClose();
                        setMotivo('');
                        setParadero('auto');
                        setTipoFalla('Motor');
                        setRequiereIntervencion(false);
                        setUnidadAfectada(undefined);
                        setLat(null);
                        setLng(null);
                    }
                })();
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
                            value={paradero === 'auto' ? 'Automático' : (paradero || 'Automático')}
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
