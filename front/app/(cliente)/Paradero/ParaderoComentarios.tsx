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
// Si usas Expo:
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './StylesParaderoComentarios';

type Comment = {
  id: string;
  name: string;
  time: string;
  text: string;
};

const comments : Comment[] = [
  {
    id: '1',
    name: 'Cristina',
    time: '2d',
    text: 'Estuve esperando 30 minutos y el bus nunca llegó.',
  },
  {
    id: '2',
    name: 'Jose',
    time: '1d',
    text: 'La semana pasada el bus llegó puntual y el conductor fue muy amable.',
  },
  {
    id: '3',
    name: 'Aldo',
    time: '2d',
    text: 'El paradero estaba muy sucio y desordenado.',
  },
];

const ParaderoCommentsScreen = () => {
    const router = useRouter();
  const renderComment = ({item}:{ item: Comment }) => (
    <View style={styles.commentRow}>
      {/*<Image source={{ uri: item.avatar }} style={styles.avatar} />*/}
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.name}</Text>
          <Text style={styles.commentTime}>{item.time}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
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

        <Text style={styles.headerTitle}>Salaverry</Text>

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
              uri: 'https://lamula.pe/media/uploads/t/7dcbc7e8e50864b1253331e1c7b72dd0.jpg',
            }}
          />

          {/* Título comentarios */}
          <Text style={styles.sectionTitle}>Comentarios</Text>

          {/* Lista de comentarios */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentsList}
          />
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

