
import React, {useState} from 'react';
import {Alert, TouchableOpacity, Modal, Button, StyleSheet,FlatList, Text, Pressable, View, TextInput} from 'react-native';
import { useSelector } from 'react-redux';
import { db } from '../../../utils/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';


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
  modalItem: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'gray', 
    width: '100%', 
    alignItems: 'center' 
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
  selector: { 
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1, 
    justifyContent: 'center', 
    marginBottom: 12, 
    paddingHorizontal: 8 
  },
});

const ProfesorAssignments = () => {
  
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');  
  const [descripcion, setDescripcion] = useState('');
  const [groupId, setGroupId] = useState('');

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
  });

  const handleGroupPress = (group) => {
    setSelectedGroup(group);
    setGroupModalVisible(false);
  };

  const handleCreateAssignment = async () => {
    if (!titulo || !descripcion || !selectedGroup) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    try {
      
      await addDoc(collection(db, 'Asignaciones'), {
        archivos_adjuntos: '',
        descripcion,
        fecha_entrega: new Date(),
        grupo: '/Grupos/' + selectedGroup.id,
        titulo,
      });
      setModalVisible(!modalVisible);
      Alert.alert('Éxito', 'Se creo la asignacion');
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al crear la asignacion');
    }
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

            <TouchableOpacity
        style={styles.selector}
        onPress={() => setGroupModalVisible(true)}
      >
        <Text>{selectedGroup ? selectedGroup.nombre : 'Seleccionar Grupo'}</Text>
      </TouchableOpacity>
        <Modal
                transparent={true}
                visible={groupModalVisible}
                onRequestClose={() => setGroupModalVisible(false)}
             >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              data={user?.groups || []}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleGroupPress(item)}
                >
                  <Text>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Cerrar" onPress={() => setGroupModalVisible(false)} />
          </View>
        </View>
      </Modal>

            

            <Text style={styles.label}>Nombre</Text>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                
                  <TextInput
                    style={styles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder="Nombre de la tarea"
                    placeholderTextColor="#6b7280"
                    keyboardType="default"
                  />

              </View>
            </View>

            <Text style={styles.label}>Descripcion</Text>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Un breve resumen de lo que trata la tarea"
                    placeholderTextColor="#6b7280"
                    keyboardType="default"
                  />
              </View>
            </View>

            <Text style={styles.label}>Fecha de Entrega</Text>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonConfirm]}
              onPress={() => handleCreateAssignment()}>
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