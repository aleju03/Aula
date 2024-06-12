// Al entrar a un grupo, se ven todos los integrantes (estudiantes) y sus respectivos encargados
// Hay un botón para mensajear un encargado

// Tareas: Total de asignaciones pasará a ser "Asignaciones activas"
// Falta arreglar state management acá y en profile.js para que los datos no spawneen on the go, que salga todo pre cargado
// Falta la pantalla tras clickear en un grupo

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, List, Divider, Card, Title, Paragraph } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { db } from '../../../utils/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfesorHome = () => {
  const [profesor, setProfesor] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [totalAsignaciones, setTotalAsignaciones] = useState(0);

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

  const renderGrupoItem = ({ item }) => (
    <List.Item
      title={item.nombre}
      description={`Integrantes: ${item.encargados.length}`}
      left={props => <List.Icon {...props} icon={() => <MaterialCommunityIcons name="account-group" size={24} color="#888" />} />}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={64} icon={() => <FontAwesomeIcon icon={faChalkboardTeacher} size={32} color="#ffffff" />} />
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Bienvenido, {profesor && profesor.nombre ? profesor.nombre.split(' ')[0] : ''}</Text>
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
});

export default ProfesorHome;