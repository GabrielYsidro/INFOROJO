import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'arrival' | 'delay' | 'cancelled' | 'info';
  isRead: boolean;
  route: string;
  busNumber: string;
}

export default function NotificacionesScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: '¡Tu bus ha llegado!',
      message: 'El bus Ruta 15 ha llegado a la parada "Centro Comercial"',
      time: 'Hace 2 min',
      type: 'arrival',
      isRead: false,
      route: 'Ruta 15',
      busNumber: 'BUS-001'
    },
    {
      id: '2',
      title: 'Retraso en el servicio',
      message: 'El bus Ruta 8 tendrá un retraso de 15 minutos debido al tráfico',
      time: 'Hace 10 min',
      type: 'delay',
      isRead: false,
      route: 'Ruta 8',
      busNumber: 'BUS-002'
    },
    {
      id: '3',
      title: 'Servicio cancelado',
      message: 'El bus Ruta 12 ha sido cancelado por mantenimiento',
      time: 'Hace 1 hora',
      type: 'cancelled',
      isRead: true,
      route: 'Ruta 12',
      busNumber: 'BUS-003'
    },
    {
      id: '4',
      title: 'Nueva ruta disponible',
      message: 'Se ha agregado la Ruta 25 que conecta el centro con la zona norte',
      time: 'Ayer',
      type: 'info',
      isRead: true,
      route: 'Ruta 25',
      busNumber: 'N/A'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'arrival':
        return 'checkmark.circle.fill';
      case 'delay':
        return 'clock.fill';
      case 'cancelled':
        return 'xmark.circle.fill';
      case 'info':
        return 'info.circle.fill';
      default:
        return 'bell.fill';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'arrival':
        return '#4CAF50';
      case 'delay':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      case 'info':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Limpiar notificaciones',
      '¿Estás seguro de que quieres marcar todas las notificaciones como leídas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          onPress: () => setNotifications(prev => 
            prev.map(notif => ({ ...notif, isRead: true }))
          )
        }
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Notificaciones</ThemedText>
        {unreadCount > 0 && (
          <ThemedView style={styles.badge}>
            <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Actions */}
      <ThemedView style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={clearAllNotifications}
        >
          <IconSymbol name="checkmark.circle.fill" size={20} color="#2196F3" />
          <ThemedText style={styles.actionText}>Marcar todas como leídas</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadCard
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <ThemedView style={styles.notificationHeader}>
              <ThemedView style={styles.notificationIcon}>
                <IconSymbol 
                  name={getNotificationIcon(notification.type)} 
                  size={24} 
                  color={getNotificationColor(notification.type)} 
                />
              </ThemedView>
              <ThemedView style={styles.notificationContent}>
                <ThemedText 
                  type="subtitle" 
                  style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadText
                  ]}
                >
                  {notification.title}
                </ThemedText>
                <ThemedText style={styles.notificationMessage}>
                  {notification.message}
                </ThemedText>
                <ThemedView style={styles.notificationMeta}>
                  <ThemedText style={styles.routeText}>
                    {notification.route} • {notification.busNumber}
                  </ThemedText>
                  <ThemedText style={styles.timeText}>
                    {notification.time}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
                {!notification.isRead && (
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#2196F3" />
                )}
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty State */}
      {notifications.length === 0 && (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="bell.fill" size={64} color="#BDBDBD" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No hay notificaciones
          </ThemedText>
          <ThemedText style={styles.emptyMessage}>
            Te notificaremos cuando haya actualizaciones sobre tus viajes
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 8,
    color: '#2196F3',
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: 4,
    color: '#212121',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#757575',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#9E9E9E',
    lineHeight: 20,
  },
});
