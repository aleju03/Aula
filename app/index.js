import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const storedUserRole = await AsyncStorage.getItem('userRole');
        if (storedUserRole === 'encargado') {
          router.replace('/(tabs)/encargado', { animation: 'none' });
        } else if (storedUserRole === 'profesor') {
          router.replace('/(tabs)/profesor', { animation: 'none' });
        } else {
          router.replace('/(auth)/login', { animation: 'none' });
        }
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    checkUserRole();
  }, []);

  return null;
}