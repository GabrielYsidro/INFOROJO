import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import getUsers from "@/services/userService";
import styles from "./StylesCuentaUsuario";
import { Ionicons } from '@expo/vector-icons';

interface Conductor {
  id_usuario: number;
  nombre: string;
  correo: string;
  cod_empleado: string;
  placa_unidad: string;
  ubicacion_actual_lat?: number;
  ubicacion_actual_lng?: number;
}

export default function CuentaConductor() {

  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Función para capitalizar la primera letra de cada palabra del nombre
  const formatNombre = (nombre: string) => {
    return nombre
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const fetchConductor = async () => {
      try {
        const idStr = await AsyncStorage.getItem("userId");
        if (!idStr) throw new Error("No se encontró el ID de usuario en AsyncStorage");
        const id_usuario = parseInt(idStr, 10);

        const data = await getUsers.getUsers(id_usuario);
        setConductor(data);
      } catch (error: any) {
        console.error(error);
        Alert.alert("Error", error.message || "No se pudo cargar la información del conductor");
      } finally {
        setLoading(false);
      }
    };

    fetchConductor();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/login" as any);
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

  if (!conductor) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No se encontró la información del conductor</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
      <Text style={styles.title}>Mi Cuenta</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{formatNombre(conductor.nombre)}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{conductor.correo}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Código:</Text>
        <Text style={styles.value}>{conductor.cod_empleado}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Placa:</Text>
        <Text style={styles.value}>{conductor.placa_unidad}</Text>
      </View>

      {/* 🔴 Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );    
}
