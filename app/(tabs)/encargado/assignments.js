import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert, ScrollView, StyleSheet, Modal, FlatList, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { db } from '../../../utils/firebase';
import { collection,query, where, getDocs} from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
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
    top: 45,
    right: 29,
    zIndex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
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
  etapaButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'left',
    marginBottom: 20,
  },
  etapaButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 30,
  },
  etapaButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  etapaButtonSelected: {
    backgroundColor: '#075eec',
  },
  etapaButtonSelectedText: {
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
});


const EncargadoAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [currentEtapaIndex, setCurrentEtapaIndex] = useState(0);
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
      console.error('Error buscando las asignaciones:', error);
      Alert.alert('Error', 'Error buscando las asignaciones');
    }
    setLoading(false);
  };

  const handleLongPress = (item) => {
    if (selectedAssignments.includes(item.id)) {
      setSelectedAssignments(selectedAssignments.filter(id => id !== item.id));
    } else {
      setSelectedAssignments([...selectedAssignments, item.id]);
    }
  };

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
      <View style={styles.container}>
        <Text style={styles.title}>Asignaciones</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#075eec" style={{ marginTop: 50 }} />
        ) : assignments.length > 0 ? (
          <FlatList
            data={assignments}
            renderItem={renderAssignmentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyText}>No hay asignaciones</Text>
        )}
      </View>
  
      <Modal visible={!!selectedAssignment} animationType="slide">
        <View style={styles.modalContent}>
          {selectedAssignment && (
            <>
              <TouchableOpacity style={styles.closeButtonContainer} onPress={() => setSelectedAssignment(null)}>
                <FontAwesome name="close" size={24} color="#000" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{selectedAssignment.titulo}</Text>
                <Text style={styles.modalGroup}>
                  {user.groups.find((group) => group.id === selectedAssignment.grupo)?.nombre}
                </Text>
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
                {selectedAssignment.etapas.length === 1 ? (
                  <View style={styles.modalEtapaContainer}>
                    <Text style={styles.modalEtapaTitle}>Descripción:</Text>
                    <Text style={styles.modalEtapaDescription}>{selectedAssignment.etapas[0].descripcion}</Text>
                    <View style={styles.modalEtapaDateContainer}>
                      <Text style={styles.modalEtapaDateLabel}>Fecha de entrega:</Text>
                      <Text style={styles.modalEtapaDate}>
                        {selectedAssignment.etapas[0].fecha_entrega.toDate().toLocaleDateString()}
                      </Text>
                      <Text style={styles.modalEtapaTime}>
                        {selectedAssignment.etapas[0].fecha_entrega.toDate().toLocaleTimeString()}
                      </Text>
                    </View>
                    {selectedAssignment.etapas[0].archivos_adjuntos && selectedAssignment.etapas[0].archivos_adjuntos.length > 0 && (
                      <View style={styles.modalFilesContainer}>
                        <Text style={styles.modalFilesTitle}>Archivos adjuntos:</Text>
                        {selectedAssignment.etapas[0].archivos_adjuntos.map((archivo, fileIndex) => (
                          <View key={fileIndex} style={styles.modalFileItem}>
                            <FontAwesome name="file" size={16} color="#4B5563" style={styles.modalFileIcon} />
                            <Text style={styles.modalFileName}>{archivo.nombre}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.modalEtapaContainer}>
                    <Text style={styles.modalEtapaTitle}>Etapa {currentEtapaIndex + 1}</Text>
                    <Text style={styles.modalEtapaDescription}>
                      {selectedAssignment.etapas[currentEtapaIndex].descripcion}
                    </Text>
                    <View style={styles.modalEtapaDateContainer}>
                      <Text style={styles.modalEtapaDateLabel}>Fecha de entrega:</Text>
                      <Text style={styles.modalEtapaDate}>
                        {selectedAssignment.etapas[currentEtapaIndex].fecha_entrega.toDate().toLocaleDateString()}
                      </Text>
                      <Text style={styles.modalEtapaTime}>
                        {selectedAssignment.etapas[currentEtapaIndex].fecha_entrega.toDate().toLocaleTimeString()}
                      </Text>
                    </View>
                    {selectedAssignment.etapas[currentEtapaIndex].archivos_adjuntos && selectedAssignment.etapas[currentEtapaIndex].archivos_adjuntos.length > 0 && (
                      <View style={styles.modalFilesContainer}>
                        <Text style={styles.modalFilesTitle}>Archivos adjuntos:</Text>
                        {selectedAssignment.etapas[currentEtapaIndex].archivos_adjuntos.map((archivo, fileIndex) => (
                          <View key={fileIndex} style={styles.modalFileItem}>
                            <FontAwesome name="file" size={16} color="#4B5563" style={styles.modalFileIcon} />
                            <Text style={styles.modalFileName}>{archivo.nombre}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default EncargadoAssignments;