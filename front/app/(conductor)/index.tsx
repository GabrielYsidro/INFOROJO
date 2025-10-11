import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import styles from './StylesIndex';
import MapSection from '@/components/MapSection';

export default function ConductorMenuPrincipal() {

    const router = useRouter();

    const handleNavigate = (path: any) => {
        router.push(path);
    }

    return (
        <View style={styles.container}>
            {/* Top Buttons */}
            <View style={styles.topButtonsContainer}>
                <TouchableOpacity style={styles.topButton}
                onPress = {() => handleNavigate("/(conductor)/EnviarReporteTrafico/EnviarReporteTrafico")}>
                    <Icon name="check-circle-outline" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Llegada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topButton}
                onPress = {() => handleNavigate("/(conductor)/EnviarReporteDesvio/EnviarReporteDesvio")}>
                    <Icon name="alert-circle-outline" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Desvío</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topButton}
                onPress = {() => handleNavigate("/(conductor)/ReporteFalla/ReporteFalla")}>
                    <Icon name="close-circle-outline" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Falla</Text>
                </TouchableOpacity>
            </View>

            {/* Map Section */}
            <MapSection />

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButtonActive}>
                    <Icon name="home" size={28} color="#fff" />
                    <Text style={styles.navButtonTextActive}>Menu Principal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push("/(conductor)/CuentaUsuario/CuentaUsuario")}
                >
                    <Icon name="account-circle" size={28} color="#c62828" />
                    <Text style={styles.navButtonText}>Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}