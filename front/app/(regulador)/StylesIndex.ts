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
        flexWrap: 'wrap', // Allow buttons to wrap to the next line
        justifyContent: 'space-around',
        marginTop: 32,
        marginBottom: 12,
        paddingHorizontal: 5, // Add some horizontal padding to the container
    },
    topButton: {
        flex: 1, // Make buttons take equal space
        minWidth: '45%', // Ensure buttons don't get too small
        marginHorizontal: 5, // Add some margin between buttons
        marginBottom: 10, // Add some bottom margin for wrapping
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content within the button
        backgroundColor: '#c62828',
        paddingVertical: 8, // Reduced padding
        paddingHorizontal: 12, // Reduced padding
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
        marginLeft: 6, // Slightly reduced margin
        fontSize: 14, // Reduced font size
        textAlign: 'center',
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