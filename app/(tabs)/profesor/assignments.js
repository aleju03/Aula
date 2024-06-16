import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Modal, FlatList, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { db, storage } from '../../../utils/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 12,
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
  etapaContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  etapaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  dateTimeButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  groupSelectorButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  groupSelectorButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  groupItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  groupItemText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  deleteEtapaButton: {
    position: 'absolute',
    top: 5,
    right: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteEtapaButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileButton: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fileName: {
    marginLeft: 5,
    flex: 1,
  },
  fileNameText: {
    fontSize: 16,
    color: '#1F2937',
  },
  truncateText: {
    flex: 1,
    marginLeft: 5,
  },
  trashIcon: {
    marginLeft: 10,
  },
  assignmentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  assignmentGroup: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 10,
  },
  assignmentEtapa: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  assignmentDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  fileUploadIndicator: {
    marginLeft: 10,
  },
  modalScrollView: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  modalGroup: {
    fontSize: 20,
    color: '#4B5563',
    marginBottom: 20,
  },
  modalEtapaContainer: {
    marginBottom: 20,
  },
  modalEtapaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  modalEtapaDescription: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalEtapaDateContainer: {
    marginBottom: 10,
  },
  modalEtapaDateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalEtapaDate: {
    fontSize: 16,
  },
  modalEtapaTime: {
    fontSize: 16,
  },
  modalFilesContainer: {
    marginTop: 10,
  },
  modalFilesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  modalFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  modalFileIcon: {
    marginRight: 10,
  },
  modalFileName: {
    fontSize: 16,
    color: '#4B5563',
  },
});

