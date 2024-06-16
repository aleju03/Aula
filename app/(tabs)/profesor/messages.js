import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { db } from '../../../utils/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  messageRemitente: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageTitulo: {
    fontSize: 14,
    color: '#888',
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
  selectorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectorButtonText: {
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
  sectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  selectedSectionButton: {
    backgroundColor: '#075eec',
  },
  sectionButtonText: {
    fontSize: 16,
    color: '#000',
  },
  selectedSectionButtonText: {
    color: '#fff',
  },
  selectedDestinatarioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  selectedDestinatarioItem: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 5,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDestinatarioText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  tipoComunicacionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tipoComunicacionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  tipoComunicacionButtonText: {
    fontSize: 16,
  },
  selectedTipoComunicacionButton: {
    backgroundColor: '#075eec',
  },
  selectedTipoComunicacionButtonText: {
    color: '#fff',
  },
  messageDetailsContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  messageDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageDetailsContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  messageDetailsGroup: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDestinatarioRemoveButton: {
    marginLeft: 5,
  },
  selectedSelectorButton: {
    backgroundColor: '#ADD8E6',
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
  const [loading, setLoading] = useState(true);
  const [tipoComunicacion, setTipoComunicacion] = useState('general');
  const [loadingDestinatarios, setLoadingDestinatarios] = useState(true);
  const [destinatarios, setDestinatarios] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [groupSelectorVisible, setGroupSelectorVisible] = useState(false);
  const [destinatarioSelectorVisible, setDestinatarioSelectorVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState('recibidos');
  const user = useSelector((state) => state.auth.user);
  const [searchDestinatarioText, setSearchDestinatarioText] = useState('');
  const [searchGroupText, setSearchGroupText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [user.id, selectedSection]);

  useEffect(() => {
    fetchDestinatarios();
  }, [user.groups]);

  const fetchDestinatarios = async () => {
    setLoadingDestinatarios(true);
    try {
      const destinatariosSet = new Set();
      for (const group of user.groups) {
        for (const encargado of group.encargados) {
          destinatariosSet.add(JSON.stringify(encargado));
        }
      }
      const destinatariosArray = Array.from(destinatariosSet).map((encargado) => JSON.parse(encargado));
      setDestinatarios(destinatariosArray);
    } catch (error) {
      console.error('Error fetching destinatarios:', error);
    }
    setLoadingDestinatarios(false);
  };

  const fetchMessages = async () => {
    setRefreshing(true);
    setLoading(true);
    console.log('Fetching messages...');
    const messagesRef = collection(db, 'Comunicaciones');
    const q = query(
      messagesRef,
      where(selectedSection === 'recibidos' ? 'destinatarios' : 'remitente', selectedSection === 'recibidos' ? 'array-contains' : '==', doc(db, 'Usuarios', user.id)),
      orderBy('fecha_envio', 'desc')
    );

    try {
      const snapshot = await getDocs(q);
      const fetchedMessages = await Promise.all(snapshot.docs.map(async (doc) => {
        const messageData = doc.data();
        const remitenteDoc = await getDoc(messageData.remitente);
        const remitenteData = remitenteDoc.data();
        const destinatariosData = await Promise.all(
          messageData.destinatarios.map(async (destRef) => {
            const destDoc = await getDoc(destRef);
            return destDoc.data();
          })
        );
        return {
          id: doc.id,
          ...messageData,
          remitente: remitenteData,
          destinatarios: destinatariosData,
        };
      }));
      setMessages(fetchedMessages);
      console.log('Messages fetched successfully:', fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setRefreshing(false);
    setLoading(false);
  };

  const onRefresh = async () => {
    await fetchMessages();
  };

  const filteredMessages = messages.filter((message) =>
    message.titulo.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity style={styles.messageContainer} onPress={() => setSelectedMessage(item)}>
      <Text style={styles.messageRemitente}>{item.remitente.nombre}</Text>
      <Text style={styles.messageTitulo}>{item.titulo}</Text>
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
    if (selectedDestinatarios.some((d) => d.id === destinatario.id)) {
      setSelectedDestinatarios(selectedDestinatarios.filter((d) => d.id !== destinatario.id));
    } else {
      setSelectedDestinatarios([...selectedDestinatarios, destinatario]);
    }
  };

  const handleDestinatarioRemove = (destinatario) => {
    setSelectedDestinatarios(selectedDestinatarios.filter(d => d.id !== destinatario.id));
  };

  const handleSendMessage = async () => {
    try {
      console.log('Sending message...');
      const destinatarios = tipoComunicacion === 'general'
        ? selectedGroup.encargados.map((encargado) => doc(db, 'Usuarios', encargado.id))
        : selectedDestinatarios.map((destinatario) => doc(db, 'Usuarios', destinatario.id));
      await addDoc(collection(db, 'Comunicaciones'), {
        ...newMessage,
        fecha_envio: serverTimestamp(),
        remitente: doc(db, 'Usuarios', user.id),
        destinatarios,
        tipo_comunicacion: tipoComunicacion,
      });
      console.log('Message sent successfully');
      setModalVisible(false);
      setNewMessage({
        titulo: '',
        mensaje: '',
      });
      setSelectedGroup(null);
      setSelectedDestinatarios([]);
      setTipoComunicacion('general');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredGroups = user.groups.filter((group) =>
    group.nombre.toLowerCase().includes(searchGroupText.toLowerCase())
  );

  const filteredDestinatarios = destinatarios.filter((destinatario) =>
    destinatario.nombre.toLowerCase().includes(searchDestinatarioText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === 'recibidos' && styles.selectedSectionButton]}
          onPress={() => setSelectedSection('recibidos')}
        >
          <Text style={[styles.sectionButtonText, selectedSection === 'recibidos' && styles.selectedSectionButtonText]}>
            Recibidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === 'enviados' && styles.selectedSectionButton]}
          onPress={() => setSelectedSection('enviados')}
        >
          <Text style={[styles.sectionButtonText, selectedSection === 'enviados' && styles.selectedSectionButtonText]}>
            Enviados
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar mensajes"
        value={searchText}
        onChangeText={setSearchText}
      />
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#075eec" />
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      ) : (
        filteredMessages.length > 0 ? (
          <FlatList
            data={filteredMessages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mensajes</Text>
          </View>
        )
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
            onChangeText={(text) => setNewMessage({ ...newMessage, titulo: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Mensaje"
            multiline
            value={newMessage.mensaje}
            onChangeText={(text) => setNewMessage({ ...newMessage, mensaje: text })}
          />
          <View style={styles.tipoComunicacionContainer}>
            <TouchableOpacity
              style={[
                styles.tipoComunicacionButton,
                tipoComunicacion === 'general' && styles.selectedTipoComunicacionButton,
              ]}
              onPress={() => setTipoComunicacion('general')}
            >
              <Text
                style={[
                  styles.tipoComunicacionButtonText,
                  tipoComunicacion === 'general' && styles.selectedTipoComunicacionButtonText,
                ]}
              >
                General
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tipoComunicacionButton,
                tipoComunicacion === 'especifica' && styles.selectedTipoComunicacionButton,
              ]}
              onPress={() => setTipoComunicacion('especifica')}
            >
              <Text
                style={[
                  styles.tipoComunicacionButtonText,
                  tipoComunicacion === 'especifica' && styles.selectedTipoComunicacionButtonText,
                ]}
              >
                Específica
              </Text>
            </TouchableOpacity>
          </View>
          {tipoComunicacion === 'general' ? (
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setGroupSelectorVisible(true)}
            >
              <Text style={styles.selectorButtonText}>
                {selectedGroup ? selectedGroup.nombre : 'Seleccionar grupo'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.selectedDestinatarioContainer}>
                {selectedDestinatarios.map((destinatario) => (
                  <View key={destinatario.id} style={styles.selectedDestinatarioItem}>
                    <Text style={styles.selectedDestinatarioText}>{destinatario.nombre}</Text>
                    <TouchableOpacity
                      style={styles.selectedDestinatarioRemoveButton}
                      onPress={() => handleDestinatarioRemove(destinatario)}
                    >
                      <Ionicons name="close" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setDestinatarioSelectorVisible(true)}
              >
                <Text style={styles.selectorButtonText}>
                  {selectedDestinatarios.length > 0
                    ? `${selectedDestinatarios.length} encargado(s) seleccionado(s)`
                    : 'Seleccionar encargados'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal visible={groupSelectorVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Seleccionar grupo</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar grupo"
            value={searchGroupText}
            onChangeText={setSearchGroupText}
          />
          {filteredGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.selectorButton,
                selectedGroup && selectedGroup.id === group.id && styles.selectedSelectorButton,
              ]}
              onPress={() => {
                handleGroupSelect(group);
                setGroupSelectorVisible(false);
              }}
            >
              <Text style={styles.selectorButtonText}>{group.nombre}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setGroupSelectorVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal visible={destinatarioSelectorVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Seleccionar encargados</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar encargado"
            value={searchDestinatarioText}
            onChangeText={setSearchDestinatarioText}
          />
          {loadingDestinatarios ? (
            <ActivityIndicator size="small" color="#075eec" />
          ) : (
            filteredDestinatarios.map((destinatario) => (
              <TouchableOpacity
                key={destinatario.id}
                style={[
                  styles.selectorButton,
                  selectedDestinatarios.some((d) => d.id === destinatario.id) && styles.selectedSelectorButton,
                ]}
                onPress={() => handleDestinatarioSelect(destinatario)}
              >
                <Text style={styles.selectorButtonText}>{destinatario.nombre}</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => setDestinatarioSelectorVisible(false)}
          >
            <Text style={styles.sendButtonText}>Aceptar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setDestinatarioSelectorVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal visible={selectedMessage !== null} animationType="slide">
        <View style={styles.messageDetailsContainer}>
          <Text style={styles.messageDetailsTitle}>{selectedMessage?.titulo}</Text>
          <Text style={styles.messageDetailsContent}>{selectedMessage?.mensaje}</Text>
          <Text style={styles.messageDetailsGroup}>
            Remitente: {selectedMessage?.remitente?.nombre}
          </Text>
          <Text style={styles.messageDetailsGroup}>
            Destinatarios: {selectedMessage?.destinatarios.map(d => d.nombre).join(', ')}
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setSelectedMessage(null)}
          >
            <Text style={styles.cancelButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ProfesorMessages;