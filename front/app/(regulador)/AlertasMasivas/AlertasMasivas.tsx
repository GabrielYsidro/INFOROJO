import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './StylesAlertasMasivas';
import { 
    obtenerDatosFormulario, 
    crearAlertaMasiva 
} from '@/services/alertaMasivaService';

interface Corredor {
    id_corredor: number;
    nombre: string;
}

interface Ruta {
    id_ruta: number;
    codigo: string;
    nombre: string;
}

interface Paradero {
    id_paradero: number;
    nombre: string;
}

export default function AlertasMasivas() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);

    // Datos para los dropdowns
    const [corredores, setCorredores] = useState<Corredor[]>([]);
    const [rutas, setRutas] = useState<Ruta[]>([]);
    const [paraderos, setParaderos] = useState<Paradero[]>([]);

    // Estados del formulario
    const [descripcion, setDescripcion] = useState('');
    const [idCorredorAfectado, setIdCorredorAfectado] = useState<number | undefined>(undefined);
    const [esCritica, setEsCritica] = useState(false);
    const [requiereIntervencion, setRequiereIntervencion] = useState(false);
    const [idRutaAfectada, setIdRutaAfectada] = useState<number | undefined>(undefined);
    const [idParaderoInicial, setIdParaderoInicial] = useState<number | undefined>(undefined);
    const [idParaderoFinal, setIdParaderoFinal] = useState<number | undefined>(undefined);
    const [tiempoRetrasoMin, setTiempoRetrasoMin] = useState('');

    // Cargar datos al iniciar
    useEffect(() => {
        cargarDatosFormulario();
    }, []);

    const handleVolver = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(regulador)/' as any);
        }
    };

    const cargarDatosFormulario = async () => {
        try {
            setLoading(true);
            const data = await obtenerDatosFormulario();
            setCorredores(data.corredores || []);
            setRutas(data.rutas || []);
            setParaderos(data.paraderos || []);
        } catch (error) {
            console.error('Error al cargar datos del formulario:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del formulario');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setDescripcion('');
        setIdCorredorAfectado(undefined);
        setEsCritica(false);
        setRequiereIntervencion(false);
        setIdRutaAfectada(undefined);
        setIdParaderoInicial(undefined);
        setIdParaderoFinal(undefined);
        setTiempoRetrasoMin('');
    };

    const handleEnviarAlerta = async () => {
        if (!descripcion.trim()) {
            Alert.alert('Error', 'Por favor ingresa una descripción para la alerta');
            return;
        }

        Alert.alert(
            'Confirmar Guardado',
            '¿Estás seguro de guardar esta alerta masiva en la base de datos?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Guardar',
                    onPress: async () => {
                        try {
                            setEnviando(true);
                            
                            const payload = {
                                descripcion: descripcion.trim(),
                                id_corredor_afectado: idCorredorAfectado,
                                es_critica: esCritica,
                                requiere_intervencion: requiereIntervencion,
                                id_ruta_afectada: idRutaAfectada,
                                id_paradero_inicial: idParaderoInicial,
                                id_paradero_final: idParaderoFinal,
                                tiempo_retraso_min: tiempoRetrasoMin ? parseInt(tiempoRetrasoMin) : undefined,
                            };

                            await crearAlertaMasiva(payload);

                            Alert.alert(
                                'Éxito',
                                'La alerta masiva ha sido guardada exitosamente',
                                [
                                    {
                                        text: 'OK',
                                        onPress: limpiarFormulario,
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Error al guardar alerta:', error);
                            Alert.alert('Error', 'No se pudo guardar la alerta masiva');
                        } finally {
                            setEnviando(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEnviarNotificacion = () => {
        Alert.alert(
            'Función no disponible',
            'El envío de notificaciones masivas estará disponible próximamente',
            [{ text: 'OK' }]
        );
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
                <Text style={styles.headerTitle}>CREAR ALERTA MASIVA</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Descripción (Requerido) */}
                <View style={styles.section}>
                    <Text style={styles.label}>Descripción *</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Describe la alerta masiva..."
                        value={descripcion}
                        onChangeText={setDescripcion}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Corredor Afectado */}
                <View style={styles.section}>
                    <Text style={styles.label}>Corredor Afectado (Opcional)</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={idCorredorAfectado}
                            onValueChange={(value) => setIdCorredorAfectado(value === 0 ? undefined : value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccionar corredor..." value={0} />
                            {corredores.map((corredor) => (
                                <Picker.Item
                                    key={corredor.id_corredor}
                                    label={corredor.nombre}
                                    value={corredor.id_corredor}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Ruta Afectada */}
                <View style={styles.section}>
                    <Text style={styles.label}>Ruta Afectada (Opcional)</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={idRutaAfectada}
                            onValueChange={(value) => setIdRutaAfectada(value === 0 ? undefined : value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccionar ruta..." value={0} />
                            {rutas.map((ruta) => (
                                <Picker.Item
                                    key={ruta.id_ruta}
                                    label={`${ruta.codigo} - ${ruta.nombre}`}
                                    value={ruta.id_ruta}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Paradero Inicial */}
                <View style={styles.section}>
                    <Text style={styles.label}>Paradero Inicial (Opcional)</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={idParaderoInicial}
                            onValueChange={(value) => setIdParaderoInicial(value === 0 ? undefined : value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccionar paradero..." value={0} />
                            {paraderos.map((paradero) => (
                                <Picker.Item
                                    key={paradero.id_paradero}
                                    label={paradero.nombre}
                                    value={paradero.id_paradero}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Paradero Final */}
                <View style={styles.section}>
                    <Text style={styles.label}>Paradero Final (Opcional)</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={idParaderoFinal}
                            onValueChange={(value) => setIdParaderoFinal(value === 0 ? undefined : value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccionar paradero..." value={0} />
                            {paraderos.map((paradero) => (
                                <Picker.Item
                                    key={paradero.id_paradero}
                                    label={paradero.nombre}
                                    value={paradero.id_paradero}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Tiempo de Retraso */}
                <View style={styles.section}>
                    <Text style={styles.label}>Tiempo de Retraso (minutos)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ej: 15"
                        value={tiempoRetrasoMin}
                        onChangeText={setTiempoRetrasoMin}
                        keyboardType="numeric"
                    />
                </View>

                {/* Switches */}
                <View style={styles.section}>
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Es Crítica</Text>
                        <Switch
                            value={esCritica}
                            onValueChange={setEsCritica}
                            trackColor={{ false: '#767577', true: '#c62828' }}
                            thumbColor={esCritica ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Requiere Intervención</Text>
                        <Switch
                            value={requiereIntervencion}
                            onValueChange={setRequiereIntervencion}
                            trackColor={{ false: '#767577', true: '#c62828' }}
                            thumbColor={requiereIntervencion ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
                {/* Botón Guardar */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.buttonGuardar,
                        (!descripcion.trim() || enviando) && styles.buttonDisabled,
                    ]}
                    onPress={handleEnviarAlerta}
                    disabled={!descripcion.trim() || enviando}
                >
                    {enviando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>GUARDAR ALERTA</Text>
                    )}
                </TouchableOpacity>

                {/* Botón Enviar Notificación */}
                <TouchableOpacity
                    style={[styles.button, styles.buttonEnviar]}
                    onPress={handleEnviarNotificacion}
                >
                    <Text style={styles.buttonText}>ENVIAR NOTIFICACIÓN</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
