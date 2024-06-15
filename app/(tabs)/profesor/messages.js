// app/(tabs)/profesor/messages.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, FlatList, TouchableOpacity, Modal } from 'react-native';
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
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  useEffect(() => {
    const fetchDocenteId = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const profesorQuery = query(collection(db, 'Usuarios'), where('carne', '==', userId));
      const profesorSnapshot = await getDocs(profesorQuery);
      if (!profesorSnapshot.empty) {
        const profesorDocId = profesorSnapshot.docs[0].id;
        setDocenteId(profesorDocId);
        fetchGrupos(profesorDocId);
      }
    };

    fetchDocenteId();
  }, []);

  const fetchGrupos = async (profesorDocId) => {
    try {
      const profesorRef = collection(db, 'Usuarios').doc(profesorDocId);
      const gruposQuery = query(collection(db, 'Grupos'), where('docente', '==', profesorRef));
      const gruposSnapshot = await getDocs(gruposQuery);
      const gruposData = gruposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGrupos(gruposData);
    } catch (error) {
      console.error('Error al obtener los grupos:', error);
    }
  };

  const fetchEncargados = async (groupId) => {
    try {
      const grupo = grupos.find(g => g.id === groupId);
      const encargadosPromises = grupo.encargados.map(encargadoRef => getDocs(query(collection(db, 'Usuarios'), where('__name__', '==', encargadoRef.id))));
      const encargadosSnapshots = await Promise.all(encargadosPromises);
      const encargadosData = encargadosSnapshots.map(snapshot => ({
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      }));
      setEncargados(encargadosData);
    } catch (error) {
      console.error('Error al obtener los encargados:', error);
    }
  };

  const handleGroupPress = (group) => {
    setSelectedGroup(group);
    setGroupModalVisible(false);
    fetchEncargados(group.id);
  };

  const handleSendCommunication = async () => {
    if (!titulo || !mensaje || !selectedGroup) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (tipoComunicacion === 'especifica' && selectedEncargados.length === 0) {
      Alert.alert('Error', 'Debe seleccionar al menos un encargado para una comunicación específica');
      return;
    }

    const destinatarios = tipoComunicacion === 'general' 
      ? encargados.map(enc => enc.id)
      : selectedEncargados.map(encargadoId => encargados.find(enc => enc.id === encargadoId).id);

    try {
      await addDoc(collection(db, 'Comunicaciones'), {
        titulo,
        mensaje,
        fecha_envío: new Date(),
        remitente: docenteId, // Enviar el ID del documento del profesor
        destinatarios,
        tipo_comunicación: tipoComunicacion,
      });
      Alert.alert('Éxito', 'Comunicación enviada');
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al enviar la comunicación');
    }
  };

  const toggleEncargadoSelection = (encargadoId) => {
    setSelectedEncargados(prev => {
      if (prev.includes(encargadoId)) {
        return prev.filter(id => id !== encargadoId);
      }
      return [...prev, encargadoId];
    });
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
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setGroupModalVisible(true)}
      >
        <Text>{selectedGroup ? selectedGroup.nombre : 'Seleccionar Grupo'}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={groupModalVisible}
        onRequestClose={() => setGroupModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={grupos}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleGroupPress(item)}
                >
                  <Text>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Cerrar" onPress={() => setGroupModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setTypeModalVisible(true)}
      >
        <Text>{tipoComunicacion === 'general' ? 'Comunicación General' : 'Comunicación Específica'}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={typeModalVisible}
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setTipoComunicacion('general');
                setTypeModalVisible(false);
              }}
            >
              <Text>Comunicación General</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setTipoComunicacion('especifica');
                setTypeModalVisible(false);
              }}
            >
              <Text>Comunicación Específica</Text>
            </TouchableOpacity>
            <Button title="Cerrar" onPress={() => setTypeModalVisible(false)} />
          </View>
        </View>
      </Modal>
      {tipoComunicacion === 'especifica' && (
        <FlatList
          data={encargados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.encargadoItem}
              onPress={() => toggleEncargadoSelection(item.id)}
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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
  selector: { height: 40, borderColor: 'gray', borderWidth: 1, justifyContent: 'center', marginBottom: 12, paddingHorizontal: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: 'white', borderRadius: 8, padding: 16, alignItems: 'center' },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'gray', width: '100%', alignItems: 'center' },
  encargadoItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: 'gray' },
  encargadoText: { fontSize: 16 },
});

export default ProfesorMessages;
