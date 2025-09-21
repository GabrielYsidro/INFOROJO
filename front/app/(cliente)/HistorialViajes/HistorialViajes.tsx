import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import styles from './StylesHistorialViajes';

// Simulación de datos (luego se reemplaza por fetch a la DB)
type Viaje = {
	id: number;
	paradero: string;
	fecha: string;
};

const viajesEjemplo: Viaje[] = [
	{ id: 1, paradero: 'Paradero A', fecha: '2025-09-01' },
	{ id: 2, paradero: 'Paradero B', fecha: '2025-09-10' },
	{ id: 3, paradero: 'Paradero C', fecha: '2025-09-15' },
];

const HistorialViajes = () => {
	const [viajes, setViajes] = useState<Viaje[]>([]);

	// useEffect para simular fetch de datos
	useEffect(() => {
		// Simulación de consulta a la DB
		console.log('Ejemplo de viajes:', viajesEjemplo);
		// Puedes hacer otras pruebas aquí
		viajesEjemplo.forEach((viaje, idx) => {
			console.log(`Viaje ${idx + 1}:`, viaje);
		});
		setViajes(viajesEjemplo);
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.titulo}>Historial de Viajes</Text>
			<ScrollView horizontal>
				<View style={styles.tabla}>
					<View style={styles.filaHeader}>
						<Text style={styles.celdaHeader}>N°</Text>
						<Text style={styles.celdaHeader}>Paradero</Text>
						<Text style={styles.celdaHeader}>Fecha</Text>
						<Text style={styles.celdaHeader}>Info</Text>
					</View>
					{viajes.map((viaje, idx) => {
						const filaEstilo = idx % 2 === 0 ? styles.filaBlanca : styles.filaGris;
						return (
							<View style={[styles.fila, filaEstilo]} key={viaje.id}>
								<Text style={styles.celda}>{idx + 1}</Text>
								<Text style={styles.celda}>{viaje.paradero}</Text>
								<Text style={styles.celda}>{viaje.fecha}</Text>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Button title="Info" onPress={() => {}} color="#b34040ff" />
								</View>
							</View>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
};

export default HistorialViajes;