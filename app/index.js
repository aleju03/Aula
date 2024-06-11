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
          router.replace('/(tabs)/encargado');
        } else if (storedUserRole === 'profesor') {
          router.replace('/(tabs)/profesor');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    checkUserRole();
  }, []);

  return null;
}