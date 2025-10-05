import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from './StylesIndex';
import MapSection from '@/components/MapSection';

export default function ClienteMenuPrincipal() {

    const router = useRouter();
    return (
        <View style={styles.container}>
            {/* Top Buttons */}
            <View style={styles.topButtonsContainer}>
                <TouchableOpacity style={styles.topButton}>
                    <Icon name="filter-variant" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topButton}>
                    <Icon name="bus" size={20} color="#fff" />
                    <Text style={styles.topButtonText}>Viajes</Text>
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
        </View>
    );
}