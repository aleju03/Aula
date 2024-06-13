import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, List, Divider, Card, Title, Paragraph, Button } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChalkboardTeacher, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { db } from '../../../utils/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfesorHome = () => {
  const [profesor, setProfesor] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [totalAsignaciones, setTotalAsignaciones] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupAssignments, setGroupAssignments] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchProfesorData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const profesorQuery = query(collection(db, 'Usuarios'), where('carne', '==', userId));
        const unsubscribeProfesor = onSnapshot(profesorQuery, (snapshot) => {
          if (!snapshot.empty) {
            const profesorData = snapshot.docs[0].data();
            setProfesor({ id: snapshot.docs[0].id, ...profesorData });

            const gruposQuery = query(collection(db, 'Grupos'), where('docente', '==', snapshot.docs[0].ref));
            const unsubscribeGrupos = onSnapshot(gruposQuery, (gruposSnapshot) => {
              const gruposData = gruposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setGrupos(gruposData);
            });

            const asignacionesQuery = query(collection(db, 'Asignaciones'), where('docente', '==', snapshot.docs[0].ref));
            const unsubscribeAsignaciones = onSnapshot(asignacionesQuery, (asignacionesSnapshot) => {
              setTotalAsignaciones(asignacionesSnapshot.size);
            });

            return () => {
              unsubscribeGrupos();
              unsubscribeAsignaciones();
            };
          }
        });

        return () => {
          unsubscribeProfesor();
        };
      } catch (error) {
        console.error('Error al obtener los datos del profesor:', error);
      }
    };

    fetchProfesorData();
  }, []);

  const handleVerAsignaciones = () => {
    router.push('/profesor/assignments');
  };

  const handleGroupPress = async (group) => {
    setSelectedGroup(group);

    const encargadosPromises = group.encargados.map((encargadoRef) => getDocs(query(collection(db, 'Usuarios'), where('__name__', '==', encargadoRef.id))));
    const encargadosSnapshots = await Promise.all(encargadosPromises);
    const encargadosData = encargadosSnapshots.map((snapshot) => snapshot.docs[0].data());

    const groupMembersData = encargadosData.flatMap((encargado) => {
      if (encargado.estudiantes && encargado.estudiantes.length > 0) {
        return encargado.estudiantes;
      } else {
        return { nombre: encargado.nombre };
      }
    });

    setGroupMembers(groupMembersData);

    const assignmentsQuery = query(collection(db, 'Asignaciones'), where('grupo', '==', group.id));
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const assignmentsData = assignmentsSnapshot.docs.map((doc) => doc.data());
    setGroupAssignments(assignmentsData);
  };

  const handleMemberMessage = (member) => {
    // Handle messaging logic for the selected member
    console.log('Message member:', member);
  };

  const handleGroupMessage = () => {
    // Handle messaging logic for the entire group
    console.log('Message group:', selectedGroup);
  };

  const renderGrupoItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleGroupPress(item)}>
      <List.Item
        title={item.nombre}
        description={`Integrantes: ${item.encargados.length}`}
        left={props => <List.Icon {...props} icon={() => <MaterialCommunityIcons name="account-group" size={24} color="#888" />} />}
      />
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberName}>{item.nombre}</Text>
      <TouchableOpacity onPress={() => handleMemberMessage(item)}>
        <FontAwesomeIcon icon={faEnvelope} size={20} color="#075eec" />
      </TouchableOpacity>
    </View>
  );

  const renderAssignmentItem = ({ item }) => (
    <View style={styles.assignmentItem}>
      <Text style={styles.assignmentTitle}>{item.titulo}</Text>
      <Text style={styles.assignmentDescription}>{item.descripcion}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={64} icon={() => <FontAwesomeIcon icon={faChalkboardTeacher} size={32} color="#ffffff" />} />
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Bienvenido, {profesor?.nombre.split(' ')[0]}</Text>
          <Text style={styles.subtitleText}>Aquí tienes un resumen de tu actividad.</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Total de Asignaciones</Title>
          <Paragraph style={styles.cardValue}>{totalAsignaciones}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <TouchableOpacity style={styles.button} onPress={handleVerAsignaciones}>
            <Text style={styles.buttonText}>Ver Asignaciones</Text>
          </TouchableOpacity>
        </Card.Actions>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grupos a Cargo</Text>
        {grupos.length > 0 ? (
          <FlatList
            data={grupos}
            renderItem={renderGrupoItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={Divider}
          />
        ) : (
          <Text style={styles.emptyText}>No tienes grupos asignados.</Text>
        )}
      </View>

      <Modal visible={selectedGroup !== null} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{selectedGroup?.nombre}</Text>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Integrantes:</Text>
            {groupMembers.length > 0 ? (
              <FlatList
                data={groupMembers}
                renderItem={renderMemberItem}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={Divider}
              />
            ) : (
              <Text style={styles.emptyText}>No hay estudiantes en este grupo.</Text>
            )}
          </View>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Asignaciones:</Text>
            {groupAssignments.length > 0 ? (
              <FlatList
                data={groupAssignments}
                renderItem={renderAssignmentItem}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={Divider}
              />
            ) : (
              <Text style={styles.emptyText}>No hay asignaciones para este grupo.</Text>
            )}
          </View>
          <TouchableOpacity style={styles.groupMessageButton} onPress={handleGroupMessage}>
            <FontAwesomeIcon icon={faEnvelope} size={20} color="#fff" style={styles.groupMessageIcon} />
            <Text style={styles.groupMessageText}>Mensaje Grupal</Text>
          </TouchableOpacity>
          <Button mode="contained" onPress={() => setSelectedGroup(null)} style={styles.modalButton}>
            Cerrar
          </Button>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    marginLeft: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#888',
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#075eec',
    lineHeight: 30,
  },
  button: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  memberName: {
    fontSize: 16,
  },
  assignmentItem: {
    paddingVertical: 10,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#888',
  },
  groupMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#075eec',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 20,
  },
  groupMessageIcon: {
    marginRight: 8,
  },
  groupMessageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ProfesorHome;