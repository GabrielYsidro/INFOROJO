import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "./StylesRegistroNotificaciones";

interface Notificacion {
  id: string;
  tipo: "trafico" | "falla" | "viaje" | "alerta" | "general";
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
}

export default function RegistroNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: "1",
      tipo: "trafico",
      titulo: "Alerta de tráfico",
      descripcion: "Congestión reportada en Av. Arequipa.",
      fecha: "Hace 23 min",
      leida: false,
    },
    {
      id: "2",
      tipo: "falla",
      titulo: "Falla reportada",
      descripcion: "La unidad 405 presentó un desperfecto técnico.",
      fecha: "Hace 2 horas",
      leida: true,
    },
    {
      id: "3",
      tipo: "viaje",
      titulo: "Viaje completado",
      descripcion: "Tu viaje a Paradero B se registró correctamente.",
      fecha: "Ayer 10:30 a.m.",
      leida: true,
    },
  ]);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "trafico":
        return "traffic-light";
      case "falla":
        return "alert-circle-outline";
      case "viaje":
        return "bus";
      case "alerta":
        return "bell-alert-outline";
      default:
        return "information-outline";
    }
  };

  const renderItem = ({ item }: { item: Notificacion }) => (
    <TouchableOpacity style={[styles.card, !item.leida && styles.cardNoLeida]}>
      <View style={styles.iconContainer}>
        <Icon name={getIcon(item.tipo)} size={26} color="#F04C4C" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <Text style={styles.fecha}>{item.fecha}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Notificaciones</Text>
        <TouchableOpacity>
          <Icon name="bell-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de notificaciones */}
      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Botón limpiar */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => setNotificaciones([])}
      >
        <Text style={styles.clearText}>Limpiar todo</Text>
      </TouchableOpacity>
    </View>
  );
}
