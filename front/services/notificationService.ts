import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

    // 2. Obtener el ExpoPushToken
    // El 'projectId' se obtiene desde Constants (expo-constants)
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.error('❌ Project ID no encontrado en app.config.js');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    console.log('✅ Expo Push Token obtenido:', token);
    
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