import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Modal, Share, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import getUsers from "@/services/userService";
import { generarLinkComparticion, revocarLinkComparticion } from "@/services/shareLocationService";
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
  const [linkComparticion, setLinkComparticion] = useState<string | null>(null);
  const [tokenComparticion, setTokenComparticion] = useState<string | null>(null);
  const [mostrarModalCompartir, setMostrarModalCompartir] = useState(false);
  const [generandoLink, setGenerandoLink] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {

        //Chapar el userId del AS
        const idStr = await AsyncStorage.getItem("userId");
        if (!idStr) throw new Error("No se encontró el ID de usuario en AsyncStorage");
        const id_usuario = parseInt(idStr, 10);

        //Llamar al servicio de usuario
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
      router.push("../login");
    } catch (e) {
      Alert.alert("Error", "No se pudo cerrar sesión correctamente");
      console.error(e);
    }
  };

  const handleGenerarLinkComparticion = async () => {
    if (!usuario) return;
    
    setGenerandoLink(true);
    try {
      const respuesta = await generarLinkComparticion(usuario.id_usuario);
      setTokenComparticion(respuesta.token);
      setLinkComparticion(respuesta.share_url);
      setMostrarModalCompartir(true);
      Alert.alert("✅ Éxito", "Link de compartición generado");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("❌ Error", "No se pudo generar el link");
    } finally {
      setGenerandoLink(false);
    }
  };

  const handleCopiarLink = async () => {
    if (!linkComparticion) return;
    // Usar Share para copiar o compartir
    try {
      await Share.share({
        message: `📍 Mira mi ubicación en vivo: ${linkComparticion}`,
        url: linkComparticion,
        title: "Compartir Mi Ubicación",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRevocarLink = async () => {
    if (!tokenComparticion) return;
    
    Alert.alert(
      "⚠️ Confirmar",
      "¿Desactivas el link de compartición?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Desactivar",
          onPress: async () => {
            try {
              await revocarLinkComparticion(tokenComparticion);
              setLinkComparticion(null);
              setTokenComparticion(null);
              setMostrarModalCompartir(false);
              Alert.alert("✅ Revocado", "El link ya no es válido");
            } catch (error) {
              Alert.alert("❌ Error", "No se pudo revocar el link");
            }
          },
          style: "destructive",
        },
      ]
    );
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

      {/* 📍 Botón de Compartir Ubicación */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: "#4CAF50", marginBottom: 12 }]} 
        onPress={handleGenerarLinkComparticion}
        disabled={generandoLink}
      >
        <Text style={styles.logoutText}>
          {generandoLink ? "Generando..." : "📍 Compartir Mi Ubicación"}
        </Text>
      </TouchableOpacity>

      {/* 🔴 Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Modal para compartir ubicación */}
      <Modal
        visible={mostrarModalCompartir}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalCompartir(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Compartir Ubicación</Text>
              <TouchableOpacity onPress={() => setMostrarModalCompartir(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {linkComparticion && (
              <View style={styles.content}>
                <View style={styles.linkBox}>
                  <Text style={styles.linkLabel}>Tu link de compartición:</Text>
                  <View style={styles.linkDisplay}>
                    <Text style={styles.linkText} numberOfLines={3}>
                      {linkComparticion}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleCopiarLink}
                  >
                    <Text style={styles.buttonText}>📤 Compartir por Mensaje</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonDanger]}
                    onPress={handleRevocarLink}
                  >
                    <Text style={styles.buttonText}>🔒 Desactivar Link</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>⏱️ Válido por 3 horas</Text>
                  <Text style={styles.infoText}>🗺️ Ubicación en tiempo real</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );    
}
