import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './AuthService';

// --- CONFIGURACIÓN DE MANEJO EN PRIMER PLANO ---
// Esto es necesario para que las notificaciones se muestren 
// cuando la app está activa (en Android se muestra por defecto, pero es buena práctica)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    // Esto es vital para Android: configura canales de notificación
    await Notifications.setNotificationChannelGroupAsync('default', {
        name: 'default',
        description: 'Canal por defecto para notificaciones',
      }
    );
  }

  // Funciona en dispositivos físicos Y emuladores para pruebas
  if (Device.isDevice || true) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // 1. Solicitar permiso si no está concedido
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.error('⚠️ Falló la obtención del token: Permiso no concedido.');
      alert('Se requiere permiso de notificación.');
      return;
    }

    // 2. Obtener el FCM token nativo (no Expo token)
    // getDevicePushTokenAsync() retorna el FCM token en Android y APNs en iOS
    try {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      token = deviceToken.data;
      console.log('✅ FCM Token obtenido:', token);
    } catch (error) {
      console.error('❌ Error al obtener FCM token:', error);
      return;
    }
    
    // 🆕 ENVIAR TOKEN AL BACKEND
    if (token) {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`${API_URL}/usuario/registrar-fcm-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: parseInt(userId),
              fcm_token: token
            })
          });
          
          if (response.ok) {
            console.log('✅ FCM Token enviado al backend correctamente');
          } else {
            console.error('❌ Error al enviar FCM token:', response.status);
          }
        } else {
          console.warn('⚠️ userId no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('❌ Error al registrar FCM token:', error);
      }
    }
    
  }

  return token;
}

export default registerForPushNotificationsAsync;

// Ejemplo de cómo usarlo en tu componente principal:
// Importa este archivo en tu componente raíz y ejecuta la función:
// useEffect(() => {
//     registerForPushNotificationsAsync();
//     // Opcional: listener para cuando el usuario toca la notificación
//     const subscription = Notifications.addNotificationResponseReceivedListener(response => {
//         console.log('Notificación tocada:', response.notification.request.content.data);
//     });
//     return () => Notifications.removeNotificationSubscription(subscription);
// }, []);