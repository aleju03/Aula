// app/(tabs)/encargado/messages.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { db } from '../../../utils/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EncargadoMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docentes, setDocentes] = useState([]);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const userQuery = query(collection(db, 'Usuarios'), where('carne', '==', userId));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userDocId = userSnapshot.docs[0].id;
          const messagesQuery = query(collection(db, 'Comunicaciones'), where('destinatarios', 'array-contains', userDocId));
          const messagesSnapshot = await getDocs(messagesQuery);
          const messagesData = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error al obtener los mensajes:', error);
      }
      setLoading(false);
    };

    const fetchDocentes = async () => {
      try {
        const docentesQuery = query(collection(db, 'Usuarios'), where('rol', '==', 'docente'));
        const docentesSnapshot = await getDocs(docentesQuery);
        const docentesData = docentesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocentes(docentesData);
      } catch (error) {
        console.error('Error al obtener los docentes:', error);
      }
    };

    fetchMessages();
    fetchDocentes();
  }, []);

  const handleSendMessage = async () => {
    if (!titulo || !mensaje || !selectedDocente) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      await addDoc(collection(db, 'Comunicaciones'), {
        titulo,
        mensaje,
        fecha_envío: new Date(),
        remitente: userId,
        destinatarios: [selectedDocente.id],
        tipo_comunicación: 'especifica',
      });
      Alert.alert('Éxito', 'Mensaje enviado');
      setTitulo('');
      setMensaje('');
      setSelectedDocente(null);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al enviar el mensaje');
    }
  };

  const renderMessageItem = ({ item }) => (
    <View style={styles.messageItem}>
      <Text style={styles.messageTitle}>{item.titulo}</Text>
      <Text style={styles.messageContent}>{item.mensaje}</Text>
      <Text style={styles.messageDate}>{new Date(item.fecha_envío.toDate()).toLocaleString()}</Text>
    </View>
  );

  const renderDocenteItem = ({ item }) => (
    <TouchableOpacity style={styles.docenteItem} onPress={() => setSelectedDocente(item)}>
      <Text style={styles.docenteText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mensajes Recibidos</Text>
      {loading ? (
        <Text>Cargando mensajes...</Text>
      ) : messages.length === 0 ? (
        <Text>No hay mensajes recibidos.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
        />
      )}
      <Button title="Enviar Mensaje" onPress={() => setModalVisible(true)} />
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enviar Mensaje</Text>
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
              multiline
            />
            <FlatList
              data={docentes}
              keyExtractor={(item) => item.id}
              renderItem={renderDocenteItem}
            />
            {selectedDocente && (
              <Text style={styles.selectedDocente}>Docente seleccionado: {selectedDocente.nombre}</Text>
            )}
            <Button title="Enviar" onPress={handleSendMessage} />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  messageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContent: {
    marginTop: 8,
    fontSize: 16,
  },
  messageDate: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  docenteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  docenteText: {
    fontSize: 16,
  },
  selectedDocente: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EncargadoMessages;
