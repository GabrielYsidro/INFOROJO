import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './StylesClienteMenuPrincipal';

export default function ClienteMenuPrincipal() {
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
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        latitude: -12.0464,
                        longitude: -77.0428,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                />
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButtonActive}>
                    <Icon name="home" size={28} color="#fff" />
                    <Text style={styles.navButtonTextActive}>Menu Principal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton}>
                    <Icon name="account-circle" size={28} color="#c62828" />
                    <Text style={styles.navButtonText}>Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}