import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { API_URL } from '@/services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';
import { getMe } from '@/services/AuthService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {

      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🧩 Token actual:', token);

        if (!token) {
        console.log('No hay token, redirigiendo al login...');
        setLoading(false);
        setTimeout(() => router.replace('/login'), 0);
        return;
      }

        // Verificar token con el backend
        const user = await getMe(token);
        console.log('✅ Usuario autenticado:', user);

        const role : string = user.rol; // Asignamos el rol del usuario autenticado

        // Redirigir según rol
        switch (role) {
          case 'cliente':
            router.replace('/(cliente)');
            break;
          case 'conductor':
            router.replace('/(conductor)');
            break;
          case 'regulador':
            router.replace('/(regulador)');
            break;
          default:
            router.replace('/login');
            break;
        }

      } catch (error) {
        console.error('Error al verificar sesión:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

if (!loaded) {
  console.log('⚠️ Fuentes aún no cargadas');
}
if (loading) {
  console.log('⚙️ Verificando sesión...');
}

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(cliente)" options={{ headerShown: false }} />
        <Stack.Screen name="(conductor)" options={{ headerShown: false }} />
        <Stack.Screen name="(regulador)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
