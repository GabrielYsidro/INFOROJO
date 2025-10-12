import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // estilo cuando se usa como pantalla completa
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 0 },
  // estilo para el contenido del modal centrado (similar a StylesReporteDesvio.container)
  containerModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 4,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    width: '100%',
    marginBottom: 8,
  },
  section: { marginBottom: 18, paddingHorizontal: 16 },
  label: { fontSize: 16, marginBottom: 8, color: '#222' },
  pickerContainer: {
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  picker: {
    backgroundColor: 'transparent',
    height: 48,
    width: '100%',
    fontSize: 18,
    paddingHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 12,
    width: '100%',
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    color: '#222',
    fontSize: 18,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginHorizontal: 16,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});