import AppModal from '@/components/Modals/AppModal';
import { getMe } from '@/services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Comment,
  ParaderoInfo,
  deleteComentario,
  editComentario,
  getCommentsByParadero,
} from '../../../services/paraderoComentarioService';
import PantallaParadero from './PantallaParadero';
import ParaderoHeader from './ParaderoHeader';
import styles from './StylesParaderoComentarios';

const ParaderoCommentsScreen = () => {
  const router = useRouter();

  const [paraderoInfo, setParaderoInfo] = useState<ParaderoInfo>({
    id_paradero: 0,
    nombre: 'No encontrado',
    imagen_url: null,
  });

  const [comments, setComments] = useState<Comment[]>([]);
  const { paradero_nombre } = useLocalSearchParams<{ paradero_nombre: string }>();

  const [userData, setUserData] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);

  const [modalEditVisible, setModalEditVisible] = useState<boolean>(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>('');

  // Modal variables
  const [commentId, setCommentId] = useState<number>(0);
  const [newText, setNewText] = useState<string>('');

  const fetchToken = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    setToken(storedToken);
  };

  const fetchParaderoData = async () => {
    if (!token) {
      console.log('No hay token disponible para obtener los datos del paradero.');
      return;
    }

    const user = await getMe(token);
    setUserData(user.id_usuario);

    const data = await getCommentsByParadero(paradero_nombre);
    setParaderoInfo(data.paradero);
    setComments(data.comentarios);
  };

  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchParaderoData();
    }
  }, [token]);

  // ==== HANDLERS PARA LOS ICONOS ====

  const handleEditPress = (comment: Comment) => {
    setCommentId(comment.id_comentario);
    setNewText(comment.comentario);
    setEditText(comment.comentario);
    setModalEditVisible(true);
  };

  const handleDeletePress = (comment: Comment) => {
    setCommentId(comment.id_comentario);
    setModalDeleteVisible(true);
  };

  // ==== CONFIRMAR MODAL EDIT ====

  const handleConfirmEdit = async () => {
    if (!token) return;
    try {
      await editComentario(token,commentId, newText);
      setModalEditVisible(false);
      await fetchParaderoData();
    } catch (error) {
      console.log('Error al actualizar comentario', error);
    }
  };

  // ==== CONFIRMAR MODAL DELETE ====

  const handleConfirmDelete = async () => {
    if (!token) return;
    try {
      await deleteComentario(token, commentId);
      setModalDeleteVisible(false);
      await fetchParaderoData();
    } catch (error) {
      console.log('Error al eliminar comentario', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ParaderoHeader nombre={paraderoInfo.nombre} back={() => router.back()} />

      <PantallaParadero
        paraderoInfo={paraderoInfo}
        comments={comments}
        userId={userData}
        onRefresh={fetchParaderoData}
        token={token}
        // NUEVAS PROPS PARA QUE LOS ICONOS LLAMEN A LOS MODALES:
        onEditComment={handleEditPress}
        onDeleteComment={handleDeletePress}
      />

      {/* MODAL EDITAR */}
<AppModal visible={modalEditVisible} onClose={() => setModalEditVisible(false)}>
  <View
    style={{
      backgroundColor: "white",
      width: "100%",
      padding: 20,
      borderRadius: 12,
      gap: 16,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: "600" }}>Editar comentario</Text>

    <TextInput
      value={newText}
      onChangeText={setNewText}
      multiline
      style={{
        backgroundColor: "#f2f2f2",
        padding: 10,
        borderRadius: 8,
        minHeight: 100,
        textAlignVertical: "top",
      }}
    />

    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
      <TouchableOpacity onPress={() => setModalEditVisible(false)}>
        <Text style={{ fontSize: 16, color: "#666" }}>Cancelar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleConfirmEdit}>
        <Text style={{ fontSize: 16, color: "#F4695A", fontWeight: "600" }}>
          Guardar
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</AppModal>


      {/* MODAL ELIMINAR */}
<AppModal
  visible={modalDeleteVisible}
  onClose={() => setModalDeleteVisible(false)}
>
  <View
    style={{
      backgroundColor: "white",
      width: "100%",
      padding: 20,
      borderRadius: 12,
      gap: 16,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: "600" }}>
      Eliminar comentario
    </Text>

    <Text style={{ fontSize: 16 }}>
      ¿Seguro que deseas eliminar este comentario?
    </Text>

    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
      <TouchableOpacity onPress={() => setModalDeleteVisible(false)}>
        <Text style={{ fontSize: 16, color: "#666" }}>Cancelar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleConfirmDelete}>
        <Text style={{ fontSize: 16, color: "red", fontWeight: "600" }}>
          Eliminar
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</AppModal>

    </SafeAreaView>
  );
};

export default ParaderoCommentsScreen;
