import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'none', // quitar animación de transición
      }}
    >
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/encargado" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/profesor" options={{ headerShown: false }} />
    </Stack>
  );
}