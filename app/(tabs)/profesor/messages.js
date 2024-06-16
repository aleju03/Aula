import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { db } from '../../../utils/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messagePreview: {
    fontSize: 14,
    color: '#777',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#075eec',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  groupSelector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  groupSelectorText: {
    fontSize: 16,
  },
  destinatarioSelector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  destinatarioSelectorText: {
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#075eec',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const ProfesorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState({
    titulo: '',
    mensaje: '',
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedDestinatarios, setSelectedDestinatarios] = useState([]);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchMessages();
  }, [user.id]);

  const fetchMessages = async () => {
    setRefreshing(true);
    const messagesRef = collection(db, 'Comunicaciones');
    const q = query(
      messagesRef,
      where('destinatarios', 'array-contains', `Usuarios/${user.id}`),
      orderBy('fecha_envio', 'desc')
    );

    const snapshot = await getDocs(q);
    const fetchedMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMessages(fetchedMessages);
    setRefreshing(false);
  };

  const onRefresh = async () => {
    await fetchMessages();
  };

  const filteredMessages = messages.filter((message) =>
    message.titulo.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity style={styles.messageItem}>
      <Text style={styles.messageTitle}>{item.titulo}</Text>
      <Text style={styles.messagePreview}>{item.mensaje}</Text>
    </TouchableOpacity>
  );

  const handleNewMessage = () => {
    setModalVisible(true);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedDestinatarios([]);
  };

  const handleDestinatarioSelect = (destinatario) => {
    if (selectedDestinatarios.includes(destinatario)) {
      setSelectedDestinatarios(
        selectedDestinatarios.filter((d) => d !== destinatario)
      );
    } else {
      setSelectedDestinatarios([...selectedDestinatarios, destinatario]);
    }
  };

  const handleSendMessage = async () => {
    try {
      await addDoc(collection(db, 'Comunicaciones'), {
        ...newMessage,
        fecha_envio: serverTimestamp(),
        remitente: doc(db, 'Usuarios', user.id),
        destinatarios: selectedDestinatarios.map((d) => doc(db, 'Usuarios', d)),
      });
      setModalVisible(false);
      setNewMessage({
        titulo: '',
        mensaje: '',
      });
      setSelectedGroup(null);
      setSelectedDestinatarios([]);
      await fetchMessages();
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar mensajes"
        value={searchText}
        onChangeText={setSearchText}
      />
      {filteredMessages.length > 0 ? (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.emptyText}>No hay mensajes</Text>
      )}
      <TouchableOpacity style={styles.newMessageButton} onPress={handleNewMessage}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nuevo Mensaje</Text>
          <TextInput
            style={styles.input}
            placeholder="Título"
            value={newMessage.titulo}
            onChangeText={(text) =>
              setNewMessage({ ...newMessage, titulo: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Mensaje"
            multiline
            value={newMessage.mensaje}
            onChangeText={(text) =>
              setNewMessage({ ...newMessage, mensaje: text })
            }
          />
          <TouchableOpacity
            style={styles.groupSelector}
            onPress={() => {
              // Lógica para mostrar el selector de grupo
            }}
          >
            <Text style={styles.groupSelectorText}>
              {selectedGroup ? selectedGroup.nombre : 'Seleccionar grupo'}
            </Text>
          </TouchableOpacity>
          {selectedGroup && (
            <View style={styles.destinatarioSelector}>
              {selectedGroup.encargados.map((encargado) => (
                <TouchableOpacity
                  key={encargado.id}
                  onPress={() => handleDestinatarioSelect(encargado.id)}
                >
                  <Text style={styles.destinatarioSelectorText}>
                    {encargado.nombre} (
                    {selectedDestinatarios.includes(encargado.id)
                      ? 'Seleccionado'
                      : 'No seleccionado'}
                    )
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ProfesorMessages;