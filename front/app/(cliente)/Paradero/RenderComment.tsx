import { Comment } from '@/services/paraderoComentarioService';
import { diasTranscurridos } from '@/services/utils';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './StylesParaderoComentarios';

type RenderCommentProps = {
  comment: Comment;
  userId: number;
  onEdit: () => void;
  onDelete: () => void;
};

const RenderComment: React.FC<RenderCommentProps> = ({ comment, userId, onEdit,onDelete }) => {
  return (
    <View style={styles.commentRow}>
      <View style={styles.commentContent}>

        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{comment.nombre_usuario}</Text>
          <Text style={styles.commentTime}>
            {diasTranscurridos(comment.created_at)}
          </Text>
        </View>

        <Text style={styles.commentText}>{comment.comentario}</Text>

        {comment.id_usuario === userId && (
          <View style={styles.settingsStyle}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <MaterialIcons name="edit" size={25} color="#F4695A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <MaterialIcons name="delete" size={25} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

      </View>
    </View>
  );
};

export default RenderComment;
