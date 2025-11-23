import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import styles from "./StylesParaderoComentarios";

type ParaderoHeaderProps = {
nombre: string;
  back: () => void;
};

const ParaderoHeader: React.FC<ParaderoHeaderProps> = ({nombre,back}) => {
    return (<View style={styles.header}>
        <TouchableOpacity onPress={() => back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{nombre}</Text>

        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color="#fff" />
        </TouchableOpacity>
      </View>);
}
export default ParaderoHeader;