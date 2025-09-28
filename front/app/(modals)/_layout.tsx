import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'transparentModal',
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    />
  );
}