const ProfesorAssignments = () => {
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [grupo, setGrupo] = useState('');
  const [etapas, setEtapas] = useState([{ descripcion: '', fecha_entrega: null, archivo: null }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEtapaIndex, setSelectedEtapaIndex] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadingFileIndex, setUploadingFileIndex] = useState(null);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'Asignaciones'), where('grupo', 'in', user.groups.map(group => group.id)));
      const querySnapshot = await getDocs(q);
      const fetchedAssignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignments(fetchedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to fetch assignments');
    }
    setLoading(false);
  };

  const handleAddEtapa = () => {
    setEtapas([...etapas, { descripcion: '', fecha_entrega: null, archivo: null }]);
  };

  const handleEtapaChange = (index, field, value) => {
    const nuevasEtapas = [...etapas];
    nuevasEtapas[index][field] = value;
    setEtapas(nuevasEtapas);
  };

  const handleDeleteEtapa = async (index) => {
    const etapaToDelete = etapas[index];
    if (etapaToDelete.archivo) {
      const storageRef = ref(storage, `asignaciones/${etapaToDelete.archivo.nombre}`);
      try {
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    const nuevasEtapas = [...etapas];
    nuevasEtapas.splice(index, 1);
    setEtapas(nuevasEtapas);
  };

  const handleFileUpload = async (index) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});

      if (!result.canceled) {
        const { uri, name } = result.assets[0];

        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `asignaciones/${name}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        setUploadingFileIndex(index);

        uploadTask.on('state_changed', null,
          (error) => {
            Alert.alert('Error', 'No se pudo subir el archivo. Por favor, inténtalo de nuevo.');
            setUploadingFileIndex(null);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const nuevasEtapas = [...etapas];
            nuevasEtapas[index].archivo = {
              nombre: name,
              url: downloadURL,
            };
            setEtapas(nuevasEtapas);
            setUploadingFileIndex(null);
          }
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo. Por favor, inténtalo de nuevo.');
      setUploadingFileIndex(null);
    }
  };

  const handleDeleteFile = async (index) => {
    const fileToDelete = etapas[index].archivo;
    if (!fileToDelete) return;

    const storageRef = ref(storage, `asignaciones/${fileToDelete.nombre}`);

    try {
      await deleteObject(storageRef);
      const nuevasEtapas = [...etapas];
      nuevasEtapas[index].archivo = null;
      setEtapas(nuevasEtapas);
      Alert.alert('Éxito', 'Archivo eliminado.');
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      Alert.alert('Error', 'No se pudo eliminar el archivo. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCreateAssignment = async () => {
    if (titulo === '' || grupo === '' || etapas.some(etapa => etapa.fecha_entrega === null)) {
      Alert.alert('Error', 'Por favor, completa todos los campos y asegúrate de que todas las etapas tengan una fecha de entrega.');
      return;
    }
  
    setCreatingAssignment(true); // Inicia el estado de carga

    try {
      const etapasConURLs = etapas.map((etapa) => ({
        descripcion: etapa.descripcion,
        fecha_entrega: etapa.fecha_entrega,
        archivos_adjuntos: etapa.archivo ? [{ nombre: etapa.archivo.nombre, url: etapa.archivo.url }] : [],
      }));
  
      const docRef = await addDoc(collection(db, 'Asignaciones'), {
        titulo,
        grupo,
        etapas: etapasConURLs,
      });
  
      Alert.alert('Éxito', 'Asignación creada correctamente');
      setTitulo('');
      setGrupo('');
      setEtapas([{ descripcion: '', fecha_entrega: null, archivo: null }]);
      fetchAssignments();
    } catch (error) {
      console.error('Error al crear la asignación:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la asignación');
    }

    setCreatingAssignment(false); // Finaliza el estado de carga
  };

  const handleLongPress = (item) => {
    if (selectedAssignments.includes(item.id)) {
      setSelectedAssignments(selectedAssignments.filter(id => id !== item.id));
    } else {
      setSelectedAssignments([...selectedAssignments, item.id]);
    }
  };

  const handleDeleteAssignments = async () => {
    setDeleting(true);
    try {
      await Promise.all(
        selectedAssignments.map(async (id) => {
          const assignment = assignments.find(a => a.id === id);
          // Eliminar archivos adjuntos
          await Promise.all(
            assignment.etapas.flatMap(etapa => 
              etapa.archivos_adjuntos.map(async archivo => {
                const storageRef = ref(storage, `asignaciones/${archivo.nombre}`);
                await deleteObject(storageRef);
              })
            )
          );
          await deleteDoc(doc(db, 'Asignaciones', id));
        })
      );
      setAssignments(assignments.filter(assignment => !selectedAssignments.includes(assignment.id)));
      setSelectedAssignments([]);
      Alert.alert('Éxito', 'Asignaciones eliminadas correctamente');
    } catch (error) {
      console.error('Error al eliminar las asignaciones:', error);
      Alert.alert('Error', 'Ocurrió un error al eliminar las asignaciones');
    }
    setDeleting(false);
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => {
        setGrupo(item.id);
        setModalVisible(false);
      }}
    >
      <Text style={styles.groupItemText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  const renderAssignmentItem = ({ item }) => {
    const isSelected = selectedAssignments.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.assignmentItem, isSelected && { backgroundColor: '#e5e7eb' }]}
        onPress={() => selectedAssignments.length > 0 ? handleLongPress(item) : setSelectedAssignment(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <Text style={styles.assignmentTitle}>{item.titulo}</Text>
        <Text style={styles.assignmentGroup}>{user.groups.find(group => group.id === item.grupo)?.nombre}</Text>
        {item.etapas.length === 1 ? (
          <Text style={styles.assignmentEtapa}>Descripción: {item.etapas[0].descripcion}</Text>
        ) : (
          item.etapas.map((etapa, index) => (
            <View key={index}>
              <Text style={styles.assignmentEtapa}>Etapa {index + 1}: {etapa.descripcion}</Text>
              <Text style={styles.assignmentDate}>Fecha de entrega: {etapa.fecha_entrega.toDate().toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      {showCreateAssignment ? (
        <>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={() => setShowCreateAssignment(false)}>
              <FontAwesome name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Crear Asignación</Text>
              <Text style={styles.subtitle}>Completa los campos para crear una nueva asignación</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Título de la asignación"
              value={titulo}
              onChangeText={setTitulo}
            />

            <TouchableOpacity style={styles.groupSelectorButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.groupSelectorButtonText}>
                {grupo ? user.groups.find((g) => g.id === grupo)?.nombre : 'Seleccionar grupo'}
              </Text>
            </TouchableOpacity>

            {etapas.map((etapa, index) => (
              <View key={index} style={styles.etapaContainer}>
                {etapas.length > 1 && (
                  <>
                    <Text style={styles.etapaTitle}>Etapa {index + 1}</Text>
                    {index > 0 && (
                      <TouchableOpacity style={styles.deleteEtapaButton} onPress={() => handleDeleteEtapa(index)}>
                        <Text style={styles.deleteEtapaButtonText}>x</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                <TextInput
                  style={styles.input}
                  placeholder={etapas.length === 1 ? 'Descripción de la asignación' : 'Descripción de la etapa'}
                  value={etapa.descripcion}
                  onChangeText={(text) => handleEtapaChange(index, 'descripcion', text)}
                  multiline
                />

                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      setSelectedEtapaIndex(index);
                      setShowDatePicker(true);
                    }}
                  >
                    <Text style={styles.dateTimeButtonText}>
                      {etapa.fecha_entrega ? etapa.fecha_entrega.toLocaleDateString() : 'Fecha'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      setSelectedEtapaIndex(index);
                      setShowTimePicker(true);
                    }}
                  >
                    <Text style={styles.dateTimeButtonText}>
                      {etapa.fecha_entrega ? etapa.fecha_entrega.toLocaleTimeString() : 'Hora'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && selectedEtapaIndex === index && (
                  <DateTimePicker
                    value={etapa.fecha_entrega || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (event.type === 'set' && selectedDate) {
                        handleEtapaChange(index, 'fecha_entrega', selectedDate);
                      }
                    }}
                  />
                )}

                {showTimePicker && selectedEtapaIndex === index && (
                  <DateTimePicker
                    value={etapa.fecha_entrega || new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(false);
                      if (event.type === 'set' && selectedTime) {
                        handleEtapaChange(index, 'fecha_entrega', selectedTime);
                      }
                    }}
                  />
                )}

                <TouchableOpacity style={styles.fileButton} onPress={() => handleFileUpload(index)}>
                  <FontAwesome name="paperclip" size={16} color="#fff" />
                  <Text style={styles.fileButtonText}>Adjuntar Archivo</Text>
                  {uploadingFileIndex === index && (
                    <ActivityIndicator size="small" color="#fff" style={styles.fileUploadIndicator} />
                  )}
                </TouchableOpacity>

                {etapa.archivo && (
                  <View style={styles.fileInfo}>
                    <FontAwesome name="file" size={16} color="#1F2937" />
                    <Text style={[styles.fileNameText, styles.truncateText]} numberOfLines={1} ellipsizeMode="tail">
                      {etapa.archivo.nombre}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteFile(index)}>
                      <FontAwesome name="trash" size={16} color="red" style={styles.trashIcon} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleAddEtapa}>
                <Text style={styles.buttonText}>Agregar Etapa</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleCreateAssignment}>
                {creatingAssignment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Crear Asignación</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.container}>
          <Text style={styles.title}>Asignaciones</Text>
          {selectedAssignments.length > 0 && (
            <TouchableOpacity style={styles.button} onPress={handleDeleteAssignments} disabled={deleting}>
              <Text style={styles.buttonText}>{deleting ? 'Eliminando...' : 'Eliminar Asignaciones'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={() => setShowCreateAssignment(true)}>
            <Text style={styles.buttonText}>Crear Asignación</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color="#075eec" style={{ marginTop: 50 }} />
          ) : assignments.length > 0 ? (
            <FlatList
              data={assignments}
              renderItem={renderAssignmentItem}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingTop: 20 }}
            />
          ) : (
            <Text style={styles.emptyText}>No hay asignaciones</Text>
          )}
        </View>
      )}

      <Modal visible={modalVisible} animationType="none">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Grupos disponibles: </Text>
          <FlatList data={user.groups} renderItem={renderGroupItem} keyExtractor={(item) => item.id} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={!!selectedAssignment} animationType="slide">
        <View style={styles.modalContent}>
          {selectedAssignment && (
            <>
              <TouchableOpacity style={styles.closeButtonContainer} onPress={() => setSelectedAssignment(null)}>
                <FontAwesome name="close" size={24} color="#000" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={styles.modalScrollView}>
                <Text style={styles.modalTitle}>{selectedAssignment.titulo}</Text>
                <Text style={styles.modalGroup}>{user.groups.find(group => group.id === selectedAssignment.grupo)?.nombre}</Text>
                {selectedAssignment.etapas.map((etapa, index) => (
                  <View key={index} style={styles.modalEtapaContainer}>
                    {selectedAssignment.etapas.length > 1 && (
                      <Text style={styles.modalEtapaTitle}>Etapa {index + 1}</Text>
                    )}
                    <Text style={styles.modalEtapaDescription}>{etapa.descripcion}</Text>
                    <View style={styles.modalEtapaDateContainer}>
                      <Text style={styles.modalEtapaDateLabel}>Fecha de entrega:</Text>
                      <Text style={styles.modalEtapaDate}>{etapa.fecha_entrega.toDate().toLocaleDateString()}</Text>
                      <Text style={styles.modalEtapaTime}>{etapa.fecha_entrega.toDate().toLocaleTimeString()}</Text>
                    </View>
                    {etapa.archivos_adjuntos && etapa.archivos_adjuntos.length > 0 && (
                      <View style={styles.modalFilesContainer}>
                        <Text style={styles.modalFilesTitle}>Archivos adjuntos:</Text>
                        {etapa.archivos_adjuntos.map((archivo, fileIndex) => (
                          <View key={fileIndex} style={styles.modalFileItem}>
                            <FontAwesome name="file" size={16} color="#4B5563" style={styles.modalFileIcon} />
                            <Text style={styles.modalFileName}>{archivo.nombre}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfesorAssignments;