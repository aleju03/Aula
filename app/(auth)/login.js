import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchEssentialUserData } from '../../utils/authSlice';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import loginImage from '../../assets/login.png';

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

const LoginScreen = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    carne: '',
    contrasena: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCarneChange = (carne) => {
    if (/^\d*$/.test(carne)) {
      setForm({ ...form, carne });
    }
  };

  const handleLogin = async () => {
    if (form.carne === '' || form.contrasena === '') {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const usersCollection = collection(db, 'Usuarios');
      const querySnapshot = await getDocs(query(usersCollection, where('carne', '==', form.carne), where('contrasena', '==', form.contrasena)));

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        await dispatch(fetchEssentialUserData(userId));
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={loginImage}
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
