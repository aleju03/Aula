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
    flex: 1,
    marginRight: 10,
  },
  messageDetailsDate: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  messageTitulo: {
    fontSize: 14,
    color: '#888',
    flex: 2,
    marginRight: 10,
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
    marginRight: 10,
    flex: 1,
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

const EncargadoMessages = () => {
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState({
    titulo: '',
    mensaje: '',
  });
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docenteSelectorVisible, setDocenteSelectorVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchDocenteText, setSearchDocenteText] = useState('');
  const [currentDocentePage, setCurrentDocentePage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedSection, setSelectedSection] = useState('recibidos');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchMessages();
  }, [user.id, selectedSection]);

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

  const handleDocenteSelect = (docente) => {
    setSelectedDocente(docente);
    setDocenteSelectorVisible(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.titulo || !newMessage.mensaje || !selectedDocente) {
      alert('Por favor complete todos los campos y seleccione un docente.');
      return;
    }

    setSendingMessage(true);

    try {
      await addDoc(collection(db, 'Comunicaciones'), {
        ...newMessage,
        fecha_envio: serverTimestamp(),
        remitente: doc(db, 'Usuarios', user.id),
        destinatarios: [doc(db, 'Usuarios', selectedDocente.id)],
      });
      setModalVisible(false);
      setNewMessage({
        titulo: '',
        mensaje: '',
      });
      setSelectedDocente(null);
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setSendingMessage(false);
  };

  const handleNextDocentePage = () => {
    setCurrentDocentePage((prevPage) => prevPage + 1);
  };

  const handlePrevDocentePage = () => {
    setCurrentDocentePage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const docentes = user.groups.flatMap((group) => [group.docente]);
  const uniqueDocentes = Array.from(new Set(docentes.map(JSON.stringify))).map(JSON.parse);

  const filteredDocentes = uniqueDocentes.filter((docente) =>
    docente.nombre.toLowerCase().includes(searchDocenteText.toLowerCase())
  );

  const indexOfLastDocente = currentDocentePage * itemsPerPage;
  const indexOfFirstDocente = indexOfLastDocente - itemsPerPage;
  const currentDocentes = filteredDocentes.slice(indexOfFirstDocente, indexOfLastDocente);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === 'recibidos' && styles.selectedSectionButton]}
          onPress={() => {
            if (selectedSection !== 'recibidos') {
              setSelectedSection('recibidos');
              setIsLoading(true);
            }
          }}
        >
          <Text style={[styles.sectionButtonText, selectedSection === 'recibidos' && styles.selectedSectionButtonText]}>
            Recibidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === 'enviados' && styles.selectedSectionButton]}
          onPress={() => {
            if (selectedSection !== 'enviados') {
              setSelectedSection('enviados');
              setIsLoading(true);
            }
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
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setDocenteSelectorVisible(true)}
          >
            <Text style={styles.selectorButtonText}>
              {selectedDocente ? selectedDocente.nombre : 'Seleccionar docente'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={sendingMessage}
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
      <Modal visible={docenteSelectorVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Seleccionar docente</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar docente"
            value={searchDocenteText}
            onChangeText={setSearchDocenteText}
          />
          <ScrollView>
            {currentDocentes.map((docente) => (
              <TouchableOpacity
                key={docente.id}
                style={[
                  styles.selectorButton,
                  selectedDocente && selectedDocente.id === docente.id && styles.selectedSelectorButton,
                ]}
                onPress={() => handleDocenteSelect(docente)}
              >
                <Text style={styles.selectorButtonText}>{docente.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filteredDocentes.length > itemsPerPage && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={handlePrevDocentePage}
                disabled={currentDocentePage === 1}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={handleNextDocentePage}
                disabled={indexOfLastDocente >= filteredDocentes.length}
              >
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setDocenteSelectorVisible(false)}
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
            {selectedSection === 'enviados' && (
              <Text style={styles.messageDetailsInfoText}>
                <Text style={styles.messageDetailsInfoLabel}>Destinatario:</Text> {selectedMessage?.destinatarios[0]?.nombre}
              </Text>
            )}
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

export default EncargadoMessages;