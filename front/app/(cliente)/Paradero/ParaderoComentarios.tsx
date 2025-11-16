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
import { Comment, ParaderoInfo, getCommentsByParadero } from '../../../services/paraderoComentarioService';
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

useEffect(() => {
  const fetchParaderoData = async () => {
    console.log('Paradero nombre recibido en comentarios:', paradero_nombre);
    const data = await getCommentsByParadero(paradero_nombre);
    setParaderoInfo(data.paradero);

    setComments(data.comentarios);
  }
  fetchParaderoData();
}, []);
  const renderComment = ({item}:{ item: Comment }) => (
    <View style={styles.commentRow}>
      {/*<Image source={{ uri: item.avatar }} style={styles.avatar} />*/}
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.nombre_usuario}</Text>
          <Text style={styles.commentTime}>{item.created_at}</Text>
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
              uri: paraderoInfo.imagen_url? paraderoInfo.imagen_url : 'https://via.placeholder.com/300x200.png?text=No+Image',
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
            />
            <TouchableOpacity>
              <Ionicons name="mic-outline" size={22} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="paper-plane" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ParaderoCommentsScreen;

