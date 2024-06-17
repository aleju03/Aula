import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 28,
    color: '#6B7280',
  },
  memberList: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  memberIcon: {
    fontSize: 24,
    color: '#6B7280',
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    color: '#1F2937',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  integrantesTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 10,
  },
  assignmentsContainer: {
    marginTop: 20,
  },
  assignmentItem: {
    backgroundColor: '#F9FAFB',
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
  assignmentDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  paginationButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  paginationButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  paginationActiveButton: {
    backgroundColor: '#1F2937',
  },
  paginationActiveButtonText: {
    color: '#FFFFFF',
  },
});

const GroupInfoScreen = () => {
  const router = useRouter();
  const { group } = useLocalSearchParams();
  const parsedGroup = JSON.parse(group);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(15);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'Asignaciones'), where('grupo', '==', parsedGroup.id));
      const querySnapshot = await getDocs(q);
      const fetchedAssignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignments(fetchedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to fetch assignments');
    }
    setLoading(false);
  };

  const renderMemberItem = (member, role) => (
    <View key={`${member.id}_${role}`} style={styles.memberItem}>
      <Ionicons name="person" style={styles.memberIcon} />
      <Text style={styles.memberName}>{member.nombre}</Text>
    </View>
  );

  const goBack = () => {
    router.back();
  };

  const uniqueMembers = new Set();

  parsedGroup?.encargados.forEach((encargado) => {
    if (encargado.estudiantes && encargado.estudiantes.length > 0) {
      encargado.estudiantes.forEach((estudiante) => {
        uniqueMembers.add(JSON.stringify(estudiante));
      });
    } else {
      uniqueMembers.add(JSON.stringify(encargado));
    }
  });

  const memberList = Array.from(uniqueMembers).map((memberString) => JSON.parse(memberString));

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = memberList.slice(indexOfFirstMember, indexOfLastMember);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(memberList.length / membersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{parsedGroup?.nombre}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={goBack}>
          <Ionicons name="close" style={styles.closeIcon} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.integrantesTitle}>Integrantes:</Text>
        <View style={styles.memberList}>
          {currentMembers.length > 0 ? (
            currentMembers.map((member, index) => {
              const role = member.estudiantes ? 'estudiante' : 'encargado';
              return renderMemberItem(member, `${role}_${index}`);
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No members found</Text>
            </View>
          )}
        </View>
        <View style={styles.paginationContainer}>
          {pageNumbers.map((number) => (
            <TouchableOpacity
              key={number}
              style={[
                styles.paginationButton,
                currentPage === number && styles.paginationActiveButton,
              ]}
              onPress={() => paginate(number)}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === number && styles.paginationActiveButtonText,
                ]}
              >
                {number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.assignmentsContainer}>
          <Text style={styles.integrantesTitle}>Asignaciones:</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#075eec" />
          ) : (
            assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <View key={index} style={styles.assignmentItem}>
                  <Text style={styles.assignmentTitle}>{assignment.titulo}</Text>
                  {assignment.etapas.map((etapa, etapaIndex) => (
                    <Text key={etapaIndex} style={styles.assignmentDate}>
                      Fecha de entrega: {etapa.fecha_entrega.toDate().toLocaleDateString()}
                    </Text>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay asignaciones</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupInfoScreen;