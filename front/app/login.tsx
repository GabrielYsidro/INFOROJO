import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./StylesLogin";
import { login } from "@/services/AuthService";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !dni) {
      Alert.alert("Error", "Debes completar todos los campos");
      return;
    }

    setLoading(true);
    try {
      const { access_token, token_type, usuario } = await login(username, dni);
      const { id_usuario, nombre, correo, rol } = usuario;

      await AsyncStorage.setItem("token", access_token);
      await AsyncStorage.setItem("role", rol);
      await AsyncStorage.setItem("userId", id_usuario.toString());
      await AsyncStorage.setItem("userName", nombre);
      await AsyncStorage.setItem("userEmail", correo);

      // Redirigir según rol
      switch (rol) {
        case "cliente":
          router.replace("/(cliente)");
          break;
        case "conductor":
          router.replace("/(conductor)");
          break;
        case "regulador":
          router.replace("/(regulador)");
          break;
        default:
          router.replace("/login");
      }
    } catch (err: any) {
      Alert.alert("Error de login", err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Info Rojo</Text>
      <Text style={styles.subtitle}>Ingresa a tu cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="example@gmail.com"
        placeholderTextColor="#fff"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="DNI"
        placeholderTextColor="#fff"
        secureTextEntry
        value={dni}
        onChangeText={setDni}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Ingresando..." : "Ingresar"}</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Si no tienes una cuenta entonces{" "}
        <Text style={styles.registerLink}>
          Regístrate aquí.
        </Text>
      </Text>
    </View>
  );
};