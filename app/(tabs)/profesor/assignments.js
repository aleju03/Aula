
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Modal, StyleSheet, Text, Pressable, View, TextInput} from 'react-native';
import { db } from '../../../utils/firebase';
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';


const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: 'black',
  },
  buttonClose: {
    backgroundColor: 'red',
  },
  buttonConfirm: {
    backgroundColor: 'green',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalTextTop: {
    fontSize: 20,
    color: 'blue',
    marginBottom: 15,
    textAlign: 'center',
  },
    form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 1,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 20,
  },

});

const ProfesorAssignments = () => {
  
  const [modalVisible, setModalVisible] = useState(false);
  const [asignaciones, setAsignaciones] = useState([]);
  const [profesor, setProfesor] = useState('');

  useEffect(() => {
    const fetchProfesorData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const profesorQuery = query(collection(db, 'Usuarios'), where('carne', '==', userId));
        const profesorSnapshot = await getDocs(profesorQuery);

        if (!profesorSnapshot.empty) {
          const profesorData = profesorSnapshot.docs[0].data();
          setProfesor(profesorData);
          alert(profesorData);
        }
      } catch (error) {
        console.error('Error al obtener los datos del profesor:', error);
      }
    };

    fetchProfesorData();
  }, []);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
  });

  const handleTitulo = (text) => {
    console.log(form.titulo);
    setForm((prevForm) => ({ ...prevForm, titulo: text }));
  };

  const handleDescripcion = (text) => {
    console.log(form.descripcion);
    setForm((prevForm) => ({ ...prevForm, descripcion: text }));
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTextTop}>Creacion de Asignacion</Text>

            <Text style={styles.label}>Grupo</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre de la Asignacion</Text>
                  <TextInput
                    style={styles.input}
                    value={form.titulo}
                    onChangeText={handleTitulo}
                    placeholder="Nombre de la tarea"
                    placeholderTextColor="#6b7280"
                    keyboardType="default"
                  />
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Descripcion</Text>
                  <TextInput
                    style={styles.input}
                    value={form.descripcion}
                    onChangeText={handleDescripcion}
                    placeholder="Un breve resumen de lo que trata la tarea"
                    placeholderTextColor="#6b7280"
                    keyboardType="default"
                  />
              </View>
            </View>

            <Text style={styles.modalText}>Fecha de Entrega</Text>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonConfirm]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.textStyle}>Crear Asignacion</Text>
      </Pressable>
    </View>
  );
};


export default ProfesorAssignments;