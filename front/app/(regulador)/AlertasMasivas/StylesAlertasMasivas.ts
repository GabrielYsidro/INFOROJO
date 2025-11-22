import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#c62828',
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#c62828',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
        minHeight: 50,
        textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#c62828',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    reportesList: {
        maxHeight: 300,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    reporteItem: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#c62828',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    reporteDescripcion: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    reporteFecha: {
        fontSize: 12,
        color: '#666',
    },
    reporteCritica: {
        fontSize: 12,
        color: '#c62828',
        fontWeight: 'bold',
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        marginTop: 20,
    },
    buttonContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        gap: 12,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonGuardar: {
        backgroundColor: '#2e7d32',
        shadowColor: '#2e7d32',
    },
    buttonEnviar: {
        backgroundColor: '#1565c0',
        shadowColor: '#1565c0',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        shadowColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginLeft: 8,
        marginTop: 8,
    },
    backButtonText: {
        color: '#c62828',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
});

export default styles;
