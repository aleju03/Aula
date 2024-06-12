import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../../utils/firebase';
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';

const ProfesorProfile = () => {
  const [profesor, setProfesor] = useState(null);
  const [institucion, setInstitucion] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchProfesorData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const profesorQuery = query(collection(db, 'Usuarios'), where('carne', '==', userId));
        const profesorSnapshot = await getDocs(profesorQuery);

        if (!profesorSnapshot.empty) {
          const profesorData = profesorSnapshot.docs[0].data();
          setProfesor(profesorData);

          const institucionRef = profesorData.institucion;
          if (institucionRef) {
            const institucionDoc = await getDoc(institucionRef);
            if (institucionDoc.exists()) {
              const institucionData = institucionDoc.data();
              setInstitucion(institucionData.nombre);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener los datos del profesor:', error);
      }
    };

    fetchProfesorData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const showLogoutConfirmation = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: handleLogout, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon={() => <Icon name="user" size={40} color="#ffffff" />} />
        <Text style={styles.name}>{profesor?.nombre}</Text>
        <Text style={styles.role}>Profesor</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Carné:</Text>
          <Text style={styles.infoValue}>{profesor?.carne}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Institución:</Text>
          <Text style={styles.infoValue}>{institucion}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={showLogoutConfirmation}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  role: {
    fontSize: 16,
    color: '#888',
  },
  divider: {
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfesorProfile;
