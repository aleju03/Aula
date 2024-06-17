import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert, StyleSheet, Modal, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { db, storage } from '../../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { getDownloadURL, ref } from 'firebase/storage';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
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
    height: 150,
    overflow: 'hidden',
  },
  assignmentContent: {
    marginTop: -10,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
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
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  modalEtapaContainer: {
    marginBottom: 20,
  },
  modalEtapaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  modalEtapaDescription: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4B5563',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
  },
  modalEtapaDateContainer: {
    marginBottom: 10,
  },
  modalEtapaDateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  modalEtapaDate: {
    fontSize: 16,
    color: '#4B5563',
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
    marginBottom: 10,
  },
  modalFileIcon: {
    marginRight: 10,
  },
  modalFileName: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  downloadIcon: {
    marginLeft: 10,
  },
  groupSeparator: {
    height: 20,
  },
  etapaButtonContainerContent: {
    paddingHorizontal: 10,
  },
  etapaButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  etapaButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  etapaButtonSelected: {
    backgroundColor: '#075eec',
  },
  etapaButtonSelectedText: {
    color: '#FFFFFF',
  },
  downloadIndicator: {
    marginLeft: 10,
  },
});


const EncargadoAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [currentEtapaIndex, setCurrentEtapaIndex] = useState(0);
  const [downloadingFileIndex, setDownloadingFileIndex] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user.groups && user.groups.length > 0) {
      fetchAssignments();
    }
  }, [user.groups]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const userGroups = user.groups.map((group) => group.id);
      const q = query(collection(db, 'Asignaciones'), where('grupo', 'in', userGroups));
      const querySnapshot = await getDocs(q);
      const fetchedAssignments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssignments(fetchedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to fetch assignments');
    }
    setLoading(false);
  };

  const downloadFile = async (archivo, fileIndex) => {
    try {
      setDownloadingFileIndex(fileIndex);
      const fileRef = ref(storage, `asignaciones/${archivo.nombre}`);
      const downloadURL = await getDownloadURL(fileRef);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos denegados', 'No se pueden descargar archivos sin los permisos necesarios.');
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${archivo.nombre}`;
      const downloadedFile = await FileSystem.downloadAsync(downloadURL, fileUri);

      if (downloadedFile.status === 200) {
        await Sharing.shareAsync(downloadedFile.uri);
      } else {
        Alert.alert('Error', 'No se pudo descargar el archivo. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'No se pudo descargar el archivo. Por favor, inténtalo de nuevo.');
    } finally {
      setDownloadingFileIndex(null);
    }
  };

  const renderGroupAssignments = (groupId) => {
    const groupAssignments = assignments.filter(
      (assignment) => assignment.grupo === groupId
    );

    if (groupAssignments.length === 0) {
      return null;
    }

    const groupName = user.groups.find((group) => group.id === groupId)?.nombre;

    return (
      <View key={groupId}>
        <Text style={styles.groupTitle}>{groupName}</Text>
        {groupAssignments.map((assignment) => (
          <TouchableOpacity
            key={assignment.id}
            style={styles.assignmentItem}
            onPress={() => {
              setSelectedAssignment(assignment);
              setCurrentEtapaIndex(0);
            }}
          >
            <View style={styles.assignmentContent}>
              <Text style={styles.assignmentTitle}>{assignment.titulo}</Text>
              {assignment.etapas.length === 1 ? (
                <Text style={styles.assignmentEtapa}>
                  Descripción: {assignment.etapas[0].descripcion}
                </Text>
              ) : (
                assignment.etapas.map((etapa, index) => (
                  <View key={index}>
                    <Text style={styles.assignmentEtapa}>
                      Etapa {index + 1}: {etapa.descripcion}
                    </Text>
                    <Text style={styles.assignmentDate}>
                      Fecha de entrega:{' '}
                      {etapa.fecha_entrega.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.groupSeparator} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asignaciones</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#075eec" style={{ marginTop: 50 }} />
      ) : assignments.length > 0 ? (
        <FlatList
          data={user.groups}
          renderItem={({ item }) => renderGroupAssignments(item.id)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      ) : (
        <Text style={styles.emptyText}>No hay asignaciones</Text>
      )}

      <Modal visible={!!selectedAssignment} animationType="slide">
        <View style={styles.modalContent}>
          {selectedAssignment && (
            <>
              <TouchableOpacity
                style={styles.closeButtonContainer}
                onPress={() => setSelectedAssignment(null)}
              >
                <FontAwesome name="close" size={24} color="#000" />
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{selectedAssignment.titulo}</Text>
                {selectedAssignment.etapas.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.etapaButtonContainerContent}
                  >
                    {selectedAssignment.etapas.map((etapa, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.etapaButton,
                          currentEtapaIndex === index && styles.etapaButtonSelected,
                        ]}
                        onPress={() => setCurrentEtapaIndex(index)}
                      >
                        <Text
                          style={[
                            styles.etapaButtonText,
                            currentEtapaIndex === index && styles.etapaButtonSelectedText,
                          ]}
                        >
                          Etapa {index + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                <View style={styles.modalEtapaContainer}>
                  <Text style={styles.modalEtapaTitle}>
                    {selectedAssignment.etapas.length === 1
                      ? 'Descripción'
                      : `Etapa ${currentEtapaIndex + 1}`}
                  </Text>
                  <Text style={styles.modalEtapaDescription}>
                    {selectedAssignment.etapas[currentEtapaIndex].descripcion}
                  </Text>
                  <View style={styles.modalEtapaDateContainer}>
                    <Text style={styles.modalEtapaDateLabel}>Fecha de entrega:</Text>
                    <Text style={styles.modalEtapaDate}>
                      {selectedAssignment.etapas[
                        currentEtapaIndex
                      ].fecha_entrega.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedAssignment.etapas[currentEtapaIndex].archivos_adjuntos &&
                    selectedAssignment.etapas[currentEtapaIndex].archivos_adjuntos
                      .length > 0 && (
                      <View style={styles.modalFilesContainer}>
                        <Text style={styles.modalFilesTitle}>Archivos adjuntos:</Text>
                        {selectedAssignment.etapas[
                          currentEtapaIndex
                        ].archivos_adjuntos.map((archivo, fileIndex) => (
                          <View key={fileIndex} style={styles.modalFileItem}>
                            <FontAwesome
                              name="file"
                              size={16}
                              color="#4B5563"
                              style={styles.modalFileIcon}
                            />
                            <Text style={styles.modalFileName}>{archivo.nombre}</Text>
                            <TouchableOpacity
                              onPress={() => downloadFile(archivo, fileIndex)}
                              disabled={downloadingFileIndex === fileIndex}
                            >
                              {downloadingFileIndex === fileIndex ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#075eec"
                                  style={styles.downloadIndicator}
                                />
                              ) : (
                                <FontAwesome
                                  name="download"
                                  size={20}
                                  color="#075eec"
                                  style={styles.downloadIcon}
                                />
                              )}
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default EncargadoAssignments;