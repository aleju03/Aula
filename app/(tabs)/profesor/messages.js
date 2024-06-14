// app/(tabs)/profesor/messages.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../../../utils/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfesorMessages = () => {
  const [grupos, setGrupos] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedEncargados, setSelectedEncargados] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoComunicacion, setTipoComunicacion] = useState('general');
  const [docenteId, setDocenteId] = useState(null);

  useEffect(() => {
    const fetchDocenteId = async () => {
      const userId = await AsyncStorage.getItem('userId');
      setDocenteId(userId);
      fetchGrupos(userId);
    };

    fetchDocenteId();
  }, []);

  const fetchGrupos = async (userId) => {
    const gruposQuery = query(collection(db, 'Grupos'), where('docente', '==', userId));
    const gruposSnapshot = await getDocs(gruposQuery);
    const gruposData = gruposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGrupos(gruposData);
  };

  const fetchEncargados = async (groupId) => {
    const grupo = grupos.find(g => g.id === groupId);
    const encargadosPromises = grupo.encargados.map(encargadoRef => getDocs(query(collection(db, 'Usuarios'), where('__name__', '==', encargadoRef.id))));
    const encargadosSnapshots = await Promise.all(encargadosPromises);
    const encargadosData = encargadosSnapshots.map(snapshot => snapshot.docs[0].data());
    setEncargados(encargadosData);
  };

  const handleSendCommunication = async () => {
    if (!titulo || !mensaje || !selectedGroup) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const destinatarios = tipoComunicacion === 'general' ? encargados.map(enc => enc.id) : selectedEncargados;
    try {
      await addDoc(collection(db, 'Comunicaciones'), {
        titulo,
        mensaje,
        fecha_envío: new Date(),
        remitente: docenteId,
        destinatarios,
        tipo_comunicación: tipoComunicacion,
      });
      Alert.alert('Éxito', 'Comunicación enviada');
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al enviar la comunicación');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar Comunicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Mensaje"
        value={mensaje}
        onChangeText={setMensaje}
      />
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedGroup}
          onValueChange={(itemValue) => {
            setSelectedGroup(itemValue);
            fetchEncargados(itemValue);
          }}
        >
          <Picker.Item label="Seleccionar grupo" value={null} />
          {grupos.map(grupo => (
            <Picker.Item key={grupo.id} label={grupo.nombre} value={grupo.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.picker}>
        <Picker
          selectedValue={tipoComunicacion}
          onValueChange={(itemValue) => setTipoComunicacion(itemValue)}
        >
          <Picker.Item label="General" value="general" />
          <Picker.Item label="Específica" value="especifica" />
        </Picker>
      </View>
      {tipoComunicacion === 'especifica' && (
        <FlatList
          data={encargados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.encargadoItem}
              onPress={() => {
                setSelectedEncargados((prev) => {
                  if (prev.includes(item.id)) {
                    return prev.filter(id => id !== item.id);
                  }
                  return [...prev, item.id];
                });
              }}
            >
              <Text style={styles.encargadoText}>{item.nombre}</Text>
              <Text style={styles.encargadoText}>{selectedEncargados.includes(item.id) ? 'Seleccionado' : ''}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <Button title="Enviar Comunicación" onPress={handleSendCommunication} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    marginBottom: 16,
  },
  encargadoItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  encargadoText: {
    fontSize: 16,
  },
});

export default ProfesorMessages;
