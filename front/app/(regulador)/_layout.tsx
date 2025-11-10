import { Stack } from "expo-router";

export default function ReguladorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="AlertasMasivas/AlertasMasivas" 
        options={{ 
          title: "Alertas Masivas"
        }} 
      />
      <Stack.Screen 
        name="CuentaUsuario/CuentaRegulador" 
        options={{ 
          headerShown: true,
          title: "Mi Cuenta"
        }} 
      />
      <Stack.Screen 
        name="VistaDashboard/VistaDashboard" 
        options={{ 
          headerShown: true,
          title: "Dashboard"
        }} 
      />
      <Stack.Screen 
        name="MonitorearBuses/MonitorearBuses" 
        options={{ 
          headerShown: true,
          title: "Monitoreo de Buses"
        }} 
      />
      <Stack.Screen 
        name="VerFeedback/VerFeedback" 
        options={{ 
          headerShown: false,
          title: "Feedback de Usuarios"
        }} 
      />
    </Stack>
  );
}
