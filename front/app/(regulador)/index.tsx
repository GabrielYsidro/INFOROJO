import MapSection from '@/components/MapSection';
import AppModal from '@/components/Modals/AppModal';
import ModalFiltros from '@/components/Modals/ModalFiltros';
import { FiltrosData, aplicarFiltros } from '@/services/filtrosService';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './StylesIndex';

export default function ClienteMenuPrincipal() {
    const router = useRouter();
    
    // Estado para el modal de filtros
    const [showFiltros, setShowFiltros] = useState(false);
    const [filtros, setFiltros] = useState<FiltrosData>({
        ruta: '',
        distrito: '',
        distancia: ''
    });

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
                    onPress={() => router.push("/(regulador)/VistaDashboard/VistaDashboard")}
                >
                    <Icon name="table" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topButton}
                onPress={() => router.push("/(regulador)/MonitorearBuses/MonitorearBuses")}>
                    <Icon name="monitor" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Monitoreo</Text>
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
                    onPress={() => router.push("/(regulador)/CuentaUsuario/CuentaRegulador")}
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
        </View>
    );
}