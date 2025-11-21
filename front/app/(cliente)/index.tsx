import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from './StylesIndex';
import MapSection from '@/components/MapSection';
import AppModal from '@/components/Modals/AppModal';
import ModalFiltros from '@/components/Modals/ModalFiltros';
import { FiltrosData, aplicarFiltros } from '@/services/filtrosService';
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

    // Estado para el modal de feedback
    const [showFeedback, setShowFeedback] = useState(false);

    // Función para manejar la aplicación de filtros
    const handleAplicarFiltros = async () => {
        try {
            const resultado = await aplicarFiltros(filtros);
            console.log('Rutas filtradas:', resultado);
            // Aquí puedes actualizar el mapa con las rutas filtradas
            // Por ejemplo, pasar los resultados al MapSection
        } catch (error) {
            console.error('Error al aplicar filtros:', error);
        }
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
            <MapSection />

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