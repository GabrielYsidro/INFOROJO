import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from './StylesIndex';
import MapSection from '@/components/MapSection';
import AppModal from '@/components/Modals/AppModal';
import ModalFiltros from '@/components/Modals/ModalFiltros';
import { FiltrosData, obtenerRutasDisponibles, RutaFiltrada, getParaderosPorRutaId, aplicarFiltros } from '@/services/filtrosService';
import { Paradero } from '@/services/paraderoService';
import FeedbackModal from './Feedback/Feedback';

export default function ClienteMenuPrincipal() {
    const router = useRouter();
    
    // Estado para el modal de filtros
    const [showFiltros, setShowFiltros] = useState(false);
    const [filtros, setFiltros] = useState<FiltrosData>({
        ruta: '',
        distrito: '',
        distancia: ''
    });
    const [paraderosFiltrados, setParaderosFiltrados] = useState<Paradero[] | null>(null);

    // Estado para el modal de feedback
    const [showFeedback, setShowFeedback] = useState(false);

    // Función para manejar la aplicación de filtros
    const handleAplicarFiltros = async () => {
        try {
            const nombreRuta = filtros.ruta.trim();
            if (!nombreRuta) {
                setParaderosFiltrados(null);
                return;
            }

            // Obtener lista de rutas sin paraderos (endpoint obtenerRutas)
            const rutasBasicas: RutaFiltrada[] = await obtenerRutasDisponibles();
            const ruta = rutasBasicas.find(r => r.nombre === nombreRuta);
            if (!ruta) {
                Alert.alert('Sin resultados', 'No se encontró la ruta.');
                setParaderosFiltrados(null);
                return;
            }

            // Obtener paraderos directamente por id usando ruta_id (backend devuelve lista de paraderos)
            let paraderosRuta = await getParaderosPorRutaId(ruta.id_ruta) as Paradero[];

            // Fallback: si vacío intentar endpoint por nombre (/filtrar?ruta=nombre) para ver si backend adjunta paraderos
            if (!paraderosRuta.length) {
                console.log('[Fallback] Intentando filtrar por nombre');
                try {
                    const rutasNombre = await aplicarFiltros({ ruta: nombreRuta, distrito: '', distancia: '' });
                    const candidata = rutasNombre.find(r => r.id_ruta === ruta.id_ruta || r.nombre === nombreRuta);
                    if (candidata?.paraderos?.length) {
                        paraderosRuta = candidata.paraderos as Paradero[];
                        console.log('[Fallback] Paraderos obtenidos por nombre:', paraderosRuta.length);
                    }
                } catch (e) {
                    console.warn('[Fallback] Error filtrando por nombre', e);
                }
            }
            if (!paraderosRuta || paraderosRuta.length === 0) {
                Alert.alert('Sin paraderos', 'La ruta no tiene paraderos.');
                setParaderosFiltrados([]);
                return;
            }

            const vistos = new Set<number>();
            const lista = paraderosRuta.filter(p => {
                if (!p.id_paradero || vistos.has(p.id_paradero)) return false;
                if (typeof p.coordenada_lat !== 'number' || typeof p.coordenada_lng !== 'number') return false;
                vistos.add(p.id_paradero);
                return true;
            });
            setParaderosFiltrados(lista);
        } catch (error) {
            console.error('Error al aplicar filtros (ruta_id):', error);
            Alert.alert('Error', 'No se pudo aplicar el filtro de ruta.');
        }
    };

    const handleLimpiarFiltros = () => {
        setFiltros({ ruta: '', distrito: '', distancia: '' });
        setParaderosFiltrados(null);
    };

    return (
        <View style={styles.container}>
            {/* Top Buttons */}
            <View style={styles.topButtonsContainer}>
                <TouchableOpacity 
                    style={styles.topButton}
                    onPress={() => setShowFiltros(true)}
                >
                    <Icon name="filter-variant" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Filtros</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.topButton}
                    onPress={() => router.push('/(cliente)/HistorialViajes/HistorialViajes')}
                >
                    <Icon name="bus" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Viajes</Text>
                </TouchableOpacity>

                {/* Nuevo botón para abrir Feedback */}
                <TouchableOpacity
                    style={styles.topButton}
                    onPress={() => setShowFeedback(true)}
                >
                    <Icon name="message-text" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.topButton}
                    onPress={() => router.push('/(cliente)/RegistroNotificaciones/RegistroNotificaciones')}
                >
                    <Icon name="bell" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Map Section */}
            <MapSection filteredParaderos={paraderosFiltrados} />

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>

                <TouchableOpacity style={styles.navButtonActive}
                    onPress={async () => {
                        await AsyncStorage.clear();
                        console.log("AsyncStorage limpiado");
                    }}>
                    <Icon name="home" size={28} color="#fff" />
                    <Text style={styles.navButtonTextActive}>Menu Principal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push("/(cliente)/CuentaUsuario/CuentaUsuario")}
                >
                    <Icon name="account-circle" size={28} color="#c62828" />
                    <Text style={styles.navButtonText}>Cuenta</Text>
                </TouchableOpacity>
            </View>

            {/* Modal de Filtros */}
            <AppModal 
                visible={showFiltros} 
                onClose={() => setShowFiltros(false)}
            >
                <ModalFiltros
                    filtros={filtros}
                    onFiltrosChange={setFiltros}
                    onAplicar={handleAplicarFiltros}
                    onLimpiar={handleLimpiarFiltros}
                    onClose={() => setShowFiltros(false)}
                />
            </AppModal>

            {/* Modal de Feedback */}
            <FeedbackModal
                visible={showFeedback}
                onClose={() => setShowFeedback(false)}
                onSent={() => {
                    setShowFeedback(false);
                    Alert.alert('Gracias', 'Tu feedback fue enviado.');
                }}
            />
        </View>
    );
}