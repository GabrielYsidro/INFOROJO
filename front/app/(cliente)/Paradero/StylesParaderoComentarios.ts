import { StyleSheet } from "react-native";

export const PRIMARY = '#F4695A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 56,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  mainImage: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  commentsList: {
    paddingBottom: 16,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  commentName: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  commentTime: {
    fontSize: 13,
    color: '#999',
  },
  commentText: {
    marginTop: 2,
    fontSize: 14,
    color: '#555',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  settingsStyle: {
    fontSize: 25,
    
    position: 'absolute',
    flexDirection: 'row', marginTop: 0,
    right: 0,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    right: 0,
    padding: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    right: 0,
    padding: 2,
  },
  messageBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;