import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfesorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#075eec',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#f5f5f5',
          borderTopWidth: 1,
          borderTopColor: '#ddd',
          paddingVertical: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Asignaciones',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}