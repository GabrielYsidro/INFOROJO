import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { generarLinkComparticion, revocarLinkComparticion } from '@/services/shareLocationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CompartirUbicacionScreen() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [linkActivo, setLinkActivo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tiempoExpiracion, setTiempoExpiracion] = useState<number>(3);

  useEffect(() => {
    // Obtener usuario_id del AsyncStorage
    const obtenerUsuario = async () => {
      try {
        const id = await AsyncStorage.getItem('usuario_id');
        if (id) {
          setUsuarioId(parseInt(id));
        } else {
          Alert.alert('Error', 'No se encontró ID de usuario. Inicia sesión primero.');
        }
      } catch (error) {
        console.error('Error al obtener usuario_id:', error);
      }
    };
    obtenerUsuario();
  }, []);

  const handleGenerarLink = async () => {
    if (!usuarioId) {
      Alert.alert('Error', 'No hay usuario identificado');
      return;
    }

    setLoading(true);
    try {
      const respuesta = await generarLinkComparticion(usuarioId);
      setToken(respuesta.token);
      setLinkActivo(respuesta.share_url);
      Alert.alert('✅ Éxito', 'Link de compartición generado. Válido por 3 horas.');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('❌ Error', 'No se pudo generar el link. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarLink = async () => {
    if (linkActivo) {
      await Clipboard.setStringAsync(linkActivo);
      Alert.alert('✅ Copiado', 'Link copiado al portapapeles');
    }
  };

  const handleCompartirLink = async () => {
    if (!linkActivo) return;

    try {
      // Usar Share API nativa
      const { Share } = require('react-native');
      await Share.share({
        message: `📍 Mira mi ubicación en vivo: ${linkActivo}`,
        url: linkActivo, // iOS
        title: 'Compartir Ubicación',
      });
    } catch (error) {
      console.error('Error al compartir:', error);
      // Fallback: copiar al portapapeles
      await handleCopiarLink();
    }
  };

  const handleRevocar = async () => {
    if (!token) return;

    Alert.alert(
      '⚠️ Confirmar',
      '¿Desactivas el link de compartición?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Desactivar',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await revocarLinkComparticion(token);
              if (success) {
                setLinkActivo(null);
                setToken(null);
                Alert.alert('✅ Revocado', 'El link ya no es válido');
              }
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>📍 Compartir Mi Ubicación</Text>
          <Text style={styles.subtitle}>
            Genera un link temporal para que otros vean tu ubicación en vivo
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>⏱️ El link expira en 3 horas</Text>
          <Text style={styles.infoText}>🔒 Seguro y privado</Text>
          <Text style={styles.infoText}>🗺️ Vista en tiempo real</Text>
        </View>

        {!linkActivo ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleGenerarLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔗 Generar Link</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.linkSection}>
            <View style={styles.linkBox}>
              <Text style={styles.linkLabel}>Tu link de compartición:</Text>
              <View style={styles.linkDisplay}>
                <Text style={styles.linkText} numberOfLines={2}>
                  {linkActivo}
                </Text>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleCopiarLink}
              >
                <Text style={styles.buttonText}>📋 Copiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSuccess]}
                onPress={handleCompartirLink}
              >
                <Text style={styles.buttonText}>📤 Compartir</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleRevocar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>🔒 Desactivar Link</Text>
              )}
            </TouchableOpacity>

            <View style={styles.statusBox}>
              <Text style={styles.statusTitle}>✅ Link Activo</Text>
              <Text style={styles.statusText}>
                Tu ubicación está siendo compartida en vivo
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    marginVertical: 4,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonSecondary: {
    backgroundColor: '#FF9800',
    flex: 1,
    marginRight: 8,
  },
  buttonSuccess: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 8,
  },
  buttonDanger: {
    backgroundColor: '#c62828',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  linkSection: {
    marginTop: 16,
  },
  linkBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  linkLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  linkDisplay: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  linkText: {
    fontSize: 12,
    color: '#2196F3',
    fontFamily: 'monospace',
  },
  statusBox: {
    backgroundColor: '#c8e6c9',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#558b2f',
  },
});
