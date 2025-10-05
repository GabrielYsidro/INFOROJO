import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity  } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import getUsers from "@/services/userService";
import styles from "./StylesCuentaUsuario";


interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
}

export default function Cuenta() {

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        // 1️⃣ Obtiene el ID de usuario desde AsyncStorage
        const idStr = await AsyncStorage.getItem("userId");
        if (!idStr) throw new Error("No se encontró el ID de usuario en AsyncStorage");

        const id_usuario = parseInt(idStr, 10);

        // 2️⃣ Llama al servicio para obtener los datos
        const data = await getUsers.getUsers(id_usuario);
        setUsuario(data);
      } catch (error: any) {
        console.error(error);
        Alert.alert("Error", error.message || "No se pudo cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/login"); // redirige y evita volver atrás
    } catch (e) {
      Alert.alert("Error", "No se pudo cerrar sesión correctamente");
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#c62828" />
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No se encontró la información del usuario</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Cuenta</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{usuario.nombre}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{usuario.correo}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Rol:</Text>
        <Text style={styles.value}>{usuario.rol}</Text>
      </View>

      {/* 🔴 Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );    
}
