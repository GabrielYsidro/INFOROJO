import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { getFeedback } from '@/services/feedbackService';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './StylesVerFeedback';

interface Feedback {
  id_feedback: number;
  comentario: string;
  fecha: string;
  fecha_corta: string;
}

export default function VerFeedbackScreen() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await getFeedback();
        setFeedbackList(response.feedback || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el feedback');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const renderItem = ({ item }: { item: Feedback }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.commentText}>{item.comentario}</Text>
      <Text style={styles.dateText}>{item.fecha_corta}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback de Usuarios</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c62828" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={feedbackList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_feedback.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay feedback para mostrar.</Text>}
        />
      )}

      <TouchableOpacity onPress={() => router.replace('/(regulador)/')} style={styles.volverButton}>
        <Text style={styles.volverButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
