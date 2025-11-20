import { Comment } from '@/services/paraderoComentarioService';
import { diasTranscurridos } from '@/services/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './StylesParaderoComentarios';
const RenderComment = (item:Comment, id_usuario:number) => {
    return (
      <View style={styles.commentRow}>
      {/*<Image source={{ uri: item.avatar }} style={styles.avatar} />*/}
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.nombre_usuario}</Text>
          <Text style={styles.commentTime}>{diasTranscurridos(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.comentario}</Text>
        {item.id_usuario === id_usuario && (
          <View style={ styles.settingsStyle}>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={25} color={'#F4695A'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <MaterialIcons name="delete" size={25} color={'#FFFFFF'}/>
          </TouchableOpacity>
        </View>
        )}
      </View>
    </View>
    );
}
export default RenderComment;