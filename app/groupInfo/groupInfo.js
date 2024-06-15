import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

const GroupInfoScreen = () => {
  const router = useRouter();
  const { group } = useLocalSearchParams();
  const parsedGroup = JSON.parse(group);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{parsedGroup?.nombre}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={goBack}>
          <Ionicons name="close" style={styles.closeIcon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.integrantesTitle}>Integrantes:</Text>
      <ScrollView style={styles.memberList}>
        {memberList.length > 0 ? (
          memberList.map((member, index) => {
            const role = member.estudiantes ? 'estudiante' : 'encargado';
            return renderMemberItem(member, `${role}_${index}`);
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No members found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default GroupInfoScreen;