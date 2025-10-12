import { Stack, Tabs } from "expo-router";
import {View, Text} from 'react-native'

export default function ClienteLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="HistorialViajes/HistorialViajes" options={{ headerShown: true }} />
      <Stack.Screen name="CuentaUsuario/CuentaUsuario" options={{ headerShown: true }} />
    </Stack>
  );
}