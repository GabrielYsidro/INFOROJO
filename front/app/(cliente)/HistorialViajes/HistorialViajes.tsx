
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './StylesHistorialViajes';
import userService from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Viaje = {
	id: number;
	paradero: string;
	fecha: string;
	subida?: string;
	llegada?: string;
	imagen?: string;
};


function formatearFecha(fecha: string) {
	const meses = [
		'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
		'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	];
	const d = new Date(fecha);
	const dia = d.getDate();
	const mes = meses[d.getMonth()];
	const hora = d.getHours();
	const min = d.getMinutes().toString().padStart(2, '0');
	const ampm = hora >= 12 ? 'pm' : 'am';
	const hora12 = hora > 12 ? hora - 12 : hora;
	return `${dia} de ${mes} (${hora12}:${min} ${ampm})`;
}


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
				// Obtener el userId del storage (ajusta si lo guardas diferente)
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
			) : (
				<FlatList
					data={viajes}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={estilos.item}
							onPress={() => router.push({
								pathname: '/(cliente)/Viaje/ParaderoDetalle',
								params: {
									paradero: item.paradero,
									fecha: item.fecha,
									subida: item.subida || '',
									llegada: item.llegada || '',
									imagen: item.imagen || '',
								}
							})}
						>
							<View>
								<Text style={estilos.paradero}>{item.paradero}</Text>
								<Text style={estilos.fecha}>{formatearFecha(item.fecha)}</Text>
							</View>
							<Icon name="chevron-forward" size={22} color="#888" />
						</TouchableOpacity>
					)}
					contentContainerStyle={{ paddingHorizontal: 16 }}
				/>
			)}
			{/* Botón Volver */}
			<View style={estilos.volverContainer}>
				<TouchableOpacity
					style={estilos.volverBtn}
					onPress={() => router.back()}
				>
					<Text style={estilos.volverTxt}>Volver</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const estilos = StyleSheet.create({
	item: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	paradero: {
		fontSize: 16,
		color: '#222',
		fontWeight: '500',
	},
	fecha: {
		fontSize: 14,
		color: '#666',
		marginTop: 2,
	},
	volverContainer: {
		position: 'absolute',
		bottom: 32,
		right: 0,
		left: 0,
		alignItems: 'flex-end',
		paddingHorizontal: 16,
	},
	volverBtn: {
		backgroundColor: '#FF5252',
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 32,
	},
	volverTxt: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
});

export default HistorialViajes;