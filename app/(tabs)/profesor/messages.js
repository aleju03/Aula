import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
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
    borderWidth: 1,
    borderColor: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSelectorButton: {
    backgroundColor: '#AEC6CF',
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
  messageDetailsDate: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
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
  messageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    maxHeight: 150,
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
    fontWeight: 'bold',
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
    backgroundColor: '#075eec',
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
  messageTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
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
  messageTituloEnviados: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  messageDetailsContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  messageDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  messageDetailsContentContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  messageDetailsContent: {
    fontSize: 16,
    color: '#4B5563',
  },
  messageDetailsInfoContainer: {
    marginBottom: 20,
  },
  messageDetailsInfoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1F2937',
  },
  messageDetailsInfoLabel: {
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  paginationButton: {
    backgroundColor: '#075eec',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 16,
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
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentDestinatarioPage, setCurrentDestinatarioPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric' };
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
    return `${formattedDate} a las ${formattedTime}`;
  };

  const getTimeDifference = (timestamp) => {
    const currentTime = new Date();
    const messageTime = timestamp.toDate();
    const timeDiff = currentTime - messageTime;
  
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Ahora';
    }
  };

  const fetchMessages = async () => {
    setRefreshing(true);
    setLoading(true);
    setIsLoading(true);
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
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setRefreshing(false);
    setLoading(false);
    setIsLoading(false);
  };

  const onRefresh = async () => {
    await fetchMessages();
  };

  const filteredMessages = messages.filter((message) =>
    message.titulo.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity style={styles.messageContainer} onPress={() => setSelectedMessage(item)}>
      {selectedSection === 'recibidos' ? (
        <>
          <Text style={styles.messageRemitente}>{item.remitente.nombre}</Text>
          <Text style={styles.messageTitulo}>{item.titulo}</Text>
          <Text style={styles.messageTime}>{getTimeDifference(item.fecha_envio)}</Text>
        </>
      ) : (
        <>
          <Text style={styles.messageTituloEnviados}>{item.titulo}</Text>
          <Text style={styles.messageTime}>{getTimeDifference(item.fecha_envio)}</Text>
        </>
      )}
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
    if (!newMessage.titulo || !newMessage.mensaje || (tipoComunicacion === 'general' && !selectedGroup) || (tipoComunicacion === 'especifica' && selectedDestinatarios.length === 0)) {
      alert('Por favor complete todos los campos y seleccione al menos un destinatario.');
      return;
    }

    setSendingMessage(true); // Establecer sendingMessage en true antes de enviar el mensaje

    try {
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

    setSendingMessage(false); // Establecer sendingMessage en false después de enviar el mensaje
  };

  const handleNextGroupPage = () => {
    setCurrentGroupPage((prevPage) => prevPage + 1);
  };

  const handlePrevGroupPage = () => {
    setCurrentGroupPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextDestinatarioPage = () => {
    setCurrentDestinatarioPage((prevPage) => prevPage + 1);
  };

  const handlePrevDestinatarioPage = () => {
    setCurrentDestinatarioPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const filteredGroups = user.groups.filter((group) =>
    group.nombre.toLowerCase().includes(searchGroupText.toLowerCase())
  );

  const filteredDestinatarios = destinatarios.filter((destinatario) =>
    destinatario.nombre.toLowerCase().includes(searchDestinatarioText.toLowerCase())
  );

  const indexOfLastGroup = currentGroupPage * itemsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - itemsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstGroup, indexOfLastGroup);

  const indexOfLastDestinatario = currentDestinatarioPage * itemsPerPage;
  const indexOfFirstDestinatario = indexOfLastDestinatario - itemsPerPage;
  const currentDestinatarios = filteredDestinatarios.slice(indexOfFirstDestinatario, indexOfLastDestinatario);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === 'recibidos' && styles.selectedSectionButton]}
          onPress={() => {
            setSelectedSection('recibidos');
            setIsLoading(true);
          }}
        >
          <Text style={[styles.sectionButtonText, selectedSection === 'recibidos' && styles.selectedSectionButtonText]}>
            Recibidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === 'enviados' && styles.selectedSectionButton]}
          onPress={() => {
            setSelectedSection('enviados');
            setIsLoading(true);
          }}
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
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#075eec" />
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      ) : filteredMessages.length > 0 ? (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay mensajes</Text>
        </View>
      )}
      <TouchableOpacity style={styles.newMessageButton} onPress={handleNewMessage}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nuevo Mensaje</Text>
          <TextInput
            style={styles.input}
            placeholder="Título"
            value={newMessage.titulo}
            onChangeText={(text) => setNewMessage({ ...newMessage, titulo: text })}
          />
          <TextInput
            style={styles.messageInput}
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
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={sendingMessage} // Deshabilitar el botón mientras se envía el mensaje
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
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
          <ScrollView>
            {currentGroups.map((group) => (
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
          </ScrollView>
          {filteredGroups.length > itemsPerPage && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={handlePrevGroupPage}
                disabled={currentGroupPage === 1}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={handleNextGroupPage}
                disabled={indexOfLastGroup >= filteredGroups.length}
              >
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
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
            <ScrollView>
              {currentDestinatarios.map((destinatario) => (
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
              ))}
            </ScrollView>
          )}
          {filteredDestinatarios.length > itemsPerPage && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={handlePrevDestinatarioPage}
                disabled={currentDestinatarioPage === 1}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={handleNextDestinatarioPage}
                disabled={indexOfLastDestinatario >= filteredDestinatarios.length}
              >
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
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
        <ScrollView contentContainerStyle={styles.messageDetailsContainer}>
          <Text style={styles.messageDetailsTitle}>{selectedMessage?.titulo}</Text>
          <Text style={styles.messageDetailsDate}>{selectedMessage ? formatDate(selectedMessage.fecha_envio) : ''}</Text>
          <View style={styles.messageDetailsInfoContainer}>
            <Text style={styles.messageDetailsInfoText}>
              <Text style={styles.messageDetailsInfoLabel}>Remitente:</Text> {selectedMessage?.remitente?.nombre}
            </Text>
            <Text style={styles.messageDetailsInfoText}>
              <Text style={styles.messageDetailsInfoLabel}>Destinatarios:</Text>{' '}
              {selectedMessage?.destinatarios.map((d, index, array) => 
                index === array.length - 1 ? `${d.nombre}.` : `${d.nombre}, `
              )}
            </Text>
          </View>
          <View style={styles.messageDetailsContentContainer}>
            <Text style={styles.messageDetailsContent}>{selectedMessage?.mensaje}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedMessage(null)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default ProfesorMessages;