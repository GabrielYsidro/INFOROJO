import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Comment, ParaderoInfo, getCommentsByParadero, postComentario } from '../../../services/paraderoComentarioService';
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

const [commentText, setCommentText] = useState<string>('');
const fetchParaderoData = async () => {
    
    const data = await getCommentsByParadero(paradero_nombre);
    setParaderoInfo(data.paradero);

    setComments(data.comentarios);
    console.log(data);
  }
useEffect(() => {
  
  fetchParaderoData();
}, []);

const enviarComentario = async () => {
  // Lógica para enviar el comentario al servidor
  console.log('Enviando comentario:', commentText);
  // Después de enviar, limpiar el campo de texto
  // (token, id_paradero, comentario)
  const token : string | null = await AsyncStorage.getItem('token');
  if(!token) {
    console.log('No hay token disponible para enviar el comentario.');
    return;
  }
  postComentario(token, paraderoInfo.id_paradero, commentText);
  setCommentText('');
  fetchParaderoData();
}
function diasTranscurridos(fechaISO: string): string {
  const fecha = new Date(fechaISO);       // Fecha del dato
  const ahora = new Date();               // Fecha actual

  const diffMs = ahora.getTime() - fecha.getTime();  // Diferencia en ms

  const dias = diffMs / (1000 * 60 * 60 * 24);        // Convertir a días

  return 'hace '+Math.floor(dias)+' días';
}

  const renderComment = ({item}:{ item: Comment }) => (
    <View style={styles.commentRow}>
      {/*<Image source={{ uri: item.avatar }} style={styles.avatar} />*/}
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.nombre_usuario}</Text>
          <Text style={styles.commentTime}>{diasTranscurridos(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.comentario}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{paraderoInfo.nombre}</Text>

        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.content}>
          {/* Foto del paradero */}
          <Image
            style={styles.mainImage}
            source={{
              uri: paraderoInfo.imagen_url? paraderoInfo.imagen_url : 'https://media.istockphoto.com/id/1147544807/es/vector/no-imagen-en-miniatura-gr%C3%A1fico-vectorial.jpg?s=612x612&w=0&k=20&c=Bb7KlSXJXh3oSDlyFjIaCiB9llfXsgS7mHFZs6qUgVk=',
            }}
          />

          {/* Título comentarios */}
          <Text style={styles.sectionTitle}>Comentarios</Text>

          {/* Lista de comentarios */}
          {comments? <FlatList
            data={comments}
            //keyExtractor={(item) => item.id.toString()}
            renderItem={renderComment}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentsList}
          />: <Text>No hay comentarios disponibles.</Text>}
        </View>

        {/* Caja de mensaje */}
        <View style={styles.inputBar}>
          <View style={styles.messageBox}>
            <TextInput
              placeholder="Message..."
              style={styles.textInput}
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity>
              <Ionicons name="mic-outline" size={22} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={enviarComentario}>
            <Ionicons name="paper-plane" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ParaderoCommentsScreen;

