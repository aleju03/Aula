import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

const EncargadoAssignments = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Encargado Asignaciones</Text>
    </View>
  );
};

export default EncargadoAssignments;