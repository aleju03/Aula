import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

const NavigationHandler = () => {
  const router = useRouter();
  const userRole = useSelector((state) => state.auth.userRole);

  useEffect(() => {
    if (userRole !== undefined) {
      if (userRole === 'encargado') {
        router.push('/(tabs)/encargado');
      } else if (userRole === 'docente') {
        router.push('/(tabs)/profesor');
      } else {
        router.push('/(auth)/login');
      }
    }
  }, [userRole, router]);

  return null;
};

export default NavigationHandler;
