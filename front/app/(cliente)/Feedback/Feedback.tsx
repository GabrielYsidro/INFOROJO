import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import AppModal from "@/components/Modals/AppModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import styles from "./StylesFeedback";
import AuthService from "@/services/AuthService";
import { sendFeedback } from "@/services/feedbackService";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSent?: () => void;
};

export default function FeedbackModal({ visible, onClose, onSent }: Props) {
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setMensaje("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  async function handleSend() {
    if (!mensaje.trim()) {
      Alert.alert("Validación", "El mensaje es requerido.");
      return;
    }

    setLoading(true);

    // intentar obtener id de usuario de la sesión para enviar en header (no obligatorio)
    let xUserId: string | undefined;
    try {
      const user = await (AuthService as any).getCurrentUser?.() ?? (AuthService as any).getUser?.();
      if (user) xUserId = String(user.id ?? user.id_usuario ?? user.usuario_id ?? user.uid);
    } catch (e) {
      console.warn("AuthService.getCurrentUser error:", e);
    }

    try {
      await sendFeedback(
        {
          mensaje: mensaje.trim(),
          origen: "app_cliente",
        },
        { xUserId }
      );

      Alert.alert("Enviado", "Gracias por tu feedback.");
      onSent?.();
      handleClose();
    } catch (err: any) {
      console.error("Feedback error:", err);
      const msg = err?.body?.detail || err?.message || "No se pudo enviar el feedback.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppModal visible={visible} onClose={handleClose}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>Enviar feedback</ThemedText>
        </View>

        <View style={styles.fieldRow}>
          <ThemedText type="defaultSemiBold">Comentario</ThemedText>
          <TextInput
            placeholder="Escriba su feedback del servicio"
            placeholderTextColor="#9CA3AF"
            value={mensaje}
            onChangeText={setMensaje}
            multiline
            style={[styles.textarea, { minHeight: 100 }]}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={handleClose} disabled={loading}>
            <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSend]} onPress={handleSend} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={[styles.buttonText, { color: "#fff" }]}>Enviar</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </AppModal>
  );
}