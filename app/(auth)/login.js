import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Estilos para los componentes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8ecf4',
    padding: 24,
  },
  header: {
    marginVertical: 36,
    alignItems: 'center',
  },
  headerImg: {
    width: 180,
    height: 80,
    marginBottom: 36,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  button: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

// Componente principal de la pantalla de inicio de sesión
const LoginScreen = () => {
  // Estado para el formulario y el indicador de carga
  const [form, setForm] = useState({
    carne: '',
    contrasena: '',
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    if (!form.carne || !form.contrasena) {
      Alert.alert(
        'Error',
        'Por favor, complete todos los campos',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      return;
    }

    setLoading(true);
    try {
      const carneP = query(collection(db, 'Usuarios'), where('carne', '==', form.carne));
      const usuario = await getDocs(carneP, { fields: ['contraseña', 'rol'] });
      if (usuario.empty) {
        Alert.alert(
          'Error',
          'El carné seleccionado no existe',
          [{ text: 'OK' }],
          { cancelable: false }
        );
      } else {
        const final = usuario.docs[0].data();
        if (final.contraseña === form.contrasena) {
          await AsyncStorage.setItem('userRole', final.rol);
          if (final.rol === 'encargado') {
            router.replace('/(tabs)/encargado');
          } else if (final.rol === 'profesor') {
            router.replace('/(tabs)/profesor');
          }
        } else {
          Alert.alert(
            'Error',
            'Contraseña incorrecta',
            [{ text: 'OK' }],
            { cancelable: false }
          );
        }
      }
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al obtener el usuario. Por favor, intenta nuevamente.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cambio en el campo de carné
  const handleCarneChange = (carne) => {
    if (/^\d*$/.test(carne)) {
      setForm({ ...form, carne });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.vexels.com/media/users/3/152825/isolated/preview/5b8297c29a8d4f5953c0ea5baa32d821-high-school-building-illustration-by-vexels.png' }}
          style={styles.headerImg}
          alt="Logo"
        />
        <Text style={styles.title}>Ingresar</Text>
        <Text style={styles.subtitle}>Administra tus actividades escolares aquí</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Carne</Text>
          <TextInput
            style={styles.input}
            value={form.carne}
            onChangeText={handleCarneChange}
            placeholder="El carné que le fue asignado"
            placeholderTextColor="#6b7280"
            keyboardType="default"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={form.contrasena}
            onChangeText={contrasena => setForm({ ...form, contrasena })}
            placeholder="Ingrese su contraseña"
            placeholderTextColor="#6b7280"
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirmar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;