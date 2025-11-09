import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, router as globalRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './StylesAlertasMasivas';
import { 
    obtenerTiposReporte, 
    obtenerReportesPorTipo, 
    enviarAlertaMasiva 
} from '@/services/alertaMasivaService';

interface TipoReporte {
    id_tipo_reporte: number;
    tipo: string;
}

interface Reporte {
    id_reporte: number;
    descripcion: string;
    fecha: string;
    es_critica: boolean;
    requiere_intervencion: boolean;
}

export default function AlertasMasivas() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tiposReporte, setTiposReporte] = useState<TipoReporte[]>([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<number>(0);
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [enviando, setEnviando] = useState(false);

    // Cargar tipos de reporte al iniciar
    useEffect(() => {
        cargarTiposReporte();
    }, []);

    // Cargar reportes cuando cambia el tipo seleccionado
    useEffect(() => {
        if (tipoSeleccionado > 0) {
            cargarReportes();
        } else {
            setReportes([]);
        }
    }, [tipoSeleccionado]);

    const handleVolver = () => {
        // Intentar volver atrás en el historial
        if (router.canGoBack()) {
            router.back();
        } else {
            // Si no hay historial, navegar al index del regulador
            router.replace('/(regulador)/' as any);
        }
    };

    const cargarTiposReporte = async () => {
        try {
            setLoading(true);
            const data = await obtenerTiposReporte();
            setTiposReporte(data);
        } catch (error) {
            console.error('Error al cargar tipos de reporte:', error);
            Alert.alert('Error', 'No se pudieron cargar los tipos de reporte');
        } finally {
            setLoading(false);
        }
    };

    const cargarReportes = async () => {
        try {
            const data = await obtenerReportesPorTipo(tipoSeleccionado);
            setReportes(data);
        } catch (error) {
            console.error('Error al cargar reportes:', error);
            Alert.alert('Error', 'No se pudieron cargar los reportes');
        }
    };

    const handleEnviarAlerta = async () => {
        if (tipoSeleccionado === 0) {
            Alert.alert('Error', 'Por favor selecciona un tipo de alerta');
            return;
        }

        Alert.alert(
            'Confirmar Envío',
            '¿Estás seguro de enviar esta alerta masiva a todos los usuarios (reguladores, clientes y conductores)?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Enviar',
                    onPress: async () => {
                        try {
                            setEnviando(true);
                            
                            // Obtener el tipo de reporte seleccionado
                            const tipoReporteObj = tiposReporte.find(
                                t => t.id_tipo_reporte === tipoSeleccionado
                            );

                            await enviarAlertaMasiva({
                                id_tipo_reporte: tipoSeleccionado,
                                titulo: `Alerta Masiva: ${tipoReporteObj?.tipo || 'Alerta'}`,
                                descripcion: `Se ha enviado una alerta masiva de tipo ${tipoReporteObj?.tipo || 'Alerta'}`,
                            });

                            Alert.alert(
                                'Éxito',
                                'La alerta masiva ha sido enviada exitosamente a todos los usuarios',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            // Resetear el formulario
                                            setTipoSeleccionado(0);
                                            setReportes([]);
                                        },
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Error al enviar alerta:', error);
                            Alert.alert('Error', 'No se pudo enviar la alerta masiva');
                        } finally {
                            setEnviando(false);
                        }
                    },
                },
            ]
        );
    };

    const formatearFecha = (fechaStr: string) => {
        if (!fechaStr) return 'Fecha no disponible';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#c62828" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Botón de regreso */}
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleVolver}
            >
                <Icon name="arrow-left" size={24} color="#c62828" />
                <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ALERTA MASIVA</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Selector de tipo de alerta */}
                <View style={styles.section}>
                    <Text style={styles.label}>Tipo de Alerta</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={tipoSeleccionado}
                            onValueChange={(itemValue) => setTipoSeleccionado(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccione un tipo de alerta" value={0} />
                            {tiposReporte.map((tipo) => (
                                <Picker.Item
                                    key={tipo.id_tipo_reporte}
                                    label={tipo.tipo}
                                    value={tipo.id_tipo_reporte}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Lista de reportes del tipo seleccionado */}
                {tipoSeleccionado > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Reportes de {tiposReporte.find(t => t.id_tipo_reporte === tipoSeleccionado)?.tipo}
                        </Text>
                        <ScrollView style={styles.reportesList}>
                            {reportes.length > 0 ? (
                                reportes.map((reporte) => (
                                    <View key={reporte.id_reporte} style={styles.reporteItem}>
                                        <Text style={styles.reporteDescripcion}>
                                            {reporte.descripcion || 'Sin descripción'}
                                        </Text>
                                        <Text style={styles.reporteFecha}>
                                            {formatearFecha(reporte.fecha)}
                                        </Text>
                                        {reporte.es_critica && (
                                            <Text style={styles.reporteCritica}>⚠️ CRÍTICA</Text>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>
                                    No hay reportes de este tipo
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                )}
            </ScrollView>

            {/* Botón para enviar alerta masiva */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        (tipoSeleccionado === 0 || enviando) && styles.buttonDisabled,
                    ]}
                    onPress={handleEnviarAlerta}
                    disabled={tipoSeleccionado === 0 || enviando}
                >
                    {enviando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>ENVIAR ALERTA MASIVA</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
