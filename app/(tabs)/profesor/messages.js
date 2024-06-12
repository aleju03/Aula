import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import firebase from '../../utils/firebase'; // Asegúrate de ajustar la ruta si es necesario

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 8,
  },
  button: {
    marginBottom: 20,
  },
});

const ProfesorMessages = () => {
  const [specificMessage, setSpecificMessage] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  // Función para enviar mensaje específico
  const sendSpecificMessage = () => {
    selectedRecipients.forEach(recipient => {
      firebase.database().ref(`messages/${recipient}`).push({
        message: specificMessage,
        timestamp: new Date().toISOString(),
      });
    });
    alert('Mensaje específico enviado');
    setSpecificMessage('');
  };

  // Función para enviar mensaje general
  const sendGeneralMessage = () => {
    firebase.database().ref('groups/encargados').once('value', snapshot => {
      const encargados = snapshot.val();
      Object.keys(encargados).forEach(encargado => {
        firebase.database().ref(`messages/${encargado}`).push({
          message: generalMessage,
          timestamp: new Date().toISOString(),
        });
      });
    });
    alert('Mensaje general enviado');
    setGeneralMessage('');
  };

  // Renderizar la lista de destinatarios (simulada por ahora)
  const renderRecipient = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{item}</Text>
      <Button
        title="Seleccionar"
        onPress={() => setSelectedRecipients([...selectedRecipients, item])}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Enviar Mensaje Específico</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe tu mensaje"
        value={specificMessage}
        onChangeText={setSpecificMessage}
      />
      <FlatList
        data={recipients}
        renderItem={renderRecipient}
        keyExtractor={(item) => item}
      />
      <Button title="Enviar Mensaje Específico" onPress={sendSpecificMessage} style={styles.button} />

      <Text style={styles.text}>Enviar Mensaje General</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe tu mensaje"
        value={generalMessage}
        onChangeText={setGeneralMessage}
      />
      <Button title="Enviar Mensaje General" onPress={sendGeneralMessage} style={styles.button} />
    </View>
  );
};

export default ProfesorMessages;
