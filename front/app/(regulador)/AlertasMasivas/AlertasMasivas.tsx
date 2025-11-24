import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Switch, SafeAreaView } from 'react-native';
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
    capacidad_max?: number;
    ubicacion_lat?: number;
    ubicacion_lng?: number;
    estado?: string;
}

interface Ruta {
    id_ruta: number;
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
        console.log('🔙 Botón Volver presionado');
        try {
            router.back();
            console.log('✅ Navegación exitosa');
        } catch (error) {
            console.error('❌ Error al volver:', error);
        }
    };

    const cargarDatosFormulario = async () => {
        try {
            setLoading(true);
            const data = await obtenerDatosFormulario();
            console.log('📊 [AlertasMasivas] Datos cargados:', data);
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

    const handleGuardarOEnviar = async (sendNotification: boolean) => {
        // Validar todos los campos obligatorios
        if (!descripcion.trim()) {
            Alert.alert('Error', 'Por favor ingresa una descripción para la alerta');
            return;
        }
        if (!idCorredorAfectado) {
            Alert.alert('Error', 'Por favor selecciona un corredor afectado');
            return;
        }
        if (!idRutaAfectada) {
            Alert.alert('Error', 'Por favor selecciona una ruta afectada');
            return;
        }
        if (!idParaderoInicial) {
            Alert.alert('Error', 'Por favor selecciona un paradero inicial');
            return;
        }
        if (!idParaderoFinal) {
            Alert.alert('Error', 'Por favor selecciona un paradero final');
            return;
        }
        if (!tiempoRetrasoMin || parseInt(tiempoRetrasoMin) <= 0) {
            Alert.alert('Error', 'Por favor ingresa un tiempo de retraso válido');
            return;
        }

        const actionText = sendNotification ? 'guardar y notificar' : 'guardar';
        const confirmationTitle = sendNotification ? 'Confirmar Envío y Notificación' : 'Confirmar Guardado';
        const confirmationMessage = `¿Estás seguro de ${actionText} esta alerta?`;
        
        Alert.alert(
            confirmationTitle,
            confirmationMessage,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
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
                                send_notification: sendNotification,
                            };

                            await crearAlertaMasiva(payload);

                            Alert.alert(
                                'Éxito',
                                `La alerta masiva ha sido procesada exitosamente.`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: limpiarFormulario,
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error(`Error al ${actionText} la alerta:`, error);
                            Alert.alert('Error', `No se pudo ${actionText} la alerta masiva.`);
                        } finally {
                            setEnviando(false);
                        }
                    },
                },
            ]
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
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleVolver}
            >
                <Icon name="arrow-left" size={28} color="#222" />
            </TouchableOpacity>
            <Text style={styles.title}>Alertas Masivas</Text>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
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
                    <Text style={styles.label}>Corredor Afectado *</Text>
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
                                    label={`Corredor ${corredor.id_corredor}${corredor.estado ? ` - ${corredor.estado}` : ''}`}
                                    value={corredor.id_corredor}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Ruta Afectada */}
                <View style={styles.section}>
                    <Text style={styles.label}>Ruta Afectada *</Text>
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
                                    label={ruta.nombre}
                                    value={ruta.id_ruta}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Paradero Inicial */}
                <View style={styles.section}>
                    <Text style={styles.label}>Paradero Inicial *</Text>
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
                    <Text style={styles.label}>Paradero Final *</Text>
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
                    <Text style={styles.label}>Tiempo de Retraso (minutos) *</Text>
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
                {/* Botón Enviar Notificación */}
                <TouchableOpacity
                    style={[styles.button, styles.buttonEnviar, ((!descripcion.trim() || enviando)) && styles.buttonDisabled]}
                    onPress={() => handleGuardarOEnviar(true)}
                    disabled={!descripcion.trim() || enviando}
                >
                    <Text style={styles.buttonText}>ENVIAR NOTIFICACIÓN</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
