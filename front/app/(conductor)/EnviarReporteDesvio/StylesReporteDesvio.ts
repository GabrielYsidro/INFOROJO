import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    headerRow: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        textAlign: 'center',
    },
    fieldRow: {
        marginTop: 10,
    },
    picker: {
        marginTop: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
    },
    textarea: {
        marginTop: 6,
        minHeight: 80,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 10,
        textAlignVertical: 'top',
        color: '#111827',
        backgroundColor: '#FAFAFA',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 16,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    buttonSend: {
        backgroundColor: '#FF6B6B',
    },
    buttonText: {
        color: '#111827',
        fontWeight: '600',
    },
        searchInput: {
            marginTop: 8,
            marginBottom: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            backgroundColor: '#fff',
        },
        modalListContainer: {
            maxHeight: 240,
        },
        modalItem: {
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6',
        },
        modalItemText: {
            fontSize: 16,
        },
});

export default styles;