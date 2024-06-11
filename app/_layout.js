import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(auth)/login"
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <Stack.Screen name="(tabs)/encargado" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/profesor" options={{ headerShown: false }} />
    </Stack>
  );
}