import { Tabs } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function EncargadoTabLayout() {
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
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Asignaciones',
          tabBarIcon: ({ color }) => <MaterialIcons name="assignment" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color }) => <MaterialIcons name="message" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}