import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
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
  estudiantesContainer: {
    marginTop: 20,
  },
  estudiantesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  estudianteItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  estudianteIcon: {
    marginRight: 10,
  },
  estudianteNombre: {
    fontSize: 16,
    color: '#333',
  },
});

const EncargadoProfile = () => {
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

  const renderEstudianteItem = ({ item }) => (
    <View style={styles.estudianteItem}>
      <MaterialIcons name="person" size={24} color="#075eec" style={styles.estudianteIcon} />
      <Text style={styles.estudianteNombre}>{item.nombre}</Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <View>
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

      <View style={styles.estudiantesContainer}>
        <Text style={styles.estudiantesTitle}>Estudiantes a cargo:</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={user?.estudiantes || []}
      renderItem={renderEstudianteItem}
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={() => (
        <TouchableOpacity style={styles.button} onPress={showLogoutConfirmation}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default EncargadoProfile;