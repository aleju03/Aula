import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Modal, FlatList, KeyboardAvoidingView } from 'react-native';
import { useSelector } from 'react-redux';
import { db, storage } from '../../../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
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
});

const ProfesorAssignments = () => {
  const [titulo, setTitulo] = useState('');
  const [grupo, setGrupo] = useState('');
  const [etapas, setEtapas] = useState([{ descripcion: '', fecha_entrega: null, archivo: null }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEtapaIndex, setSelectedEtapaIndex] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const user = useSelector((state) => state.auth.user);

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

        // Show a loading indicator or message
        Alert.alert('Subiendo', 'Por favor, espera mientras se sube el archivo...');

        uploadTask.on('state_changed', null,
          (error) => {
            // Show an error message to the user
            Alert.alert('Error', 'No se pudo subir el archivo. Por favor, inténtalo de nuevo.');
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const nuevasEtapas = [...etapas];
            nuevasEtapas[index].archivo = {
              nombre: name,
              url: downloadURL,
            };
            setEtapas(nuevasEtapas);
            // Show a success message to the user
            Alert.alert('Éxito', '¡Archivo subido exitosamente!');
          }
        );
      }
    } catch (error) {
      // Show an error message to the user
      Alert.alert('Error', 'No se pudo seleccionar el archivo. Por favor, inténtalo de nuevo.');
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

    try {
      const etapasConURLs = etapas.map((etapa) => ({
        descripcion: etapa.descripcion,
        fecha_entrega: etapa.fecha_entrega,
        archivos_adjuntos: etapa.archivo ? [etapa.archivo.url] : [],
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
    } catch (error) {
      console.error('Error al crear la asignación:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la asignación');
    }
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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
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
            <Text style={styles.buttonText}>Crear Asignación</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="none">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Grupos disponibles: </Text>
          <FlatList data={user.groups} renderItem={renderGroupItem} keyExtractor={(item) => item.id} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfesorAssignments;