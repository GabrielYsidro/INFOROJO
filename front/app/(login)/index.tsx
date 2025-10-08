import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import styles from './StylesLogin'

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.replace("/(tabs)/" as any);
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
        placeholder="Contraseña"
        placeholderTextColor="#fff"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
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