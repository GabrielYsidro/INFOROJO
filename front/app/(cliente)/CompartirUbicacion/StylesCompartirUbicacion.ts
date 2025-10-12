import { StyleSheet } from 'react-native';

console.log("✅ Archivo de estilos cargado correctamente");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 40,
    color: '#1E293B',
  },
  mapContainer: {
    flex: 1,
    marginVertical: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  shareButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
