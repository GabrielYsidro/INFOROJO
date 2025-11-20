import { getMe } from '@/services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { Comment, ParaderoInfo, getCommentsByParadero } from '../../../services/paraderoComentarioService';
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

const [comments, setComments] = useState<Comment[]> ([]);

const { paradero_nombre } = useLocalSearchParams<{ paradero_nombre: string }>();

const [userData, setUserData] = useState<number>(0);
const [token, setToken]= useState<string | null>(null);


const fetchToken = async () => {
  const storedToken = await AsyncStorage.getItem('token');
  setToken(storedToken);
}

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
  }
useEffect(() => {
  fetchToken();
}, []);

useEffect(() => {
  if (token) {
    fetchParaderoData();
  }
}, [token]);

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
/>
    </SafeAreaView>
  );
};

export default ParaderoCommentsScreen;

