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
import paraderoService, { getAllParaderos } from '@/services/paraderoService';

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

                // Intentar usar la ubicación de corredor asignado; si no está, usar la ubicación del usuario
                const corredorId = user?.id_corredor_asignado ?? null;
                let sourceLat: number | null = null;
                let sourceLng: number | null = null;

                if (corredorId) {
                    try {
                        const resp = await fetch(`${API_URL}/corredor/${corredorId}/ubicacion`);
                        if (resp.ok) {
                            const j = await resp.json();
                            sourceLat = j.latitud ?? j.latitude ?? j.lat ?? null;
                            sourceLng = j.longitud ?? j.longitude ?? j.lon ?? null;
                        } else {
                            console.warn(`No se pudo obtener ubicación del corredor ${corredorId}: ${resp.status}`);
                        }
                    } catch (e) {
                        console.error('Error al pedir ubicación del corredor:', e);
                    }
                }

                // Si no obtuvimos ubicación del corredor, intentar usar la ubicación del propio usuario (si existe)
                if ((sourceLat == null || sourceLng == null) && user) {
                    sourceLat = (user as any).ubicacion_actual_lat ?? (user as any).ubicacion_lat ?? null;
                    sourceLng = (user as any).ubicacion_actual_lng ?? (user as any).ubicacion_lng ?? null;
                    if (sourceLat != null && sourceLng != null) console.log('Usando ubicación del usuario como fallback');
                }

                if (sourceLat == null || sourceLng == null) {
                    console.warn('No se encontró ubicación de corredor ni del usuario para calcular paradero cercano');
                    return;
                }

                // intentar endpoint /paradero/nearest
                try {
                    const q = `${API_URL}/paradero/nearest?lat=${encodeURIComponent(sourceLat)}&lng=${encodeURIComponent(sourceLng)}${user && user.id_corredor_asignado ? `&id_ruta=${encodeURIComponent(user.id_corredor_asignado)}` : ''}`;
                    const pResp = await fetch(q);
                    if (pResp.ok) {
                        const pj = await pResp.json();
                        if (pj && pj.paradero) {
                            setParadero(pj.paradero.nombre ?? 'Automático');
                            setLat(sourceLat);
                            setLng(sourceLng);
                            return; // ya tenemos paradero
                        }
                    }
                } catch (e) {
                    // fallthrough al fallback
                }

                // Fallback: calcular localmente usando lista de paraderos
                try {
                    const paraderos = await getAllParaderos();
                    if (paraderos && paraderos.length) {
                        const toRad = (v: number) => (v * Math.PI) / 180;
                        const hav = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                            const R = 6371; // km
                            const dLat = toRad(lat2 - lat1);
                            const dLon = toRad(lon2 - lon1);
                            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
                            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            return R * c;
                        };

                        let best: { p: any; dist: number } | null = null;
                        for (const p of paraderos) {
                            if (p.coordenada_lat == null || p.coordenada_lng == null) continue;
                            const d = hav(sourceLat as number, sourceLng as number, p.coordenada_lat, p.coordenada_lng);
                            if (best == null || d < best.dist) best = { p, dist: d };
                        }

                        if (best) {
                            setParadero(best.p.nombre ?? 'Automático');
                            setLat(sourceLat);
                            setLng(sourceLng);
                        }
                    }
                } catch (e) {
                    console.error('Fallback paraderos failed', e);
                }
            } catch (e) {
                console.error('No se pudo obtener unidad afectada/paradero automático:', e);
            }
        })();
    }, []);

    async function handleSend() {
        if (submitting) return;
        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) {
                console.error('No se encontró el ID del usuario');
                alert('Error: No se pudo identificar al usuario. Inicia sesión nuevamente.');
                return;
            }

            const userId = parseInt(userIdStr, 10);

            // Obtener datos del usuario para el id_corredor_asignado
            let id_corredor_afectado = null;
            try {
                const user = await getUsers.getUsers(userId);
                id_corredor_afectado = user?.id_corredor_asignado || null;
            } catch (e) {
                console.warn('No se pudo obtener id_corredor_asignado:', e);
            }

            // ✅ Payload con todos los campos necesarios
            const body = {
                paradero: paradero === 'auto' ? 'Automático' : paradero,
                tipo_falla: tipoFalla,
                requiere_mantenimiento: requiereIntervencion,
                unidad_afectada: unidadAfectada ?? 'No especificada',
                motivo: motivo.trim() || '',
                conductor_id: userId,
                id_corredor_afectado: id_corredor_afectado,
            };

            console.log('[DEBUG] Enviando reporte falla:', JSON.stringify(body, null, 2));

            const useUrl = `${API_URL}/reports/falla`;
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
                alert(`Error: ${jr.detail || 'No se pudo crear el reporte'}`);
            } else {
                console.log('✅ Reporte creado exitosamente:', jr);
                alert('✅ Reporte de falla enviado correctamente');
                onSubmit?.({ paradero, tipoFalla, requiereIntervencion, unidadAfectada, motivo });
            }
        } catch (e) {
            console.error('Error al enviar reporte falla:', e);
            alert('Error al enviar el reporte. Inténtalo nuevamente.');
        } finally {
            setSubmitting(false);
            onClose();
            setMotivo('');
            setParadero('auto');
            setTipoFalla('Motor');
            setRequiereIntervencion(false);
            // 🔹 No cambiamos unidadAfectada (se mantiene)
            setLat(null);
            setLng(null);
        }
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
