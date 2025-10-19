
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './StylesHistorialViajes';
import userService from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Viaje = {
	id: number;
	paradero_sube: string;
	paradero_baja: string;
	fecha: string;
	imagen?: string;
};


const HistorialViajes = () => {
	const [viajes, setViajes] = useState<Viaje[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const fetchHistorial = async () => {
			try {
				setLoading(true);
				setError(null);
			const userId = await AsyncStorage.getItem('userId');
				if (!userId) {
					setError('No se encontró el usuario.');
					setLoading(false);
					return;
				}
			const data = await userService.getUserHistorial(Number(userId));
			setViajes(data);
			} catch (err) {
				setError('Error al cargar el historial.');
			} finally {
				setLoading(false);
			}
		};
		fetchHistorial();
	}, []);

	function formatearFecha(fecha: string): React.ReactNode {
		const date = new Date(fecha);
		if (isNaN(date.getTime())) return fecha;
		const opciones: Intl.DateTimeFormatOptions = {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		};
		return date.toLocaleString('es-PE', opciones);
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#fff' }}>
			{/* Header */}
			<View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
				<TouchableOpacity onPress={() => router.back()}>
					<Icon name="chevron-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={{ fontSize: 22, fontWeight: 'bold', marginLeft: 8 }}>
					Viajes
				</Text>
			</View>
			{/* Lista de viajes o loader/error */}
			{loading ? (
				<ActivityIndicator size="large" color="#B71C1C" style={{ marginTop: 32 }} />
			) : error ? (
				<Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{error}</Text>
			) : viajes.length === 0 ? (
				<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>
					No hay viajes registrados.
				</Text>
			) : (
				<FlatList
					data={viajes}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.item}
							onPress={() => router.push({
								pathname: '/(cliente)/Viaje/ParaderoDetalle',
								params: {
									paradero_sube: item.paradero_sube || '',
									paradero_baja: item.paradero_baja || '',
									fecha: item.fecha,
									imagen: item.imagen || ''
								}
							})}
						>
							<View>
								<Text style={styles.paradero}>
									{`🔼 ${item.paradero_sube || 'Sin dato'}  🔽 ${item.paradero_baja || 'Sin dato'}`}
								</Text>
								<Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
							</View>
							<Icon name="chevron-forward" size={22} color="#888" />
						</TouchableOpacity>
					)}
					contentContainerStyle={{ paddingHorizontal: 16 }}
				/>
			)}
			{/* Botón Volver */}
			<View style={styles.volverContainer}>
				<TouchableOpacity
					style={styles.volverBtn}
					onPress={() => router.back()}
				>
					<Text style={styles.volverTxt}>Volver</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};
export default HistorialViajes;