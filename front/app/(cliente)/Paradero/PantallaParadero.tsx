import { Comment, ParaderoInfo, postComentario } from '@/services/paraderoComentarioService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RenderComment from './RenderComment';
import styles from './StylesParaderoComentarios';

type PantallaParaderoProps = {
  paraderoInfo: ParaderoInfo;
  comments: Comment[];
  userId: number;
  onRefresh: () => Promise<void>;
  token: string | null;
  onEditComment: (comment: Comment) => void;
  onDeleteComment: (comment: Comment) => void;
};

const PantallaParadero: React.FC<PantallaParaderoProps> = ({
  paraderoInfo,
  comments,
  userId,
  onRefresh,
  token,
  onEditComment,
  onDeleteComment,
}) => {
  const [commentText, setCommentText] = useState<string>('');

  const enviarComentario = async () => {
    const textoLimpio = commentText.trim();
    if (!textoLimpio) return;

    if (!token) {
      console.log('No hay token disponible para enviar el comentario.');
      return;
    }

    console.log('Enviando comentario:', textoLimpio);

    try {
      await postComentario(token, paraderoInfo.id_paradero, textoLimpio);
      setCommentText('');
      await onRefresh(); // Recargar paradero + comentarios
    } catch (error) {
      console.log('Error al enviar comentario:', error);
    }
  };

  return (
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
            uri: paraderoInfo.imagen_url
              ? paraderoInfo.imagen_url
              : 'https://media.istockphoto.com/id/1147544807/es/vector/no-imagen-en-miniatura-gr%C3%A1fico-vectorial.jpg?s=612x612&w=0&k=20&c=Bb7KlSXJXh3oSDlyFjIaCiB9llfXsgS7mHFZs6qUgVk=',
          }}
        />

        {/* Título comentarios */}
        <Text style={styles.sectionTitle}>Comentarios</Text>

        {/* Lista de comentarios */}
        {comments && comments.length > 0 ? (
          <FlatList
            data={comments}
            keyExtractor={(item, index) =>
              // ajusta esto al campo real de tu modelo (ej: item.id_comentario)
              (item as any).id?.toString() ?? index.toString()
            }
            renderItem={({ item }) => (
              <RenderComment comment={item} userId={userId} onEdit={() => onEditComment(item)}
  onDelete={() => onDeleteComment(item)}/>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentsList}
          />
        ) : (
          <Text>No hay comentarios disponibles.</Text>
        )}
      </View>

      {/* Caja de mensaje */}
      <View style={styles.inputBar}>
        <View style={styles.messageBox}>
          <TextInput
            placeholder="Escribe un comentario..."
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
  );
};

export default PantallaParadero;
