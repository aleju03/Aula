import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../utils/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  icon: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  avatar: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

const ProfesorProfile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
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
    <ScrollView style={styles.container}>
      <MaterialIcons name="account-circle" size={120} color="#075eec" style={styles.avatar} />
      <Text style={styles.title}>{user?.nombre}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Institución:</Text>
        <Text style={styles.infoText}>
          {loading && !user?.institucion?.nombre ? (
            <ActivityIndicator size="small" color="#075eec" />
          ) : (
            user?.institucion?.nombre || 'No disponible'
          )}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Carné:</Text>
        <Text style={styles.infoText}>{user?.carne || 'No disponible'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={showLogoutConfirmation}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfesorProfile;