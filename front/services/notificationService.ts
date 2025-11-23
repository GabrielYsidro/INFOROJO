import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './AuthService';
import messaging from '@react-native-firebase/messaging'; // Importar Firebase Messaging

// --- CONFIGURACIÓN DE MANEJO EN PRIMER PLANO ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Add this line
    shouldShowList: false,   // Add this line
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('¡Error! No se pudo obtener el token para las notificaciones push.');
      return;
    }
    try {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      token = deviceToken.data;
      console.log('✅ Token de Notificación:', token);
    } catch (error) {
        console.error('❌ Error al obtener el token de notificación:', error);
        return;
    }
  } else {
    console.log('Debe usar un dispositivo físico para las notificaciones Push.');
  }

  // --- SUSCRIPCIÓN A TEMA ---
  try {
    // Suscribir al dispositivo al tema 'all_users'
    await messaging().subscribeToTopic('all_users');
    console.log('✅ Suscrito al tema: all_users');
  } catch (error) {
    console.error('❌ Error al suscribirse al tema:', error);
  }


  // --- ENVIAR TOKEN AL BACKEND ---
  if (token) {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await fetch(`${API_URL}/usuario/registrar-fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId, 10),
            fcm_token: token,
          }),
        });
        if (response.ok) {
          console.log('✅ FCM Token enviado al backend correctamente');
        } else {
          console.error('❌ Error al enviar FCM token al backend:', response.status);
        }
      } else {
        console.warn('⚠️ userId no encontrado en AsyncStorage, no se pudo registrar el token en el backend.');
      }
    } catch (error) {
      console.error('❌ Error al registrar FCM token en el backend:', error);
    }
  }

  return token;
}

export default registerForPushNotificationsAsync;
