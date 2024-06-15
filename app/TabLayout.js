import { Tabs } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TabLayout = ({ screens }) => {
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
      {screens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color }) => <MaterialIcons name={screen.icon} size={28} color={color} />,
            headerShown: screen.headerShown,
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;