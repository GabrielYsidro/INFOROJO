import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#c62828',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center title
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
    paddingBottom: 80, // Add padding to the bottom to avoid overlap with the button
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#c62828',
    elevation: 2,
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  volverButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#c62828',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
  },
  volverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
