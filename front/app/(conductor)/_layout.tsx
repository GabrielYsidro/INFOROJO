import { Stack, Tabs } from "expo-router";
import {View, Text} from 'react-native'

export default function ConductorLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="EnviarReporteDesvio/EnviarReporteDesvio" options={{ headerShown: false }} />
      <Stack.Screen name="CuentaUsuario/CuentaUsuario" options={{ headerShown: false }} />
      <Stack.Screen name="EnviarReporteTrafico/EnviarReporteTrafico" options={{ headerShown: false }} />
      <Stack.Screen name="ReporteFalla/ReporteFalla" options={{ headerShown: false }} />
    </Stack>
  );
}