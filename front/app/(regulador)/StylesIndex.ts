import { Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.6;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 32,
        marginBottom: 12,
    },
    topButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#c62828',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 18,
        elevation: 3,
        shadowColor: '#c62828',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    topButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    mapContainer: {
        height: MAP_HEIGHT,
        borderRadius: 18,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#c62828',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
    },
    navButton: {
        alignItems: 'center',
    },
    navButtonActive: {
        alignItems: 'center',
        backgroundColor: '#c62828',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 16,
    },
    navButtonText: {
        color: '#c62828',
        fontSize: 14,
        marginTop: 4,
        fontWeight: 'bold',
    },
    navButtonTextActive: {
        color: '#fff',
        fontSize: 14,
        marginTop: 4,
        fontWeight: 'bold',
    },
});

export default styles;