import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	titulo: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#B71C1C',
		marginBottom: 16,
		textAlign: 'center',
	},
	tabla: {
		flex: 1,
		width: '98%',
		borderWidth: 2,
		borderColor: '#B71C1C',
		borderRadius: 8,
		overflow: 'hidden',
		minWidth: 320,
		alignSelf: 'center',
	},
	filaHeader: {
		flexDirection: 'row',
		backgroundColor: '#FF5252', // Rojo claro
		paddingVertical: 12,
	},
	celdaHeader: {
		minWidth: 120,
		flex: 1,
		fontWeight: 'bold',
		color: '#fff',
		textAlign: 'center',
		fontSize: 17,
		letterSpacing: 1,
		paddingHorizontal: 8,
	},
	fila: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
		paddingVertical: 12,
		width: '100%',
	},
	filaBlanca: {
		backgroundColor: '#fff',
	},
	filaGris: {
		backgroundColor: '#9a90916b', // Gris más oscuro
	},
	celda: {
		minWidth: 120,
		flex: 1,
		color: '#B71C1C',
		textAlign: 'center',
		fontSize: 16,
		paddingHorizontal: 8,
	},
});

export default styles;